"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const policySections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information-we-collect", title: "2. Information We Collect" },
  { id: "how-we-use-your-information", title: "3. How We Use Your Information" },
  { id: "training-records-and-certification", title: "4. Training Records & Certification" },
  { id: "data-sharing-and-disclosure", title: "5. Data Sharing & Third Parties" },
  { id: "data-security", title: "6. Data Security" },
  { id: "your-rights", title: "7. Your Rights" },
  { id: "data-retention", title: "8. Data Retention" },
  { id: "cookies", title: "9. Cookies & Tracking" },
  { id: "contact-us", title: "10. Contact Us" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for fixed header
      let currentActive = "introduction";

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
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-12 flex-wrap">
            <Link href="/" className="text-gray-400 text-xs font-normal hover:text-[#29ABE2] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-slate-600 text-xs font-normal">Privacy Policy</span>
          </nav>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-col gap-2"
          >
            <h1 className="text-slate-800 text-4xl font-bold leading-[50px]">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-sm font-normal">
              Last updated: September 2026
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
              {/* 1. Introduction */}
              <section id="introduction">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  1. Introduction
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7">
                  UAchieve First Aid ("we", "our", "us") is dedicated to protecting your privacy and personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018. This policy explains how we collect, use, and safeguard personal information when you book training courses through our website.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section id="information-we-collect">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  2. Information We Collect
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7 mb-4">
                  We operate a simplified direct booking model without requiring student user accounts or passwords. We only collect the minimal personal data necessary to register your course booking and coordinate your training session:
                </p>
                <ul className="list-none flex flex-col gap-2 pl-0">
                  {[
                    "Contact details: First name, surname, email address, and phone number",
                    "Company or employer name (if booking on behalf of an organisation)",
                    "Course selection, venue, session date, and booking reference",
                    "Payment transaction identifiers (processed securely through Stripe; we never store your payment card numbers)",
                    "SMS notification consent preference (optional)",
                    "Communications and customer support correspondence",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 3. How We Use Your Information */}
              <section id="how-we-use-your-information">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7 mb-4">
                  We use your personal data for the following legitimate purposes:
                </p>
                <ul className="list-none flex flex-col gap-2 pl-0">
                  {[
                    "Processing course reservations and issuing booking confirmations",
                    "Delivering mandatory pre-course notifications, reminders (email/SMS), and venue updates",
                    "Managing course rosters and physical classroom attendance verification",
                    "Providing customer support, rescheduling assistance, and refund administration",
                    "Complying with statutory health and safety training standards and legal duties",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 4. Training Records & Certification */}
              <section id="training-records-and-certification">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  4. Training Records & Certification
                </h2>
                <div className="bg-sky-50 rounded-xl border border-sky-200 p-6 space-y-3">
                  <p className="text-slate-800 text-base font-semibold leading-6">
                    External Accreditation & Qualification Management
                  </p>
                  <p className="text-slate-600 text-sm leading-6">
                    UAchieve delivers approved in-person training. Formal qualification certificates, verification portals, and official candidate records are managed directly by <strong>WorkSafe Training Systems</strong>.
                  </p>
                  <p className="text-slate-600 text-sm leading-6">
                    UAchieve does not operate an online certificate download portal or store digital certificate PDF files on our web servers. Upon successful completion of your course, your qualification details are submitted to WorkSafe Training Systems, who issue your accredited certification through their secure portal.
                  </p>
                </div>
              </section>

              {/* 5. Data Sharing & Third Parties */}
              <section id="data-sharing-and-disclosure">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  5. Data Sharing & Third Parties
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7 mb-4">
                  We do not sell, rent, or trade your personal data. We only share information with trusted third-party service providers essential for service delivery:
                </p>
                <ul className="list-none flex flex-col gap-2 pl-0">
                  {[
                    "WorkSafe Training Systems: Accredited awarding organisation handling qualification certification and compliance records",
                    "Stripe Inc.: Secure PCI-DSS Level 1 compliant payment processing",
                    "Resend: Transactional email delivery service for booking confirmations, reminders, and notices",
                    "Statutory Authorities: When required by law or regulatory health and safety bodies",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-sky-500 mt-1 shrink-0" />
                      <span className="text-slate-600 text-base font-normal leading-6">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 6. Data Security */}
              <section id="data-security">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  6. Data Security
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7">
                  We maintain industry-standard security safeguards to protect your personal data against unauthorized access, loss, or disclosure. All web traffic is encrypted using SSL/TLS encryption. Sensitive administrative endpoints are restricted and protected with role-based access control.
                </p>
              </section>

              {/* 7. Your Rights */}
              <section id="your-rights">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  7. Your Rights
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7 mb-4">
                  Under the UK GDPR, you hold rights regarding your personal information, including:
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      right: "Right of Access",
                      description: "Request a copy of personal information we maintain regarding your bookings.",
                    },
                    {
                      right: "Right to Rectification",
                      description: "Request updates to correct inaccurate or incomplete contact details.",
                    },
                    {
                      right: "Right to Erasure",
                      description: "Request deletion of your personal data where retention is not required by statutory accounting or training regulations.",
                    },
                    {
                      right: "Right to Restrict Processing",
                      description: "Ask us to limit the processing of your data in specific scenarios.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-sky-500/5 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <h3 className="text-sky-500 text-sm font-bold leading-5 min-w-[200px]">
                        {item.right}
                      </h3>
                      <p className="text-slate-600 text-sm font-normal leading-5">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 8. Data Retention */}
              <section id="data-retention">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  8. Data Retention
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7">
                  We retain course booking and transaction data only for the period necessary to fulfill contractual services, tax, and statutory financial reporting requirements (typically 6-7 years for accounting records). We do not retain redundant personal files.
                </p>
              </section>

              {/* 9. Cookies */}
              <section id="cookies">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  9. Cookies & Tracking
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7">
                  We use essential cookies strictly necessary to facilitate navigation, security, and session state. You can manage your preferences at any time via our Cookie Consent banner managed by CookieYes.
                </p>
              </section>

              {/* 10. Contact Us */}
              <section id="contact-us">
                <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                  10. Contact Us
                </h2>
                <p className="text-slate-600 text-base font-normal leading-7 mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your data protection rights, please contact our data privacy lead:
                </p>
                <div className="bg-white p-5 rounded-xl border border-gray-200 text-slate-700 text-sm leading-6 space-y-1">
                  <p><strong>UAchieve First Aid Training</strong></p>
                  <p>Email: <Link href="mailto:info@uachieve.co.uk" className="text-sky-500 font-medium underline">info@uachieve.co.uk</Link></p>
                  <p>Location: Bedfordshire, United Kingdom</p>
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
              <h3 className="text-gray-400 text-xs font-bold uppercase leading-4 tracking-wide mb-4">
                Contents
              </h3>
              <ul className="flex flex-col gap-3">
                {policySections.map((section) => (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`}
                      className={`block pl-3 py-1 transition-all duration-200 ease-out ${
                        activeSection === section.id
                          ? "text-sky-500 font-bold border-l-2 border-sky-500"
                          : "text-slate-600 font-medium border-l-2 border-transparent hover:text-sky-500"
                      } text-sm leading-5`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                        setActiveSection(section.id);
                      }}
                    >
                      {section.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}