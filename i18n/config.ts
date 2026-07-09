export const locales = ['en', 'uk', 'pl', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
  pl: 'Polski',
  es: 'Español',
};
