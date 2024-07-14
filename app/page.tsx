import Hero from '../components/HomePage/Heroo';
import { About } from '../components/HomePage/About';
import Testimonials from '@/components/HomePage/Testimonials';
import Pricing from '@/components/HomePage/Pricing';
import Contact from '../components/HomePage/Contact';

import Head from 'next/head';
import { siteConfig } from '@/config/site';

export default function Home() {
  return (
    <section>
      <Head>
        <title>{siteConfig.name} - Learn English Online</title>
        <meta
          name="description"
          content="Tutee - Learn English with personalized tutoring sessions"
        />
        <meta
          name="keywords"
          content="Tutee, Tutee English, online English tutor, English lessons"
        />
        <meta name="author" content="Tutee" />
        <meta property="og:title" content="Tutee - Your Online English Tutor" />
        <meta
          property="og:description"
          content="Tutee - Learn English with personalized tutoring sessions"
        />
        {/* <meta property="og:image" content="/path/to/your/image.jpg" /> */}
        <meta property="og:url" content="https://tutee.co.uk" />
      </Head>

      <Hero />
      <div className="new-section"></div>
      <About />
      <div className="new-section"></div>
      <Testimonials />
      <div className="new-section"></div>
      <Pricing />
      <div className="new-section"></div>
      <Contact />
    </section>
  );
}
