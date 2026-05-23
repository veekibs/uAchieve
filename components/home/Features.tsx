"use client";

import { Award, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    id: 1,
    icon: Award,
    title: "Fully Accredited Courses",
    description:
      "All training follows HSE guidelines and Resuscitation Council UK standards. Certificates valid for 3 years.",
  },
  {
    id: 2,
    icon: Users,
    title: "Small Class Sizes",
    description:
      "Maximum 12 participants per session ensures personalized attention and hands-on practice for every student.",
  },
  {
    id: 3,
    icon: Clock,
    title: "30+ Years Experience",
    description:
      "Delivered by qualified healthcare professionals with decades of real-world emergency response experience.",
  },
];

export function Features() {
  return (
    <section className="py-[120px] bg-[#F8FAFB]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold text-[#1A2E3B] tracking-tight mb-3">
            Why Choose UAchieve?
          </h2>
          <p className="text-[16px] text-[#4A5568]">
            Trusted first aid training with proven results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group bg-white rounded-[16px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F4F8] border-l-[3px] border-l-[#F0F4F8] transition-all duration-300 hover:-translate-y-1 hover:border-l-[#8DC63F]"
              >
                <div className="w-[48px] h-[48px] bg-[#29ABE2] group-hover:bg-[#8DC63F] rounded-[12px] flex items-center justify-center mb-6 transition-colors duration-300">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1A2E3B] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#4A5568] text-[15px] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}