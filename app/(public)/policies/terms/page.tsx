"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronRight,
  CheckCircle2, // For bullet points
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const policySections = [
  { id: "acceptance-of-terms", title: "1. Acceptance of Terms" },
  { id: "course-bookings", title: "2. Course Bookings" },
  { id: "attendance-requirements", title: "3. Attendance Requirements" },
  { id: "certificates", title: "4. Certificates" },
  { id: "cancellations-and-refunds", title: "5. Cancellations and Refunds" },
  { id: "student-conduct", title: "6. Student Conduct" },
  { id: "liability", title: "7. Liability" },
  { id: "medical-conditions", title: "8. Medical Conditions" },
  { id: "course-changes", title: "9. Course Changes" },
  { id: "intellectual-property", title: "10. Intellectual Property" },
  { id: "privacy", title: "11. Privacy" },
  { id: "governing-law", title: "12. Governing Law" },
  { id: "changes-to-terms", title: "13. Changes to Terms" },
  { id: "contact-information", title: "14. Contact Information" },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("acceptance-of-terms");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for fixed header
      let currentActive = "acceptance-of-terms";

      for (const section of policySections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentActive = section.id;
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus Jakarta Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-12 flex-wrap">
            <Link href="/" className="text-gray-400 text-xs font-normal font-['Plus Jakarta Sans'] leading-5 hover:text-[#29ABE2] transition-colors">
              Home <span className="font-['Plus Jakarta Sans']" />
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-slate-600 text-xs font-normal font-['Plus Jakarta Sans'] leading-5">Terms & Conditions</span>
          </nav>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-col gap-2"
          >
            <h1 className="text-slate-800 text-4xl font-bold font-['Plus Jakarta Sans'] leading-[50px]">
              Terms & Conditions
            </h1>
            <p className="text-gray-400 text-sm font-normal font-['Plus Jakarta Sans'] leading-5">
              Last updated: April 2026
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
            {/* Main Policy Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 flex flex-col gap-12"
            >
              {/* 1. Acceptance of Terms */}
              <section id="acceptance-of-terms">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7">
                  By accessing and using the UAchieve website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              {/* 2. Course Bookings */}
              <section id="course-bookings">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  2. Course Bookings
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7 mb-6">
                  When you book a course with UAchieve, you enter into a contract with us. All bookings are subject to availability and confirmation.
                </p>
                <h3 className="text-slate-800 text-base font-bold font-['Plus Jakarta Sans'] leading-6 mb-4">
                  2.1 Payment
                </h3>
                <ul className="list-none flex flex-col gap-2 pl-0 mb-6">
                  {[
                    "Full payment is required at the time of booking",
                    "Prices are in GBP and include VAT where applicable",
                    "Payment can be made via credit/debit card or approved payment plans (Klarna)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="text-slate-800 text-base font-bold font-['Plus Jakarta Sans'] leading-6 mb-4">
                  2.2 Confirmation
                </h3>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7">
                  You will receive a booking confirmation via email. Please check all details are correct and contact us immediately if there are any errors.
                </p>
              </section>

              {/* 3. Attendance Requirements */}
              <section id="attendance-requirements">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  3. Attendance Requirements
                </h2>
                <ul className="list-none flex flex-col gap-2 pl-0">
                  {[
                    "Students must attend the full duration of the course to receive certification",
                    "Late arrivals (more than 15 minutes) may not be admitted",
                    "Students must actively participate in all practical assessments",
                    "Students must be physically capable of performing CPR and other physical activities",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 4. Certificates */}
              <section id="certificates">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  4. Certificates
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7 mb-6"> {/* Corrected font */}
                  Upon successful completion of the course, students will receive a digital certificate valid for 3 years. Physical certificates are available for an additional fee.
                </p>
                <ul className="list-none flex flex-col gap-2 pl-0">
                  {[
                    "Certificates are issued in the name provided at booking",
                    "Name changes on certificates may incur a fee",
                    "Lost certificates can be replaced for a fee",
                    "UAchieve reserves the right to withhold certification if course requirements are not met",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 5. Cancellations and Refunds */}
              <section id="cancellations-and-refunds">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  5. Cancellations and Refunds
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  Please refer to our{" "}
                  <Link href="/policies/cancellation" className="text-sky-500 font-medium underline hover:text-[#29ABE2] transition-colors">
                    Cancellation Policy
                  </Link>{" "}
                  for full details.
                </p>
              </section>

              {/* 6. Student Conduct */}
              <section id="student-conduct">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  6. Student Conduct
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7 mb-4"> {/* Corrected font */}
                  Students are expected to:
                </p>
                <ul className="list-none flex flex-col gap-2 pl-0 mb-6">
                  {[
                    "Treat instructors and fellow students with respect",
                    "Follow all safety instructions",
                    "Refrain from disruptive behavior",
                    "Not attend under the influence of alcohol or drugs",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  UAchieve reserves the right to remove any student who violates these standards without refund.
                </p>
              </section>

              {/* 7. Liability */}
              <section id="liability">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  7. Liability
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7 mb-6"> {/* Corrected font */}
                  While we take every precaution to ensure safety during training, students participate at their own risk. UAchieve is not liable for:
                </p>
                <ul className="list-none flex flex-col gap-2 pl-0 mb-6">
                  {[
                    "Minor injuries sustained during practical training",
                    "Loss or damage to personal property",
                    "Indirect or consequential losses",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  Our liability is limited to the amount paid for the course, except where prohibited by law.
                </p>
              </section>

              {/* 8. Medical Conditions */}
              <section id="medical-conditions">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  8. Medical Conditions
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  Students with medical conditions that may affect their ability to participate should inform us before the course. We will make reasonable accommodations where possible.
                </p>
              </section>

              {/* 9. Course Changes */}
              <section id="course-changes">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  9. Course Changes
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  UAchieve reserves the right to modify course content, schedules, or venues. We will provide as much notice as possible of any changes.
                </p>
              </section>

              {/* 10. Intellectual Property */}
              <section id="intellectual-property" className="bg-amber-500/5 rounded-lg border-l-2 border-amber-500 p-5">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  10. Intellectual Property
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  All course materials, including but not limited to presentations, handouts, and digital content, are the intellectual property of UAchieve. Students may not reproduce, distribute, or sell these materials without written permission.
                </p>
              </section>

              {/* 11. Privacy */}
              <section id="privacy">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  11. Privacy
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  We are committed to protecting your privacy. Please see our{" "}
                  <Link href="/policies/privacy" className="text-sky-500 font-medium underline hover:text-[#29ABE2] transition-colors">
                    Privacy Policy
                  </Link>{" "}
                  for details on how we collect and use your information.
                </p>
              </section>

              {/* 12. Governing Law */}
              <section id="governing-law">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  12. Governing Law
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  These Terms and Conditions are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </section>

              {/* 13. Changes to Terms */}
              <section id="changes-to-terms">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  13. Changes to Terms
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7"> {/* Corrected font */}
                  We may update these Terms and Conditions from time to time. The latest version will always be available on our website. Continued use of our services after changes constitutes acceptance of the new terms.
                </p>
              </section>

              {/* 14. Contact Information */}
              <section id="contact-information">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 mb-4">
                  14. Contact Information
                </h2>
                <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7 mb-4"> {/* Corrected font */}
                  For questions about these Terms and Conditions, please contact us:
                </p>
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail size={20} className="text-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold font-['Plus Jakarta Sans'] uppercase leading-4 tracking-wide mb-1">
                        Email
                      </span>
                      <Link href="mailto:info@uachieve.co.uk" className="text-sky-500 text-base font-bold font-['Plus Jakarta Sans'] leading-6 hover:underline">
                        info@uachieve.co.uk
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={20} className="text-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold font-['Plus Jakarta Sans'] uppercase leading-4 tracking-wide mb-1">
                        Phone
                      </span>
                      <Link href="tel:02012345678" className="text-slate-800 text-base font-bold font-['Plus Jakarta Sans'] leading-6 hover:underline">
                        020 1234 5678
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold font-['Plus Jakarta Sans'] uppercase leading-4 tracking-wide mb-1">
                        Address
                      </span>
                      <p className="text-slate-800 text-base font-bold font-['Plus Jakarta Sans'] leading-6">
                        UAchieve Training Centre, 123 Training Street, London EC1A 1BB
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>

            {/* Contents Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-40"
            >
              <h3 className="text-gray-400 text-xs font-bold font-['Plus Jakarta Sans'] uppercase leading-4 tracking-wide mb-4">
                Contents
              </h3>
              <ul className="flex flex-col gap-3">
                {policySections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`} // Corrected font
                      className={`block pl-3 py-1 transition-all duration-200 ease-out ${
                        activeSection === section.id
                          ? "text-sky-500 font-bold border-l-2 border-sky-500"
                          : "text-slate-600 font-medium border-l-2 border-transparent hover:text-sky-500"
                      } text-sm font-['Plus Jakarta Sans'] leading-5`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                        setActiveSection(section.id); // Update active section immediately on click
                      }}
                    >
                      {section.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Questions? CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800 rounded-2xl p-10 text-center flex flex-col items-center gap-4 max-w-xl mx-auto mb-32"
          >
            <h2 className="text-white text-2xl font-bold font-['Plus Jakarta Sans'] leading-9">
              Questions?
            </h2>
            <p className="text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] leading-6 max-w-md">
              If you have any questions or need to discuss your specific situation, we're here to help.
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