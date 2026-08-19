// GA4 lead tracking. Fires a single standard `generate_lead` event with a
// `lead_type` param so different intent points can be told apart in GA4.
// Respects Consent Mode automatically (gtag redacts when analytics is denied).

export type LeadType =
  | 'contact_form'
  | 'quote_request'
  | 'route_search'
  | 'whatsapp_click'
  | 'telegram_click'
  | 'phone_click'
  | 'email_click'
  | 'chat_message';

type Gtag = (...args: unknown[]) => void;

export function trackLead(leadType: LeadType): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === 'function') {
    gtag('event', 'generate_lead', { lead_type: leadType });
  }
}
