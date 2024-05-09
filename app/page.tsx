import Hero from "../components/HomePage/Heroo";
import { About } from '../components/HomePage/About';
import Testimonials from "@/components/HomePage/Testimonials";
import Pricing from "@/components/HomePage/Pricing";
import Contact from '../components/HomePage/Contact';

export default function Home() {
  return (
    <section>
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
