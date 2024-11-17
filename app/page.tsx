'use client';
import { useEffect, ReactNode } from 'react';
import Head from 'next/head';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Hero from '../components/HomePage/Heroo';
import { About } from '../components/HomePage/About';
import Testimonials from '@/components/HomePage/Testimonials';
import Pricing from '@/components/HomePage/Pricing';
import Contact from '../components/HomePage/Contact';
import { siteConfig } from '@/config/site';

interface SectionWrapperProps {
  children: ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.5 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 20 },
      }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  return (
    <>
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
        <meta property="og:url" content="https://tutee.co.uk" />
        <link rel="canonical" href="https://tutee.co.uk" />
      </Head>

      <main className="overflow-hidden">
        <Hero />

        <SectionWrapper>
          <About />
        </SectionWrapper>

        <SectionWrapper>
          <Testimonials />
        </SectionWrapper>

        <SectionWrapper>
          <Pricing />
        </SectionWrapper>

        <SectionWrapper>
          <Contact />
        </SectionWrapper>
      </main>
    </>
  );
}
