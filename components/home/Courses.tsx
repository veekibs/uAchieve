"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const courses = [
  {
    id: 1,
    slug: "basic-life-support",
    title: "Basic Life Support",
    badge: "Beginner Friendly",
    description:
      "Learn essential CPR techniques and basic life-saving skills. Perfect for anyone wanting to respond confidently in emergency situations.",
    duration: "3 Hours",
    classSize: "Max 12",
    price: "£85",
    image:
      "https://images.unsplash.com/photo-1672025680762-689225c75594?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  },
  {
    id: 2,
    slug: "emergency-first-aid-at-work",
    title: "Emergency First Aid at Work",
    badge: "HSE Approved",
    description:
      "Comprehensive workplace first aid training covering injuries, illnesses, and emergency protocols. Meets HSE requirements for workplace first aiders.",
    duration: "6 Hours",
    classSize: "Max 12",
    price: "£145",
    image:
      "https://images.unsplash.com/photo-1622115585848-1d5b6e8af4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  },
];

export function Courses() {
  const [activeTab, setActiveTab] = useState("All Courses");
  const tabs = ["All Courses", "For Beginners", "Refresher Courses"];

  return (
    <section className="py-[120px] bg-[#F8FAFB] relative z-10">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold text-[#1A2E3B] tracking-tight mb-3">
            Our Training Courses
          </h2>
          <p className="text-[16px] text-[#4A5568]">
            Choose the right course for your needs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center items-center gap-3 mb-20 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-[15px] font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#29ABE2] text-white shadow-md"
                  : "bg-transparent border border-gray-200 text-[#4A5568] hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group flex flex-col bg-[rgba(255,255,255,0.85)] backdrop-blur-[8px] rounded-[16px] border border-[rgba(255,255,255,0.6)] transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)]"
            >
              {/* Card Image */}
              <div className="relative aspect-video w-full rounded-t-[16px] overflow-hidden bg-gray-100">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />

                {/* Available Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-[4px] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm border border-white/40">
                  <div
                    className="w-2 h-2 rounded-full bg-[#8DC63F] animate-pulse"
                    style={{ animationDuration: "2s" }}
                  />
                  <span className="text-[11px] font-bold text-[#1A2E3B] uppercase tracking-wider">
                    Available
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-[20px] font-bold text-[#1A2E3B] mb-2 leading-tight">
                  {course.title}
                </h3>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-white border border-[#8DC63F]/40 text-[#1A2E3B] text-[12px] font-medium rounded-full shadow-sm">
                    {course.badge}
                  </span>
                </div>

                <p className="text-[#4A5568] text-[15px] leading-relaxed mb-8 flex-1">
                  {course.description}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center justify-between pt-6 mb-8 relative">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-200/50" />
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">
                      DURATION
                    </span>
                    <span className="font-bold text-[#1A2E3B] text-[15px]">
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">
                      CLASS SIZE
                    </span>
                    <span className="font-bold text-[#1A2E3B] text-[15px]">
                      {course.classSize}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] mb-1">
                      PRICE
                    </span>
                    <span className="font-bold text-[#1A2E3B] text-[15px]">
                      {course.price}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/courses/${course.slug}`}
                  className="w-full bg-[#29ABE2] group-hover:bg-[#8DC63F] text-white text-[15px] font-medium h-[48px] rounded-[12px] transition-colors duration-300 shadow-sm flex items-center justify-center"
                >
                  View Course Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}