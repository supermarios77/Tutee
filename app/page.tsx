import Hero from "../components/Heroo";
import { About } from '../components/About';
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <section>
      <Hero />
      <About />
      <Testimonials />
    </section>
  );
}
