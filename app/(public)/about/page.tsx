"use client";

import { useState, useMemo } from 'react';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Target,
  GraduationCap,
  HeartPulse,
  CalendarDays,
  ChevronRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  MessageSquare,
  ShieldCheck, // Added ChevronRight for the breadcrumb
} from "lucide-react";

export default function AboutPage() {
  return ( // Apply Plus Jakarta Sans to the entire page content
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus Jakarta Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-12 flex-wrap">
            <Link href="/" className="text-gray-400 text-xs font-normal font-['Plus Jakarta Sans'] leading-5 hover:text-[#29ABE2] transition-colors">
              Home {/* Changed font from Inter to Plus Jakarta Sans */}
            </Link>
            <ChevronRight size={14} className="text-gray-400" /> {/* Replaced custom arrow with ChevronRight icon */}
            <span className="text-slate-600 text-xs font-normal font-['Plus Jakarta Sans'] leading-5">About</span>
          </nav>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24 flex flex-col items-center gap-4"
          >
            <h1 className="text-slate-800 text-5xl font-bold font-['Plus Jakarta Sans'] leading-[72px] mb-2">
              About UAchieve
            </h1>
            <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6 max-w-2xl">
              Over 30 years of healthcare experience, delivering quality first
              aid training.
            </p>
          </motion.div>

          {/* Mission Statement Block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-sky-500/5 rounded-2xl border-l-[3.32px] border-sky-500 pt-10 pb-10 pl-11 pr-10 max-w-[800px] mx-auto mb-32 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-6 flex items-center justify-center">
                <Target size={24} className="text-sky-500" />
              </div>
              <h2 className="text-sky-500 text-2xl font-bold font-['Plus Jakarta Sans'] leading-9">
                My Mission
              </h2>
            </div>
            <p className="text-slate-600 text-base font-medium font-['Plus Jakarta Sans'] leading-7">
              "I believe everyone should have the knowledge and confidence to
              save a life. My mission is to provide accessible, high-quality
              first aid training that meets HSE standards and empowers
              individuals and organizations to respond effectively in emergency
              situations."
            </p>
          </motion.div>

          {/* What I Offer Section */}
          <section className="mb-32">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-slate-800 text-3xl font-bold font-['Plus Jakarta Sans'] leading-[48px] text-center mb-12"
            >
              What I Offer
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: GraduationCap,
                  title: "Quality Training",
                  description:
                    "Small class sizes ensure personalised attention and hands-on practice for every student.",
                },
                {
                  icon: HeartPulse,
                  title: "Real Experience",
                  description:
                    "30+ years of healthcare experience brings real-world knowledge to every session.",
                },
                {
                  icon: CalendarDays,
                  title: "Flexible Scheduling",
                  description:
                    "Saturday sessions designed to fit around your work and personal commitments.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1.11px] outline-gray-200 p-8 flex flex-col gap-4 min-h-[256px]"
                >
                  <div className="size-14 bg-sky-500 rounded-xl flex items-center justify-center">
                    <item.icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Meet Ann Njoroge Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-slate-800 text-3xl font-bold font-['Plus Jakarta Sans'] leading-[48px] mb-2">
                Meet Ann Njoroge
              </h2>
              <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7">
                With over 30 years of experience in healthcare, I've dedicated
                my career to helping people gain the confidence and skills to
                respond in emergency situations. UAchieve was born from my
                passion for making quality first aid training accessible to
                everyone.
              </p>
              <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7">
                I believe first aid training should be practical, hands-on, and
                directly applicable to real-world situations.
              </p>
              <div className="bg-sky-500/10 rounded-sm px-4 py-3 border-l-2 border-sky-500">
                <p className="text-slate-800 text-base font-medium font-['Plus Jakarta Sans'] leading-7">
                  With small class sizes (maximum 12 people), I ensure every
                  student gets personalized attention and plenty of practice
                  time.
                </p>
              </div>
              <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-7">
                All my courses follow HSE guidelines and Resuscitation Council
                UK standards, so you can be confident you're receiving training
                that's recognised and valued by employers across the UK.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] w-full bg-gray-200 rounded-2xl flex items-center justify-center"
            > {/* Changed font from Inter to Plus Jakarta Sans */}
              {/* Fallback pattern/image based on Figma mockup */}
              <div className="opacity-50 flex items-center justify-center">
                 <span className="text-gray-400 font-bold font-['Plus Jakarta Sans']">Placeholder</span>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-slate-800 rounded-lg shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] px-6 py-4 flex items-center gap-3">
                <HeartPulse size={24} className="text-lime-400" />
                <p className="text-white text-base font-bold font-['Plus Jakarta Sans'] leading-6">
                  30+ Years of
                  <br />
                  Experience
                </p>
              </div>
            </motion.div>
          </section>
        </div>
          
        {/* Full Bleed Stats Bar */}
        <div className="w-full bg-slate-800 py-16 px-6 mb-20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
              {[
                { value: "Max 12", label: "Students Per Class" },
                { value: "30+", label: "Years Experience" },
                { value: "Saturday", label: "Training Sessions" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col items-center justify-center py-4"
                >
                  <span className="text-white text-5xl font-bold font-['Plus Jakarta Sans'] leading-[72px] mb-2">
                    {stat.value}
                  </span>
                  <span className="text-gray-400 text-base font-medium font-['Plus Jakarta Sans'] uppercase leading-6 tracking-wide">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Accreditations Section (reusing component from home) */}
          <section className="py-12 mb-32 flex flex-col items-center">
            <h2 className="text-slate-800 text-2xl font-bold font-['Plus Jakarta Sans'] leading-9 text-center mb-10">
              Accreditations
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:flex md:flex-wrap md:justify-center md:items-center md:gap-8 w-full">
              {[
                { name: "HSE", src: "/images/hse.png" },
                { name: "Resuscitation Council UK", src: "/images/rcuk.png" },
                { name: "FAIB", src: "/images/faib.png" },
                { name: "OFQUAL", src: "/images/ofqual.png" },
              ].map((logo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group bg-gray-50 rounded-xl border border-transparent w-full max-w-[180px] h-[100px] transition-all duration-200 ease-out md:hover:border-[#29ABE2] md:hover:-translate-y-[2px] flex items-center justify-center"
                >
                  <div className="relative w-[100px] h-[50px]">
                    <Image
                      src={logo.src}
                      alt={`${logo.name} logo`}
                      fill // Logos are colored by default on mobile, grayscale on desktop hover
                      className="object-contain transition-all duration-200 ease-out md:grayscale md:opacity-60 md:group-hover:grayscale-0 md:group-hover:opacity-100" // Removed grayscale and opacity for mobile
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Call to Action Section (Full Bleed Background) */}
        <section className="w-full bg-gray-50 border-t border-slate-100 py-24 text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-slate-800 text-3xl font-bold font-['Plus Jakarta Sans'] leading-[48px] mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6 max-w-2xl mx-auto mb-10"
          >
            Join thousands of individuals and organisations who trust UAchieve
            for their first aid training needs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link href="/courses" className="w-48">
              <button className="w-full h-12 bg-[#8DC63F] rounded-[100px] flex items-center justify-center text-white text-base font-bold font-['Plus Jakarta Sans'] leading-6 transition-all hover:bg-[#7AB32E] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] active:scale-[0.98]">
                View Courses
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-48 h-12 rounded-[100px] outline outline-1 outline-offset-[-1.11px] outline-sky-500 flex items-center justify-center text-sky-500 text-base font-bold font-['Plus Jakarta Sans'] leading-6 hover:bg-sky-50 transition-colors">
                Contact Us
              </button>
            </Link>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
