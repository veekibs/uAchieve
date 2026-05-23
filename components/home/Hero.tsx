"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-[700px] flex items-center bg-[#F8FAFB] overflow-hidden pt-[56px]">
      {/* Subtle blue radial glow */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(41,171,226,0.08) 0%, rgba(41,171,226,0) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-[120px] relative z-10">

        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-bold text-5xl md:text-6xl text-[#1A2E3B] leading-[1.1] tracking-tight mb-6"
          >
            Accredited First Aid Training for a Safer Workplace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-[#4A5568] max-w-xl leading-[1.6] mb-10"
          >
            Gain the skills to respond confidently in any emergency. With 30+
            years of healthcare experience, UAchieve delivers HSE-recommended
            first aid courses across the UK.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/courses"
              className="flex items-center justify-center gap-2 bg-[#8DC63F] text-white text-[16px] font-medium h-[56px] px-8 rounded w-full sm:w-auto transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)]"
            >
              Browse Courses <ArrowRight size={18} />
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center bg-transparent border-[1.5px] border-[#1A2E3B] text-[#1A2E3B] text-[16px] font-medium h-[56px] px-8 rounded w-full sm:w-auto transition-all duration-300 hover:scale-[1.02] hover:bg-black/5"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 w-full relative"
        >
          <div className="relative aspect-[4/3] w-full rounded-[16px] overflow-hidden shadow-xl border border-black/5">
            <Image
              src="https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
              alt="First aid training session"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}