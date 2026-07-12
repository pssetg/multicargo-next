import dynamic from 'next/dynamic';
import { unstable_setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import About from '@/components/About';
import Network from '@/components/Network';
import Services from '@/components/Services';
import Careers from '@/components/Careers';
import Partners from '@/components/Partners';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ChatAgentLoader from '@/components/ChatAgentLoader';

// Heavy below-the-fold section — code-split into its own chunk (kept SSR'd for SEO)
const Downloads = dynamic(() => import('@/components/Downloads'));

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Enable static rendering
  unstable_setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        {/* About mega-card contains Stats + Carriers + Company Evolution */}
        <About />
        <Network />
        <Services />
        <Careers />
        <Partners />
        <Downloads />
        <Contact />
      </main>
      <Footer />
      <ChatAgentLoader />
    </>
  );
}
