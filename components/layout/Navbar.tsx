"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isInformational = [
    "/faqs",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cancellation-policy",
  ].includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[56px] transition-all duration-300 flex items-center ${
        scrolled
          ? "bg-[rgba(255,255,255,0.72)] backdrop-blur-[14px] border-b border-[rgba(41,171,226,0.15)] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-[#262626] rounded w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-white text-xl">U</span>
          </div>
          <span className="font-bold text-2xl text-[#1A2E3B] tracking-tight">
            UAchieve
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: "Courses", path: "/courses" },
            { name: "About", path: "/about" },
            { name: "Contact", path: "/contact" },
            { name: "FAQs", path: "/faqs" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-[15px] font-medium text-[#4A5568] hover:text-[#29ABE2] transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link
            href={pathname === "/profile" ? "/" : "/login"}
            className="text-[15px] font-medium text-[#9CA3AF] hover:text-[#29ABE2] transition-colors duration-200 hidden sm:block"
          >
            {pathname === "/profile" ? "Logout" : "Login"}
          </Link>

          {isInformational ? (
            <Link
              href="/contact"
              className="border-[1.5px] border-[#29ABE2] text-[#29ABE2] hover:bg-[rgba(41,171,226,0.05)] text-[15px] font-medium h-[40px] px-6 rounded-full transition-all duration-300 hover:scale-[1.02] inline-flex items-center"
            >
              Contact Us
            </Link>
          ) : (
            <Link
              href="/courses"
              className="bg-[#8DC63F] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] text-white text-[15px] font-medium h-[40px] px-6 rounded-full transition-all duration-300 hover:scale-[1.02] inline-flex items-center"
            >
              Book a Course
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}