"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-12 flex-wrap">
            <Link href="/" className="text-gray-400 text-xs font-normal hover:text-[#29ABE2] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-slate-600 text-xs font-normal">Cancellation & Refund Policy</span>
          </nav>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-col gap-2"
          >
            <h1 className="text-slate-800 text-4xl font-bold leading-[50px]">
              Cancellation & Refund Policy
            </h1>
            <p className="text-gray-400 text-sm font-normal">
              Last updated: August 2026
            </p>
          </motion.div>

          {/* Quick Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-green-50 rounded-xl border border-green-200 p-7 flex flex-col gap-6 mb-24"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-lime-500" />
              <h2 className="text-lime-600 text-lg font-bold leading-7">
                Quick Summary
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <div className="size-2.5 bg-green-500 rounded-full mt-2 shrink-0" />
                <p className="text-slate-800 text-base font-bold leading-6">
                  2+ Weeks Before Course Date
                  <span className="text-slate-600 font-normal"> — Full (100%) refund to your original payment method.</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-2.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                <p className="text-slate-800 text-base font-bold leading-6">
                  Less Than 2 Weeks Before Course Date
                  <span className="text-slate-600 font-normal"> — No refund, but eligible for a free rebook to an upcoming session.</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Policy Details */}
          <div className="flex flex-col gap-12 mb-32">
            {/* 1. Cancellation by Student */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                1. Cancellation by Student
              </h2>
              <p className="text-slate-600 text-base font-normal leading-6 mb-6">
                We understand that schedules can change. Our cancellation rules are structured clearly based on notice time prior to the course date:
              </p>
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 rounded-lg border-l-4 border-green-500 p-5">
                  <h3 className="text-slate-800 text-base font-bold leading-6 mb-2">
                    1.1 Cancelling 2+ Weeks (14+ Days) Before Session
                  </h3>
                  <p className="text-slate-600 text-base font-normal leading-6">
                    If you cancel 2+ weeks before your course date, you will receive a <strong>full (100%) refund</strong> to your original payment method within 5-10 business days.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg border-l-4 border-amber-500 p-5">
                  <h3 className="text-slate-800 text-base font-bold leading-6 mb-2">
                    1.2 Cancelling Less Than 2 Weeks (Under 14 Days) Before Session
                  </h3>
                  <p className="text-slate-600 text-base font-normal leading-6">
                    Cancellations made less than 2 weeks prior to the course date are non-refundable. However, your account will automatically be flagged as eligible for a <strong>free rebook</strong> to an available future date.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 2. Cancellation by UAchieve */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                2. Cancellation by UAchieve
              </h2>
              <p className="text-slate-600 text-base font-normal leading-6 mb-4">
                In rare cases, UAchieve may need to cancel or modify a scheduled session due to unforeseen trainer illness or venue emergencies:
              </p>
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 rounded-lg border-l-4 border-sky-500 p-5">
                  <h3 className="text-slate-800 text-base font-bold leading-6 mb-2">
                    2.1 UAchieve Cancels With Less Than 2 Weeks' Notice
                  </h3>
                  <p className="text-slate-600 text-base font-normal leading-6">
                    Each booked student will receive an email notice with two choice options: choose a <strong>Full Refund</strong> OR select a <strong>Free Rebook</strong> date.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg border-l-4 border-slate-400 p-5">
                  <h3 className="text-slate-800 text-base font-bold leading-6 mb-2">
                    2.2 UAchieve Cancels With More Than 2 Weeks' Notice
                  </h3>
                  <p className="text-slate-600 text-base font-normal leading-6">
                    UAchieve will attempt to reschedule the session and reach out to students directly to coordinate new date preferences.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. Student No-Show */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                3. Student No-Show
              </h2>
              <p className="text-slate-600 text-base font-normal leading-6">
                If a student does not attend their scheduled training session without prior cancellation, no monetary refund is provided. However, each student is granted <strong>one free rebook chance only</strong> to transfer their booking to a future date.
              </p>
            </motion.div>

            {/* 4. Refund Processing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-slate-800 text-xl font-bold leading-8 mb-4">
                4. Refund Processing
              </h2>
              <p className="text-slate-600 text-base font-normal leading-6">
                All approved refunds are submitted to Stripe immediately and credited to your original payment card within 5-10 business days.
              </p>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800 rounded-2xl p-10 text-center flex flex-col items-center gap-4 max-w-xl mx-auto mb-32"
          >
            <h2 className="text-white text-2xl font-bold leading-9">
              Questions About Our Policy?
            </h2>
            <p className="text-slate-300 text-sm leading-6 max-w-md">
              If you have any questions regarding cancellations or refunds, our support team is happy to help.
            </p>
            <Link
              href="mailto:info@uachieve.co.uk"
              className="mt-2 h-12 px-6 bg-[#29ABE2] rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-sky-500 transition-colors"
            >
              Contact Support
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}