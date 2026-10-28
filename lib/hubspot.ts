// Server-side HubSpot helpers used by /api/chat-lead. Same behaviour as the
// helpers in app/api/hubspot-lead/route.ts (timeout 8s, one retry on 429/5xx).
// Logs only a short label + HTTP status — never the token, response bodies or
// any lead data.

const HUBSPOT_API = 'https://api.hubapi.com';
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 1000;
const LOG_PREFIX = '[hubspot]';

// HubSpot-defined association type ids
const ASSOC_DEAL_TO_CONTACT = 3;
const ASSOC_NOTE_TO_CONTACT = 202;
const ASSOC_NOTE_TO_DEAL = 214;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function hubspot<T>(
  token: string,
  label: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT',
  path: string,
  body?: unknown,
): Promise<T | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${HUBSPOT_API}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      if (res.ok) return res.status === 204 ? ({} as T) : ((await res.json()) as T);

      const retryable = res.status === 429 || res.status >= 500;
      console.error(`${LOG_PREFIX} ${label} failed: HTTP ${res.status}`);
      if (!retryable || attempt === 1) return null;
    } catch (error) {
      const reason = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network error';
      console.error(`${LOG_PREFIX} ${label} failed: ${reason}`);
      if (attempt === 1) return null;
    } finally {
      clearTimeout(timer);
    }
    await sleep(RETRY_DELAY_MS);
  }
  return null;
}

const PIPELINE_LABEL = 'Freight Forwarding Sales Pipeline';
const STAGE_LABEL = 'Lead Captured';
let cachedStage: { pipeline: string; stage: string } | null = null;

/** Pipeline + first stage: env override, else "Freight Forwarding Sales Pipeline" / "Lead Captured", else first pipeline's first stage. */
export async function getPipelineStage(token: string): Promise<{ pipeline: string; stage: string } | null> {
  const envPipeline = process.env.HUBSPOT_PIPELINE_ID;
  const envStage = process.env.HUBSPOT_DEAL_STAGE_ID;
  if (envPipeline && envStage) return { pipeline: envPipeline, stage: envStage };
  if (cachedStage) return cachedStage;

  type Stage = { id: string; label?: string; displayOrder: number };
  type Pipelines = { results?: { id: string; label?: string; displayOrder?: number; stages?: Stage[] }[] };
  const data = await hubspot<Pipelines>(token, 'get pipelines', 'GET', '/crm/v3/pipelines/deals');
  const pipelines = data?.results ?? [];
  if (pipelines.length === 0) return null;

  const sorted = [...pipelines].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const pipeline = sorted.find((p) => p.label === PIPELINE_LABEL) ?? sorted[0];
  const stages = [...(pipeline.stages ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const stage = stages.find((s) => s.label === STAGE_LABEL) ?? stages[0];
  if (!stage) return null;

  cachedStage = { pipeline: pipeline.id, stage: stage.id };
  return cachedStage;
}

export type LeadContact = { email: string; phone: string; name: string };

/** Finds a contact by email (else normalised phone), updates it with non-empty values, or creates it. */
export async function upsertContact(token: string, lead: LeadContact): Promise<string | null> {
  const [firstname, ...rest] = lead.name.split(/\s+/).filter(Boolean);
  const lastname = rest.join(' ');

  // Only non-empty values, so an existing contact's data is never blanked.
  const properties: Record<string, string> = {};
  if (firstname) properties.firstname = firstname;
  if (lastname) properties.lastname = lastname;
  if (lead.phone) properties.phone = lead.phone;

  const [searchProp, searchValue] = lead.email ? ['email', lead.email] : ['phone', lead.phone];
  const found = await hubspot<{ results?: { id: string }[] }>(
    token,
    'search contact',
    'POST',
    '/crm/v3/objects/contacts/search',
    { filterGroups: [{ filters: [{ propertyName: searchProp, operator: 'EQ', value: searchValue }] }], limit: 1 },
  );
  if (!found) return null;

  const existingId = found.results?.[0]?.id;
  if (existingId) {
    if (Object.keys(properties).length > 0) {
      const updated = await hubspot(token, 'update contact', 'PATCH', `/crm/v3/objects/contacts/${existingId}`, {
        properties,
      });
      if (!updated) return null;
    }
    return existingId;
  }

  const created = await hubspot<{ id: string }>(token, 'create contact', 'POST', '/crm/v3/objects/contacts', {
    properties: { ...(lead.email ? { email: lead.email } : {}), ...properties },
  });
  return created?.id ?? null;
}

export async function createDeal(
  token: string,
  deal: { name: string; description: string; contactId?: string },
): Promise<string | null> {
  const target = await getPipelineStage(token);
  if (!target) return null;

  const created = await hubspot<{ id: string }>(token, 'create deal', 'POST', '/crm/v3/objects/deals', {
    properties: {
      dealname: deal.name,
      description: deal.description,
      pipeline: target.pipeline,
      dealstage: target.stage,
    },
    associations: deal.contactId
      ? [
          {
            to: { id: deal.contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: ASSOC_DEAL_TO_CONTACT }],
          },
        ]
      : [],
  });
  return created?.id ?? null;
}

export async function updateDeal(
  token: string,
  dealId: string,
  properties: Record<string, string>,
): Promise<boolean> {
  return (await hubspot(token, 'update deal', 'PATCH', `/crm/v3/objects/deals/${dealId}`, { properties })) !== null;
}

export async function associateDealWithContact(token: string, dealId: string, contactId: string): Promise<boolean> {
  const res = await hubspot(
    token,
    'associate deal-contact',
    'PUT',
    `/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`,
    [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: ASSOC_DEAL_TO_CONTACT }],
  );
  return res !== null;
}

/** Creates a note attached to the deal (and the contact, if any). Returns the note id. */
export async function createNote(
  token: string,
  body: string,
  dealId: string,
  contactId?: string,
): Promise<string | null> {
  const associations = [
    { to: { id: dealId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: ASSOC_NOTE_TO_DEAL }] },
    ...(contactId
      ? [
          {
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: ASSOC_NOTE_TO_CONTACT }],
          },
        ]
      : []),
  ];
  const created = await hubspot<{ id: string }>(token, 'create note', 'POST', '/crm/v3/objects/notes', {
    properties: { hs_note_body: body, hs_timestamp: new Date().toISOString() },
    associations,
  });
  return created?.id ?? null;
}

export async function updateNote(token: string, noteId: string, body: string): Promise<boolean> {
  return (
    (await hubspot(token, 'update note', 'PATCH', `/crm/v3/objects/notes/${noteId}`, {
      properties: { hs_note_body: body },
    })) !== null
  );
}

export async function associateNoteWithContact(token: string, noteId: string, contactId: string): Promise<boolean> {
  const res = await hubspot(
    token,
    'associate note-contact',
    'PUT',
    `/crm/v4/objects/notes/${noteId}/associations/contacts/${contactId}`,
    [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: ASSOC_NOTE_TO_CONTACT }],
  );
  return res !== null;
}

let cachedPortalId: string | null = null;

/** HUBSPOT_PORTAL_ID env if set, else fetched once from the account-info API. Null if unavailable. */
export async function getPortalId(token: string): Promise<string | null> {
  if (process.env.HUBSPOT_PORTAL_ID) return process.env.HUBSPOT_PORTAL_ID;
  if (cachedPortalId) return cachedPortalId;
  const info = await hubspot<{ portalId?: number }>(token, 'account info', 'GET', '/account-info/v3/details');
  if (info?.portalId) cachedPortalId = String(info.portalId);
  return cachedPortalId;
}
