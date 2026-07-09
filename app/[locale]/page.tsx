import { unstable_setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import About from '@/components/About';
import Services from '@/components/Services';
import Stats from '@/components/Stats';
import Carriers from '@/components/Carriers';
import Relocants from '@/components/Relocants';
import HotOffers from '@/components/HotOffers';
import Careers from '@/components/Careers';
import Partners from '@/components/Partners';
import Downloads from '@/components/Downloads';
import Contact from '@/components/Contact';
import ChatAgent from '@/components/ChatAgent';
import Footer from '@/components/Footer';

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
        <About />
        <Services />
        <Stats />
        <Carriers />
        <Relocants />
        <HotOffers />
        <Careers />
        <Partners />
        <Downloads />
        <Contact />
      </main>
      <Footer />
      <ChatAgent />
    </>
  );
}
