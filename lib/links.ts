// Public contact channels (safe to expose to the browser)
export const WHATSAPP_URL = 'https://wa.me/380772090300';
export const TELEGRAM_URL = 'https://t.me/multicargoltd';
export const CONTACT_EMAIL = 'info@multicargoltd.com';
export const CONTACT_PHONE = '+38 (044) 209-03-00';
export const CONTACT_PHONE_HREF = 'tel:+380442090300';
export const CONTACT_ADDRESS = 'Dniprovska Naberezna St, 19A, Kyiv 02081, Ukraine';

// Privacy policy page per locale (app/[locale]/privacy).
export const PRIVACY_POLICY_URL: Record<string, string> = {
  en: '/en/privacy',
  uk: '/uk/privacy',
  pl: '/pl/privacy',
  es: '/es/privacy',
};

// "Last updated" date shown on the privacy policy (YYYY-MM-DD). Update it when the policy text changes.
export const PRIVACY_POLICY_DATE = '2026-10-29';
