import Script from 'next/script';
import ClarityConsent from './ClarityConsent';

const GA_ID = 'G-SF432XQYNP';
const CLARITY_ID = 'x4wwvu16k6';

/**
 * Google Analytics 4 + Microsoft Clarity.
 * GA consent defaults to denied; the cookie banner flips analytics_storage
 * to granted on Accept. Clarity is not loaded at all until the visitor accepts
 * (see ClarityConsent).
 */
export default function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // Consent Mode: honour a previously stored choice so returning
          // visitors who accepted are granted on every load (otherwise consent
          // would reset to 'denied' each visit and GA would collect nothing).
          var mcConsent = 'denied';
          try { if (localStorage.getItem('cookieConsent') === 'accepted') mcConsent = 'granted'; } catch (e) {}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: mcConsent,
            wait_for_update: 500
          });
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <ClarityConsent clarityId={CLARITY_ID} />
    </>
  );
}
