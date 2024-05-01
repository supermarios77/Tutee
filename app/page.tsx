import Hero from "../components/Heroo";
import { About } from '../components/About';
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Contact from '../components/Contact';

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
