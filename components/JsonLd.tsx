import { getTranslations } from 'next-intl/server';
import { CONTACT_EMAIL, CONTACT_PHONE_HREF, TELEGRAM_URL } from '@/lib/links';

const SITE_URL = 'https://multicargoltd.com';

/**
 * Organization structured data (JSON-LD). Only facts already published on the site:
 * name, founding year, contacts, the Kyiv office address and the Telegram profile.
 */
export default async function JsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Meta' });

  const data = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE_URL}/#organization`,
    name: 'Multicargo Logistics Group',
    legalName: 'ТОВ «Мультикарго»',
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/img/og-image.jpg`,
    description: t('description'),
    foundingDate: '2007',
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_HREF.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dniprovska Naberezna St, 19A',
      addressLocality: 'Kyiv',
      postalCode: '02081',
      addressCountry: 'UA',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: CONTACT_PHONE_HREF.replace('tel:', ''),
        email: CONTACT_EMAIL,
        availableLanguage: ['en', 'uk', 'pl', 'es'],
      },
    ],
    sameAs: [TELEGRAM_URL],
  };

  return (
    <script
      type="application/ld+json"
      // "<" is escaped so the JSON can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
