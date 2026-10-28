// Contact detection shared by the chat. Mirrors the rules in
// components/Contact.tsx (splitContact) and app/api/hubspot-lead/route.ts
// (phone normalisation): email = has "@" and a valid format, otherwise phone;
// phone = optional leading "+" and digits, valid at 7–15 digits.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strips spaces, brackets, dashes etc.; keeps a leading "+" and digits. '' if not 7–15 digits. */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return '';
  return (raw.trim().startsWith('+') ? '+' : '') + digits;
}

export type ContactInfo = { email: string; phone: string };

/** A single "phone or email" field: valid email if it looks like one, otherwise a phone. */
export function splitContact(value: string): ContactInfo {
  const contact = value.trim();
  if (contact.includes('@') && EMAIL_RE.test(contact)) return { email: contact, phone: '' };
  return { email: '', phone: normalizePhone(contact) };
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
    const normalized = normalizePhone(candidate);
    if (!normalized) continue;
    const digitCount = normalized.replace(/\D/g, '').length;
    if (normalized.startsWith('+') || digitCount >= 9) {
      phone = normalized;
      break;
    }
  }
  return { email, phone };
}
