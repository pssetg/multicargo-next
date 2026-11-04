// Contact detection shared by the chat. Mirrors the rules in
// components/Contact.tsx (splitContact) and app/api/hubspot-lead/route.ts
// (phone normalisation): email = has "@" and a valid format, otherwise phone;
// phone = optional leading "+" and digits, valid at 7–15 digits.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_RE = /^\+?\d{7,15}$/;

/**
 * Strict phone check: after removing spaces, brackets, hyphens and dots, an optional
 * leading "+" followed by 7–15 digits and nothing else. Returns the compact
 * form ("+380501234567"), or '' if the value is not a phone number.
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const compact = raw.trim().replace(/[\s().-]/g, '');
  return PHONE_RE.test(compact) ? compact : '';
}

export type ContactInfo = { email: string; phone: string };

/**
 * The single "phone or email" field. Returns the trimmed email, or the phone as typed
 * (trimmed), or null when the value is neither a valid email nor a valid phone number.
 */
export function parseContactField(value: string): ContactInfo | null {
  const contact = value.trim();
  if (contact.includes('@')) return EMAIL_RE.test(contact) ? { email: contact, phone: '' } : null;
  return normalizePhone(contact) ? { email: '', phone: contact } : null;
}

const EMAIL_IN_TEXT_RE = /[^\s@,;:()<>"']+@[^\s@,;:()<>"']+\.[^\s@,;:()<>"']+/;
const PHONE_IN_TEXT_RE = /\+?\d[\d\s().-]{5,}\d/g;

/**
 * Finds an email and/or phone inside free chat text. To avoid mistaking cargo
 * figures ("12500 kg") for phones, a number without a leading "+" must have
 * at least 9 digits.
 */
export function findContactInText(text: string): ContactInfo {
  const emailMatch = text.match(EMAIL_IN_TEXT_RE);
  const candidateEmail = emailMatch ? emailMatch[0].replace(/\.+$/, '') : '';
  const email = candidateEmail && EMAIL_RE.test(candidateEmail) ? candidateEmail : '';

  // Remove the email first so its digits can't be read as a phone number.
  const rest = emailMatch ? text.replace(emailMatch[0], ' ') : text;
  let phone = '';
  for (const candidate of rest.match(PHONE_IN_TEXT_RE) ?? []) {
    const normalized = normalizePhone(candidate.replace(/\./g, ''));
    if (!normalized) continue;
    const digitCount = normalized.replace(/\D/g, '').length;
    if (normalized.startsWith('+') || digitCount >= 9) {
      phone = normalized;
      break;
    }
  }
  return { email, phone };
}
