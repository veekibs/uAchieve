// app/page.tsx — drop this into your app/ folder

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { Features } from "@/components/home/Features";
import { Courses } from "@/components/home/Courses";
import { Accreditations } from "@/components/home/Accreditations";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Courses />
        <Features />
        <Accreditations />
      </main>
      <Footer />
    </>
  );
}