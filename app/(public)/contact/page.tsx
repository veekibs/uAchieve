"use client";

import React from "react";
import dynamic from "next/dynamic"; // Import dynamic for client-side loading
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Send, // For the send message button
} from "lucide-react";

export default function ContactPage() {
  // No longer dynamically importing a map component; using iframe directly.

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus Jakarta Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-12 flex-wrap">
            <Link href="/" className="text-gray-400 text-xs font-normal font-['Plus Jakarta Sans'] leading-5 hover:text-[#29ABE2] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-slate-600 text-xs font-normal font-['Plus Jakarta Sans'] leading-5">Contact</span>
          </nav>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24 flex flex-col items-center gap-4"
          >
            <h1 className="text-slate-800 text-5xl font-bold font-['Plus Jakarta Sans'] leading-[72px] mb-2">
              Get in Touch
            </h1>
            <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6 max-w-2xl">
              Have a question? We're here to help. Send us a message or reach out through any of the channels below.
            </p>
          </motion.div>

          {/* Contact Content: Form and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
            {/* Left Column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] border border-gray-200 p-8 flex flex-col gap-6"
            >
              <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
                Send Us a Message
              </h2>
              <form className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-slate-800 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="John"
                      className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border border-gray-300 text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-slate-800 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Smith"
                      className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border border-gray-300 text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-slate-800 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="john.smith@example.com"
                    className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border border-gray-300 text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-slate-800 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="07123 456789"
                    className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border border-gray-300 text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-slate-800 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border border-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-slate-800 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border border-gray-300 text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent resize-y"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-[#8DC63F] rounded-xl flex items-center justify-center text-white text-base font-bold font-['Plus Jakarta Sans'] leading-6 transition-all hover:bg-[#7AB32E] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] active:scale-[0.98]"
                >
                  Send Message <Send size={18} className="ml-2" />
                </button>
              </form>
            </motion.div>

            {/* Right Column: Contact Info & Quick Response */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8"
            >
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] border border-gray-200 p-8 flex flex-col gap-8">
                <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
                  Contact Information
                </h2>
                <div className="flex flex-col gap-8">
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
                      <p className="text-slate-800 text-base font-bold font-['Plus Jakarta Sans'] leading-5">
                        UAchieve Training Centre
                        <br />
                        London EC1V 3NB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={20} className="text-sky-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs font-bold font-['Plus Jakarta Sans'] uppercase leading-4 tracking-wide mb-1">
                        Office Hours
                      </span>
                      <p className="text-slate-800 text-base font-bold font-['Plus Jakarta Sans'] leading-5">
                        Mon-Fri 9am-6pm
                        <br />
                        Sat 9am-5pm
                        <br />
                        Sun closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Response Info */}
              <div className="bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] border border-gray-200 p-8 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-[#8DC63F]" />
                  <h3 className="text-[#8DC63F] text-base font-bold font-['Plus Jakarta Sans'] leading-6">
                    Quick Response
                  </h3>
                </div>
                <p className="text-slate-600 text-sm font-normal font-['Plus Jakarta Sans'] leading-6">
                  We typically respond to all enquiries within 24 hours during business days.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Training Course Location Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 flex flex-col items-center gap-4"
          >
            <h2 className="text-slate-800 text-2xl font-bold font-['Plus Jakarta Sans'] leading-9">
              Training Course Location Map
            </h2>
            <p className="text-gray-400 text-base font-normal font-['Plus Jakarta Sans'] leading-6">
              123 Training Street, London EC1V 3NB
            </p>
          </motion.div>

          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full h-96 bg-slate-100 rounded-2xl border border-gray-200 overflow-hidden relative flex items-center justify-center mb-32"
          >
            {/* Google Maps iframe embed for Bedford */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d78580.8906336338!2d-0.5367683999999999!3d52.1364516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48774780f2d9171f%3A0x27270030026e130!2sBedford!5e0!3m2!1sen!2suk!4v1701000000000!5m2!1sen!2suk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="UAchieve Training Centre Location"
            ></iframe>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}