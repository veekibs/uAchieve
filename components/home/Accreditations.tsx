"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  { name: "HSE", src: "/images/hse.png" },
  { name: "Resuscitation Council UK", src: "/images/rcuk.png" },
  { name: "FAIB", src: "/images/faib.png" },
  { name: "OFQUAL", src: "/images/ofqual.png" },
];

export function Accreditations() {
  return (
    <section className="py-[120px] bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-[28px] font-bold text-[#1A2E3B] tracking-tight mb-2">
          Recognised & Accredited
        </h2>
        <p className="text-[15px] text-[#4A5568] mb-16">
          Training you can trust from industry-leading organizations
        </p>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-[#F8FAFB] rounded-[12px] border border-transparent w-[200px] h-[120px] transition-all duration-200 ease-out hover:border-[#29ABE2] hover:-translate-y-[2px] flex items-center justify-center"
            >
              <div className="relative w-[120px] h-[60px]">
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  fill
                  className="object-contain grayscale opacity-55 transition-all duration-200 ease-out group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}