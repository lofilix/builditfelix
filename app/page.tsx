import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import GBAProjects from '@/components/sections/GBAProjects';
import About from '@/components/sections/About';
import Contact from '@/components/sections/Contact';
import SectionDivider from '@/components/ui/SectionDivider';

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded focus:bg-orange focus:text-dark focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:outline-none"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main-content">
        <Hero />
        <Services />
        <SectionDivider />
        <GBAProjects />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
