// components/layout/Footer.tsx
"use client"; // Needed for useState

import React, { useState } from "react";
import { ChevronDown } from "lucide-react"; // Import ChevronDown icon
import Link from "next/link";
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#1A2E3B] pt-[120px] pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Mobile-specific layout (visible on mobile, hidden on desktop) */}
        <div className="md:hidden flex flex-col gap-8 mb-8">
          {/* Brand Column for Mobile */}
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center"> {/* Added Link for logo */}
              <Image 
                src="/images/logo.png"
                alt="UAchieve First Aid"
                width={200}
                height={200}
                className="object-contain brightness-0 invert" // Inverted for white logo on dark background
              />
            </Link>
          <p className="text-[#9CA3AF] text-[14px] leading-relaxed pr-4 font-['Plus Jakarta Sans']">
            Professional first aid training with over 30 years of healthcare
            experience. Helping individuals and organizations build
            life-saving skills.
          </p>
        </div>

          {/* Collapsible Footer Sections for Mobile */}
          <MobileFooterSections />
        </div>

        {/* Desktop Grid Layout (hidden on mobile, visible on desktop) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"> 
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center"> {/* Added Link for logo */}
            <Image 
              src="/images/logo.png"
              alt="UAchieve First Aid"
              width={200}
              height={200}
              className="object-contain brightness-0 invert" // Inverted for desktop dark background
            />
            </Link>
            <p className="text-[#9CA3AF] text-[14px] leading-relaxed pr-4 font-['Plus Jakarta Sans']">
              Professional first aid training with over 30 years of healthcare
              experience. Helping individuals and organizations build
              life-saving skills.
            </p>
          </div>

          {/* Courses Column */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-6 font-['Plus Jakarta Sans']">Courses</h4>
            <ul className="flex flex-col gap-4">
              {[
                { label: "Basic Life Support", href: "/courses/bls" },
                { label: "Emergency First Aid", href: "/courses/efaw" },
                { label: "Refresher Courses", href: "/courses" },
                { label: "Group Bookings", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#9CA3AF] text-[14px] hover:text-white transition-colors duration-200 font-['Plus Jakarta Sans']"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-6 font-['Plus Jakarta Sans']">Company</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: "About Us", path: "/about" },
                { name: "Our Trainers", path: "/about" },
                { name: "Accreditations", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-[#9CA3AF] text-[14px] hover:text-white transition-colors duration-200 font-['Plus Jakarta Sans']"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-6 font-['Plus Jakarta Sans']">Support</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: "FAQs", path: "/faqs" },
                { name: "Cancellation Policy", path: "/policies/cancellation" },
                { name: "Privacy Policy", path: "/policies/privacy" },
                { name: "Terms & Conditions", path: "/policies/terms" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-[#9CA3AF] text-[14px] hover:text-white transition-colors duration-200 font-['Plus Jakarta Sans']"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Bar (Always visible, outside conditional layouts) */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#9CA3AF]/60 text-[13px] font-['Plus Jakarta Sans']">
            © 2026 UAchieve. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Extracted collapsible sections logic for mobile
function MobileFooterSections() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionName: string) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const sections = [
    {
      name: "Courses",
      links: [
        { label: "Basic Life Support", href: "/courses/bls" },
        { label: "Emergency First Aid", href: "/courses/efaw" },
        { label: "Refresher Courses", href: "/courses" },
        { label: "Group Bookings", href: "/contact" },
      ],
    },
    {
      name: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Our Trainers", href: "/about" },
        { label: "Accreditations", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      name: "Support",
      links: [
        { label: "FAQs", href: "/faqs" },
        { label: "Cancellation Policy", href: "/policies/cancellation" },
        { label: "Privacy Policy", href: "/policies/privacy" },
        { label: "Terms & Conditions", href: "/policies/terms" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-0"> {/* This component is only rendered within the mobile-specific div */}
      {sections.map((section) => (
        <div key={section.name} className="border-b border-white/10">
          <button
            onClick={() => toggleSection(section.name)}
            className="w-full py-4 flex justify-between items-center text-white text-base font-bold font-['Plus Jakarta Sans'] leading-6"
          >
            {section.name}
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                openSection === section.name ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === section.name ? "max-h-72 opacity-100 py-2" : "max-h-0 opacity-0"
            }`}
          >
            <ul className="flex flex-col gap-4 pb-4">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[#9CA3AF] text-sm font-normal font-['Plus Jakarta Sans'] leading-5 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
