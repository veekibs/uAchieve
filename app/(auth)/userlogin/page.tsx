"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client"; // Your Supabase client

const StudentLoginPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMagicLinkSent(false); // Reset magic link sent status

    // 1. Client-side Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // 2. Send the Magic Link securely via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // IMPORTANT: Prevents users from creating an account through the login portal
        // if they haven't booked a course yet.
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/callback?next=/profile`,
      },
    });

    if (error) {
      if (error.message.includes("Signups not allowed") || error.message.includes("not found")) {
        setMessage("No account found. Please book a course first.");
      } else {
        setMessage(error.message);
      }
    } else {
      setMessage("Check your email for your login link!");
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Plus_Jakarta_Sans']">
      <Navbar />
      
      <main className="min-h-[100dvh] flex flex-col justify-center items-center px-6 py-24 lg:py-32">
        <div className="w-full max-w-[540px] min-h-[580px] bg-white p-10 sm:p-20 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center">
          
          <Link href="/" className="mb-10">
            <Image src="/images/logo.png" alt="UAchieve Logo" width={140} height={50} className="object-contain" />
          </Link>

          {!magicLinkSent ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full text-center"
            >
              <h1 className="text-slate-800 text-[28px] font-bold mb-4">Student Portal</h1>
              <p className="text-slate-500 text-base mb-10 leading-relaxed">
                Enter your email to receive a secure magic link. This should be the email used when booking your course.
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Magic Link"} <Sparkles size={18} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center flex flex-col items-center"
            >
              <div className="size-16 bg-lime-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={32} className="text-[#8DC63F]" />
              </div>
              <h2 className="text-slate-800 text-2xl font-bold mb-3">Check your email</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                We&apos;ve sent a secure login link to <span className="text-slate-800 font-bold">{email}</span>. 
                It will expire in 15 minutes.
              </p>
              <button 
                onClick={() => setMagicLinkSent(false)}
                className="text-sky-500 text-sm font-bold hover:underline"
              >
                Didn&apos;t get it? Try again
              </button>
            </motion.div>
          )}
          {message && <p className={`mt-4 text-sm ${magicLinkSent ? 'text-[#8DC63F]' : 'text-red-500'}`}>{message}</p>}

          <div className="w-full mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-3">
            <p className="text-slate-500 text-sm font-medium">Don&apos;t have an account yet?</p>
            <Link href="/courses" className="w-full sm:w-auto flex justify-center">
              <button className="w-full sm:w-auto h-[44px] px-8 outline outline-1 outline-gray-200 hover:bg-gray-50 text-slate-800 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm">
                Book your first course
              </button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentLoginPage;
