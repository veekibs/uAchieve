"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Award, ChevronRight, CheckCircle2, X, ChevronDown, Calendar, ShieldCheck, HelpCircle } from "lucide-react";
import BookingWidgetContent from "@/components/booking/BookingWidgetContent";

const courseImages: Record<string, string> = {
  bls: "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop",
  efaw: "https://images.unsplash.com/photo-1600091474842-83bb9c05a723?q=80&w=2148&auto=format&fit=crop",
};

interface CourseDetailClientProps {
  course: {
    slug: string;
    title: string;
    description: string;
    duration_hours: number;
    price: any;
    id: string; // Ensure ID is here
    badge_label?: string | null;
    overview?: string | null;
    learning_points?: string[];
    faqs?: Array<{ q: string; a: string }>;
    cancellation_policy?: Array<{ q: string; a: string; color: string }>;
    duration_text?: string;
    class_size?: string;
    accreditation?: string;
    training_type?: string;
    validity_text?: string;
    prerequisites?: string;
    sessions: any[]; // Ensure sessions are passed
  };
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openPolicy, setOpenPolicy] = useState<number | null>(0);
  const [sidebarScrolled, setSidebarScrolled] = useState(false);
  const priceString = `£${Number(course.price)}`;

  return (
    <div className="relative pb-16 lg:pb-24 font-['Plus_Jakarta_Sans']">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 w-full"
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#9CA3AF] mb-8">
          <Link href="/" className="hover:text-[#29ABE2]">Home</Link>
          <ChevronRight size={14} className="text-[#D1D5DB]" />
          <Link href="/courses" className="hover:text-[#29ABE2]">Courses</Link>
          <ChevronRight size={14} className="text-[#D1D5DB]" />
          <span className="text-[#4A5568]">{course.title}</span>
        </nav>

        {/* Page Hero Area */}
        <div className="mb-10">
          <div className="flex gap-3 mb-4">
            <span className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-lg text-xs font-semibold">HSE Approved</span>
            <span className="bg-lime-400/10 text-lime-400 px-3 py-1 rounded-lg text-xs font-semibold">Workplace Certified</span>
          </div>
          <h1 className="text-[32px] lg:text-[48px] font-bold text-[#1A2E3B] mb-6 leading-tight">
            {course.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-[#4A5568] text-[15px] border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#29ABE2]" />
              <span>{course.duration_hours} Hours (Full Day)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#29ABE2]" />
              <span>Max 12 Participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#29ABE2]" />
              <span>Certificate Valid 3 Years</span>
            </div>
          </div>
        </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* LEFT COLUMN: Course Info (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col gap-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative aspect-video w-full rounded-[16px] overflow-hidden shadow-sm"
          >
            <Image
              src={courseImages[course.slug] || "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop"}
              alt={course.title}
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.section
          >
            <h2 className="text-[22px] font-bold text-slate-800 mb-4">Course Overview</h2>
            <p className="text-[#4A5568] leading-relaxed text-[16px] mb-6">
              {course.overview || course.description}
            </p>
            
            <div className="bg-[#29ABE2]/5 border-l-4 border-[#29ABE2] p-5 rounded-r-[8px]">
              <p className="text-slate-800 text-[14px] font-medium leading-6">
                This course meets the legal requirements for workplace first aiders under the Health and Safety (First Aid) Regulations 1981. Certificates are valid for 3 years and are recognised by HSE.
              </p>
            </div>
          </motion.section>

          <section>
              <h2 className="text-[22px] font-bold text-[#1A2E3B] mb-6">What You&apos;ll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(course.learning_points || []).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="size-5 bg-lime-400 rounded flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                  <span className="text-[#4A5568] text-[15px]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10">
              {[
                { label: "Duration", val: course.duration_text || `${course.duration_hours} Hours` },
                { label: "Class Size", val: course.class_size || "Max 12" },
                { label: "Accreditation", val: course.accreditation || "HSE & RCUK" },
                { label: "Type", val: course.training_type || "In Person" },
                { label: "Validity", val: course.validity_text || "3 Years" },
                { label: "Prerequisites", val: course.prerequisites || "None" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
                    {item.label}
                  </span>
                  <span className="text-[#1A2E3B] text-[15px] font-bold leading-tight">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Cancellation Policy Section */}
          <section>
            <h2 className="text-[22px] font-bold text-slate-800 mb-6">Cancellation Policy</h2>
            <div className="flex flex-col border-t border-slate-100">
              {(course.cancellation_policy || []).map((policy, i) => (
                <div key={i} className="border-b border-slate-100">
                  <button 
                    onClick={() => setOpenPolicy(openPolicy === i ? null : i)} 
                    className="w-full flex justify-between items-center py-5 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-2 rounded-full ${policy.color}`} />
                      <span className={`text-[15px] font-bold transition-colors ${openPolicy === i ? 'text-sky-500' : 'text-slate-800'}`}>
                        {policy.q}
                      </span>
                    </div>
                    <ChevronDown size={20} className={`text-gray-300 transition-transform ${openPolicy === i ? 'rotate-180 text-sky-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openPolicy === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pb-5 px-5 bg-gray-50 rounded-xl mb-4">
                          <p className="text-[#4A5568] text-[14px] leading-relaxed pt-4">{policy.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-[22px] font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
            <div className="flex flex-col border-t border-slate-100">
              {(course.faqs || []).map((faq, i) => (
                <div key={i} className="border-b border-slate-100">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center py-5 text-left group">
                    <span className={`text-[15px] font-bold transition-colors ${openFaq === i ? 'text-sky-500' : 'text-slate-800'}`}>{faq.q}</span>
                    <ChevronDown size={20} className={`text-gray-300 transition-transform ${openFaq === i ? 'rotate-180 text-sky-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="text-[#4A5568] text-[15px] leading-relaxed pb-5">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (Desktop Sidebar) */}
        <aside 
          onScroll={(e) => {
            if (e.currentTarget.scrollTop > 10) setSidebarScrolled(true);
            else setSidebarScrolled(false);
          }}
          className="hidden lg:block w-[40%] sticky top-[120px] max-h-[calc(100vh-160px)] overflow-y-auto rounded-[16px] relative border border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.08)] bg-white"
        >
          <BookingWidgetContent 
            price={priceString} 
            courseTitle={course.title} 
            slug={course.slug} 
            courseId={course.id} 
            sessions={course.sessions} 
          />
          
          <AnimatePresence>
            {!sidebarScrolled && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="sticky bottom-6 left-0 right-0 flex justify-center pointer-events-none z-10"
              >
                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-sky-100 shadow-xl flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#29ABE2] uppercase tracking-[0.2em] ml-1">Scroll to Book</span>
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ChevronDown size={14} className="text-[#29ABE2]" strokeWidth={3} />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
      </motion.div>

      {/* 1. STICKY MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-slate-200 px-6 flex items-center justify-between z-40 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col">
          <span className="text-slate-800 text-2xl font-bold leading-6">{priceString}</span>
          <span className="text-gray-400 text-[12px] font-medium">Per person</span>
        </div>
        <button 
          onClick={() => {
            console.log("DEBUG: Mobile 'Book Now' clicked. isCalendarOpen was:", isCalendarOpen);
            setIsCalendarOpen(true);
          }}
          className="bg-[#8DC63F] text-white px-8 h-[48px] rounded-full font-bold text-base active:scale-95 transition-transform shadow-lg shadow-lime-400/20"
        >
          Book Now
        </button>
      </div>

      {/* 2. CALENDAR BOTTOM SHEET (OVERLAY) */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsCalendarOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full rounded-t-[24px] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white z-10 px-6 pt-4 pb-2 border-b border-slate-100 rounded-t-[24px]">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">Select Date & Time</h3>
                  <button 
                    onClick={() => setIsCalendarOpen(false)} 
                    aria-label="Close calendar"
                    className="p-2 bg-gray-50 rounded-full text-gray-400 transition-colors hover:text-slate-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <BookingWidgetContent isMobile price={priceString} courseTitle={course.title} slug={course.slug} courseId={course.id} sessions={course.sessions} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}