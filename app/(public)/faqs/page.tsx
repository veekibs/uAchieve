"use client";

import React, { useState, useMemo } from "react"; // Import useMemo
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronRight,
  Search,
  ChevronDown, // For accordion expand/collapse
} from "lucide-react";

const faqData = [
  {
    category: "General",
    questions: [
      {
        q: "Do I need any prior experience to take a course?",
        a: "No prior experience is required for our basic courses. Our training is designed to be accessible for beginners and experienced individuals alike. For advanced courses, specific prerequisites will be clearly stated.",
      },
      {
        q: "How long are the certificates valid?",
        a: "Our first aid certificates are typically valid for 3 years, in line with HSE guidelines. We recommend refresher training before your certificate expires to maintain your qualification.",
      },
      {
        q: "What should I bring to the training?",
        a: "Please bring comfortable clothing, a pen, and a notebook. All other training materials, including manuals and equipment, will be provided. Lunch is not provided, so please bring your own or plan to purchase it nearby.",
      },
      {
        q: "Where are the training sessions held?",
        a: "Our public training sessions are held at our dedicated training centre in Bedford. The exact venue details will be confirmed in your booking email. We also offer on-site training for groups at your location.",
      },
    ],
  },
  {
    category: "Booking & Payment",
    questions: [
      {
        q: "How do I book a course?",
        a: "You can book a course directly through our website by selecting your desired course, date, and time. Follow the prompts to complete your registration and payment securely online.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards through our secure payment gateway (Stripe). For group bookings, we can also arrange invoice payments.",
      },
      {
        q: "Do you offer group discounts?",
        a: "Yes, we offer competitive discounts for group bookings. Please contact us directly to discuss your requirements and get a custom quote.",
      },
      {
        q: "Can I get a refund if I cancel?",
        a: "If you cancel 2+ weeks before the course date, you receive a full 100% refund. Cancellations made less than 2 weeks before the course date are non-refundable, but you will be eligible for a free rebook to an upcoming session.",
      },
    ],
  },
  {
    category: "Certificates",
    questions: [
      {
        q: "When will I receive my certificate?",
        a: "Certificates are typically issued on the same day of successful course completion. Digital certificates are sent via email, and physical certificates can be arranged upon request.",
      },
      {
        q: "Can I get a physical certificate?",
        a: "Yes, physical certificates can be provided upon request. Please indicate this during your booking or contact us after your course completion.",
      },
      {
        q: "Are your certificates recognised by employers?",
        a: "Absolutely. All our courses follow HSE guidelines and Resuscitation Council UK standards, making our certificates widely recognised and valued by employers across the UK.",
      },
      {
        q: "What happens when my certificate expires?",
        a: "We recommend taking a refresher course before your certificate expires to ensure your qualification remains valid. We'll send you a reminder closer to the expiry date.",
      },
    ],
  },
  {
    category: "Course Details",
    questions: [
      {
        q: "What is the difference between Basic Life Support and Emergency First Aid at Work?",
        a: "Basic Life Support (BLS) focuses on immediate life-saving interventions like CPR and choking. Emergency First Aid at Work (EFAW) is a broader course covering a range of workplace emergencies, including BLS, minor injuries, and managing unconscious casualties.",
      },
      {
        q: "What is the maximum class size?",
        a: "We maintain small class sizes, with a maximum of 12 students per session, to ensure personalized attention and ample hands-on practice for everyone.",
      },
      {
        q: "Is there a test or assessment?",
        a: "Yes, all our courses include practical assessments and a short multiple-choice test to ensure competence and adherence to national standards.",
      },
      {
        q: "What if I fail the assessment?",
        a: "In the unlikely event you don't pass, we offer opportunities for re-assessment. Our trainers will provide feedback and support to help you succeed.",
      },
    ],
  },
];

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter FAQs based on search term
  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return faqData; // If search term is empty, show all FAQs
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return faqData
      .map((category) => {
        const matchingQuestions = category.questions.filter(
          (faq) =>
            faq.q.toLowerCase().includes(lowerCaseSearchTerm) ||
            faq.a.toLowerCase().includes(lowerCaseSearchTerm)
        );
        return { ...category, questions: matchingQuestions };
      })
      .filter((category) => category.questions.length > 0); // Only include categories with matching questions
  }, [searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus Jakarta Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-12 flex-wrap">
            <Link href="/" className="text-gray-400 text-xs font-normal font-['Plus Jakarta Sans'] leading-5 hover:text-[#29ABE2] transition-colors">
              Home <span className="font-['Plus Jakarta Sans']" />
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-slate-600 text-xs font-normal font-['Plus Jakarta Sans'] leading-5">FAQs</span>
          </nav>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 flex flex-col items-center gap-4"
          >
            <h1 className="text-slate-800 text-5xl font-bold font-['Plus Jakarta Sans'] leading-[72px] mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6 max-w-xl">
              Find answers to common questions about our first aid training courses.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full max-w-xl mx-auto mb-24"
          >
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm} // Bind value to state
              onChange={handleSearchChange} // Add change handler
              className="w-full h-14 pl-14 pr-6 py-4 bg-white rounded-[100px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] border border-gray-200 text-slate-800/50 text-base font-normal font-['Plus Jakarta Sans'] focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
            /> {/* Ensure font is Plus Jakarta Sans */}
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          </motion.div>

          {/* FAQ Accordion Sections */}
          <> {/* Wrap the conditional rendering in a fragment */}
            {filteredFaqs.length > 0 ? (
              <div className="flex flex-col gap-12 mb-32">
                {filteredFaqs.map((category, catIndex) => (
                <motion.div
                  key={catIndex}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                  className="flex flex-col gap-2"
                >
                  <div className="pb-4 border-b border-slate-100 mb-2"> {/* Ensure font is Plus Jakarta Sans */}
                    <h2 className="text-slate-800 text-lg font-bold font-['Plus Jakarta Sans'] leading-7">
                      {category.category}
                    </h2>
                  </div>
                  <div className="flex flex-col">
                    {category.questions.map((faq, faqIndex) => (
                      <details key={faqIndex} className="py-4 border-b border-slate-100 group">
                        <summary className="flex justify-between items-center cursor-pointer list-none font-['Plus Jakarta Sans']">
                          <span className="text-slate-800 text-base font-medium font-['Plus Jakarta Sans'] leading-6">
                            {faq.q}
                          </span>
                          <ChevronDown size={20} className="text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6 mt-4 pr-8">
                          {faq.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </motion.div>
              ))}
              </div>
            ) : (
              searchTerm && ( // Only show "No FAQs found" if a search term is present and no results
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-32"
                >
                  <p className="text-slate-600 text-lg font-medium font-['Plus Jakarta Sans']">
                    No FAQs found matching "{searchTerm}".
                  </p>
                </motion.div>
              )
            )}
          </> {/* End of fragment */}
          {/* Still Have Questions? CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800 rounded-2xl p-10 text-center flex flex-col items-center gap-4 max-w-xl mx-auto mb-32"
          >
            <h2 className="text-white text-2xl font-bold font-['Plus Jakarta Sans'] leading-9">
              Still Have Questions?
            </h2>
            <p className="text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] leading-6 max-w-md">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <Link href="/contact" className="w-36">
              <button className="w-full h-12 bg-[#8DC63F] rounded-[100px] flex items-center justify-center text-white text-base font-bold font-['Plus Jakarta Sans'] leading-6 transition-all hover:bg-[#7AB32E] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] active:scale-[0.98]">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}