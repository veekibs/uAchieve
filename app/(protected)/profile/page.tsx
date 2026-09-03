"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import CertificatesTab from "@/components/profile/CertificatesTab";
import AccountSettingsTab from "@/components/profile/AccountSettingsTab";
import MyBookingsTab from "@/components/profile/MyBookingsTab";
import {
  Mail,
  Phone,
  CalendarDays,
  Edit,
  BookOpen,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("certificates");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // User profile data
  const [user, setUser] = useState({
    initials: "U",
    fullName: "Loading...",
    email: "",
    phone: "",
    memberSince: "",
    role: "student"
  });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile (might be missing or RLS blocked):", error);
        }
        
        // Security: Bounce admins out of the student portal!
        if (profile?.role === 'admin') {
          window.location.href = '/admin';
          return;
        }

        if (profile) {
          setUser({
            initials: `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase(),
            fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Student",
            email: profile.email,
            phone: profile.phone || "No phone added",
            memberSince: `Member since ${new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
            role: profile.role
          });
        } else {
          // Fallback if the public.users record doesn't exist yet or is blocked
          setUser({
            initials: session.user.email?.[0].toUpperCase() || "U",
            fullName: "Student",
            email: session.user.email || "",
            phone: "No phone added",
            memberSince: `Member since ${new Date(session.user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
            role: 'student'
          });
        }
      }
      setLoading(false);
    };
    getProfile();
  }, [supabase]);

  // If loading or the user is an admin, show nothing while the redirect happens
  if (loading || user.role === 'admin') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* User Profile Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-200 flex flex-col items-center gap-6"
          >
            {/* Design specified avatar gradient */}
            <div className="size-20 bg-gradient-to-br from-sky-500 via-sky-400 via-[7%] to-[#8DC63F] rounded-full flex justify-center items-center shadow-lg shrink-0">
              <span className="text-white text-3xl font-bold leading-10">
                {user.initials}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-slate-800 text-2xl font-bold leading-9">
                {user.fullName}
              </h2>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-sky-500 shrink-0" />
                  <span className="text-gray-400 text-sm font-normal leading-5">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-sky-500 shrink-0" />
                  <span className="text-gray-400 text-sm font-normal leading-5">
                    {user.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-sky-500 shrink-0" />
                  <span className="text-gray-400 text-sm font-normal leading-5">
                    {user.memberSince}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full gap-3 mt-2">
              <button className="flex-1 h-12 rounded-xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 text-slate-800 text-sm font-medium leading-5 transition-all hover:bg-gray-50 active:scale-[0.98] flex items-center justify-center gap-2">
                <Edit size={16} />
                Edit Profile
              </button>
              <Link href="/courses" className="flex-1">
                <button className="w-full h-12 bg-[#8DC63F] rounded-xl text-white text-sm font-medium leading-5 transition-all hover:bg-[#7AB32E] active:scale-[0.98] flex items-center justify-center gap-2">
                  <BookOpen size={16} className="hidden sm:block" />
                  Book New Course
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="self-stretch border-b border-slate-100 mt-8 mb-8 overflow-x-auto no-scrollbar">
            <nav className="flex gap-8 min-w-max justify-center">
              {[
                { id: "certificates", label: "My Certificates" },
                { id: "bookings", label: "My Bookings" },
                { id: "settings", label: "Account Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-3 text-sm font-bold leading-5 transition-colors ${
                    activeTab === tab.id
                      ? "text-sky-500"
                      : "text-gray-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content Area */}
          <div className="min-h-[400px]">
            {activeTab === "certificates" && <CertificatesTab />}
            {activeTab === "bookings" && <MyBookingsTab onSwitchTab={setActiveTab} />}
            {activeTab === "settings" && <AccountSettingsTab />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
