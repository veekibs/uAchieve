"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatTimeRange } from "@/lib/time";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Check,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Loader2,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Step1DetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [courseType, setCourseType] = useState("first-time");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [shakingField, setShakingField] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login'>('guest');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Refs for auto-skip desktop layout cursor focus routing
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  // Initial template states to prevent next/image runtime crashes
  const [courseDetails, setCourseDetails] = useState({
    title: "Loading Course Details...",
    badge: "Accredited",
    date: "Loading Date...",
    time: "Loading Time...",
    venue: "Venue TBC",
    price: "145.00",
    image: "https://images.unsplash.com/photo-1600091474842-83bb9c05a723?q=80&w=2148&auto=format&fit=crop",
    duration: "Full Day",
  });

  const checkExistingUser = async (emailVal: string) => {
    if (!validateField('email', emailVal)) return;
    
    try {
      const response = await fetch(`/api/users/exists?email=${encodeURIComponent(emailVal.toLowerCase())}`);
      const data = await response.json();
      setEmailExists(data.exists);
    } catch (err) {
      console.error("Lookup error:", err);
      setEmailExists(false);
    }
  };

  const validateField = (name: string, value: string) => {
    if (!value.trim()) return false;
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (name === 'phone') {
      const cleaned = value.replace(/\s/g, '');
      return /^(?:(?:\+44\s?|0)7(?:[01345789]\d{2}|624)\s?\d{3}\s?\d{3})$|^((?:(?:\+44\s?|0)1\d{1,4}|(?:\+44\s?|0)2\d{1,2})\s?\d{3,4}\s?\d{3,4})$/.test(cleaned);
    }
    if (name === 'firstName' || name === 'lastName') return value.trim().length >= 2;
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string, value: string, nextRef: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === "Enter" && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      e.preventDefault();
      if (validateField(fieldName, value)) {
        nextRef.current?.focus();
      } else {
        setShakingField(fieldName);
        setTimeout(() => setShakingField(null), 500);
      }
    }
  };

  const capitalize = (str: string) => {
    return str.replace(/\b\w/g, (l) => l.toUpperCase());
  };



  const shakeVariants = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
  };

  const successVariants = {
    applied: { 
      scale: [1, 1.04, 1],
      boxShadow: ["0px 0px 0px rgba(141, 198, 63, 0)", "0px 0px 15px rgba(141, 198, 63, 0.4)", "0px 0px 0px rgba(141, 198, 63, 0)"],
      transition: { duration: 0.5 } 
    }
  };

  useEffect(() => {
    // Load remembered guest details from localStorage on mount (with simple decoding)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("ua_remembered_guest");
      if (saved) {
        try {
          const decoded = atob(saved);
          const details = JSON.parse(decoded);
          setFirstName(details.firstName || "");
          setLastName(details.lastName || "");
          setEmail(details.email || "");
          setPhone(details.phone || "");
          setCompanyName(details.companyName || "");
          setRememberMe(true);
        } catch (err) { console.error("Error decoding remembered details", err); }
      }
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        const emailAddr = session.user.email || "";
        setUserEmail(emailAddr);
        setEmail(emailAddr); // Synchronize email state for auto-fill
        
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, last_name, phone')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhone(profile.phone || "");
        }
      }
    };

    checkSession();

    const sessionUuid = searchParams.get('sessionId') || searchParams.get('session_id');

    if (sessionUuid) {
      setActiveSessionId(sessionUuid);
      const fetchSessionData = async () => {
        try {
          // Fixed Query: price_override is completely removed so it stops throwing 400 Bad Request!
          const { data, error } = await supabase
            .from('sessions')
            .select(`
              id,
              date,
              start_time,
              end_time,
              venue_name,
              max_capacity,
              bookings ( id ),
              courses!course_id (
                title,
                badge_label,
                duration_text,
                price
              )
            `)
            .eq('id', sessionUuid)
            .eq('is_active', true)
            .eq('is_archived', false)
            .eq('is_finalised', false)
            .single();

          if (error) {
            // Singular mapping lookup query backup configuration block (also cleaned of price_override)
            const { data: retryData, error: retryError } = await supabase
              .from('sessions')
               .select('id, date, start_time, end_time, venue_name, max_capacity, bookings(id), courses(title, badge_label, duration_text, price)')
              .eq('id', sessionUuid)
              .eq('is_active', true)
              .eq('is_archived', false)
              .eq('is_finalised', false)
              .single();

            if (retryError) throw retryError;
            if (retryData) processSessionResult(retryData);
          } else if (data) {
            processSessionResult(data);
          }
        } catch (err) {
          console.error("CATCH BLOCK PARSING DISPATCH EXCEPTION:", err);
        } {
          setPageLoading(false);
        }
      };

      const processSessionResult = (data: any) => {
        const course = Array.isArray(data.courses) ? data.courses[0] : data.courses;
        const sessionDate = data.date ? new Date(data.date) : new Date();
        const bookedCount = Array.isArray(data.bookings) ? data.bookings.length : 0;
        const maxCap = data.max_capacity || 12;

        if (bookedCount >= maxCap) {
          setIsFullyBooked(true);
        }

        const formattedDate = sessionDate.toLocaleDateString('en-GB', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });

        const formattedTime = formatTimeRange(data.start_time, data.end_time) || "TBC";

        setCourseDetails({
          title: course?.title || "First Aid Training Course",
          badge: course?.badge_label || "Accredited",
          date: formattedDate,
          time: formattedTime,
          venue: data.venue_name || "Venue TBC (Details in Email)",
          // Read price directly from the parent courses relation object matching your schema diagram!
          price: course?.price ? Number(course.price).toFixed(2) : "145.00",
          duration: course?.duration_text || "Full Day",
          image: course?.title?.includes("Basic")
            ? "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1600091474842-83bb9c05a723?q=80&w=2148&auto=format&fit=crop"
        });
      };

      fetchSessionData();
    } else {
      setPageLoading(false);
    }
  }, [searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const isValid = isLoggedIn || (
      validateField('firstName', firstName) &&
      validateField('lastName', lastName) &&
      validateField('email', email) &&
      validateField('phone', phone) &&
      agreedToTerms
    );

    if (isValid) {
      // Save or clear remembered details based on toggle (with simple encoding)
      if (!isLoggedIn && rememberMe) {
        const details = { firstName, lastName, email, phone, companyName };
        localStorage.setItem("ua_remembered_guest", btoa(JSON.stringify(details)));
      } else if (!isLoggedIn && !rememberMe) {
        localStorage.removeItem("ua_remembered_guest");
      }

      setIsLoading(true);
      setSubmitError(null);
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            surname: lastName,
            email: isLoggedIn ? userEmail : email,
            phone, 
            companyName,
            courseId: searchParams.get('courseId'),
            sessionId: activeSessionId,
            courseName: courseDetails.title,
            price: courseDetails.price,
            date: courseDetails.date,
            time: courseDetails.time,
            venue: courseDetails.venue,
            badge: courseDetails.badge,
            duration: courseDetails.duration,
            courseType: courseType,
            smsConsent: smsConsent,
          }),
        });

        const data = await response.json();
        if (response.ok && data.url) {
          window.location.href = data.url;
        } else {
          setSubmitError(data.error || 'Could not initialize checkout. Please try again.');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Checkout Error Processing Payload:", err);
        setIsLoading(false);
        setSubmitError(err?.message || 'Something went wrong while setting up your payment. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus Jakarta Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Booking Stepper Layout */}
          <div className="flex justify-center items-start gap-1 mb-16">
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-sky-500 rounded-full flex justify-center items-center text-white text-sm font-bold">1</div>
              <span className="text-slate-800 text-xs font-bold font-['Plus Jakarta Sans']">Your Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 relative">
              <div className="absolute top-0 left-0 h-full w-1/2 bg-lime-400" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-gray-200 rounded-full flex justify-center items-center text-gray-400 text-sm font-bold">2</div>
              <span className="text-gray-400 text-xs font-medium leading-4 font-['Plus Jakarta Sans']">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4" />
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-gray-200 rounded-full flex justify-center items-center text-gray-400 text-sm font-bold">3</div>
              <span className="text-gray-400 text-xs font-medium leading-4 font-['Plus Jakarta Sans']">Confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
            {/* Form Section Column */}
            <div className="flex flex-col gap-8">
              <h2 className="text-slate-800 text-3xl font-bold">
                Your Details
              </h2>
              
              {isFullyBooked && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-2 text-red-800">
                  <div className="flex items-center gap-2 font-bold text-red-900 text-base">
                    <span>🚫 Session Fully Booked</span>
                  </div>
                  <p className="text-sm">
                    This training session has reached maximum capacity. Please return to the course page to select another available date.
                  </p>
                </div>
              )}

              {isLoggedIn ? (
                <div className="flex flex-col gap-6">
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-center gap-3">
                    <CheckCircle className="text-[#8DC63F]" size={20} />
                    <div>
                      <p className="text-slate-800 text-sm font-bold">Welcome back!</p>
                      <p className="text-slate-500 text-xs font-medium">Logged in as {userEmail}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isLoading || pageLoading || isFullyBooked}
                    className="w-full h-14 bg-[#8DC63F] rounded-xl text-white text-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="animate-spin" />}
                    {isFullyBooked ? "Session Fully Booked" : (isLoading ? "Processing..." : "Proceed to Payment")}
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-slate-800 text-sm font-semibold mb-1.5">First Name <span className="text-red-500" aria-hidden="true">*</span></label>
                      <motion.div animate={shakingField === "firstName" ? "shake" : "idle"} variants={shakeVariants}>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          required
                          aria-required="true"
                          aria-invalid={formSubmitted && !validateField('firstName', firstName)}
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(capitalize(e.target.value))}
                          onKeyDown={(e) => handleKeyDown(e, "firstName", firstName, lastNameRef)}
                          className={`w-full min-h-[48px] px-4 py-3 bg-white rounded-xl border ${formSubmitted && !validateField('firstName', firstName) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} text-slate-900 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-shadow`}
                        />
                      </motion.div>
                      {formSubmitted && !validateField('firstName', firstName) && (
                        <p className="text-xs text-red-600 mt-1 font-medium" role="alert">Please enter a valid first name (at least 2 characters).</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-slate-800 text-sm font-semibold mb-1.5">Last Name <span className="text-red-500" aria-hidden="true">*</span></label>
                      <motion.div animate={shakingField === "lastName" ? "shake" : "idle"} variants={shakeVariants}>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                          required
                          aria-required="true"
                          aria-invalid={formSubmitted && !validateField('lastName', lastName)}
                          ref={lastNameRef}
                          placeholder="Smith"
                          value={lastName}
                          onChange={(e) => setLastName(capitalize(e.target.value))}
                          onKeyDown={(e) => handleKeyDown(e, "lastName", lastName, emailRef)}
                          className={`w-full min-h-[48px] px-4 py-3 bg-white rounded-xl border ${formSubmitted && !validateField('lastName', lastName) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} text-slate-900 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-shadow`}
                        />
                      </motion.div>
                      {formSubmitted && !validateField('lastName', lastName) && (
                        <p className="text-xs text-red-600 mt-1 font-medium" role="alert">Please enter a valid last name (at least 2 characters).</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-slate-800 text-sm font-semibold mb-1.5">Email Address <span className="text-red-500" aria-hidden="true">*</span></label>
                    <motion.div animate={shakingField === "email" ? "shake" : "idle"} variants={shakeVariants}>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        required
                        aria-required="true"
                        aria-invalid={formSubmitted && !validateField('email', email)}
                        ref={emailRef}
                        placeholder="john.smith@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailExists) setEmailExists(false);
                        }}
                        onBlur={(e) => checkExistingUser(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "email", email, phoneRef)}
                        className={`w-full min-h-[48px] px-4 py-3 bg-white rounded-xl border ${formSubmitted && !validateField('email', email) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} text-slate-900 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-shadow`}
                      />
                    </motion.div>
                    {formSubmitted && !validateField('email', email) && (
                      <p className="text-xs text-red-600 mt-1 font-medium" role="alert">Please enter a valid email address.</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label htmlFor="phone" className="text-slate-800 text-sm font-semibold">Phone Number <span className="text-red-500" aria-hidden="true">*</span></label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] rounded-full focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none" aria-label="Why do we ask for your phone number?">
                            <HelpCircle size={15} className="text-slate-500 cursor-help" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent sideOffset={5} className="bg-[#29ABE2] text-white border-none rounded-xl shadow-xl w-64 p-3.5 text-xs font-medium leading-relaxed">
                          <p>We only use your number to send vital on-the-day updates regarding venue changes, parking info, or emergency trainer cancellations. Zero spam.</p>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <motion.div animate={shakingField === "phone" ? "shake" : "idle"} variants={shakeVariants}>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        required
                        aria-required="true"
                        aria-invalid={formSubmitted && !validateField('phone', phone)}
                        ref={phoneRef}
                        placeholder="07123 456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "phone", phone, companyRef)}
                        className={`w-full min-h-[48px] px-4 py-3 bg-white rounded-xl border ${formSubmitted && !validateField('phone', phone) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} text-slate-900 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-shadow`}
                      />
                    </motion.div>
                    {formSubmitted && !validateField('phone', phone) && (
                      <p className="text-xs text-red-600 mt-1 font-medium" role="alert">Please enter a valid UK phone number.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="companyName" className="block text-slate-800 text-sm font-semibold mb-1.5">Company Name <span className="text-slate-500 text-xs font-normal">(Optional)</span></label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      autoComplete="organization"
                      ref={companyRef}
                      placeholder="Your company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-3 bg-white rounded-xl border border-gray-300 text-slate-900 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <span id="course-type-label" className="block text-slate-800 text-sm font-semibold mb-2">Course Type <span className="text-red-500" aria-hidden="true">*</span></span>
                    <div className="flex flex-col gap-3" role="radiogroup" aria-labelledby="course-type-label">
                      <label className={`flex items-center min-h-[52px] p-4 rounded-xl border cursor-pointer transition-all ${courseType === 'first-time' ? 'bg-sky-500/5 border-sky-500 ring-1 ring-sky-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="courseType" checked={courseType === 'first-time'} onChange={() => setCourseType('first-time')} className="sr-only" />
                        <div className={`size-5 rounded-full border flex items-center justify-center mr-3 shrink-0 ${courseType === 'first-time' ? 'border-sky-500 bg-sky-500' : 'border-gray-300 bg-white'}`}>{courseType === 'first-time' && <div className="size-2.5 bg-white rounded-full" />}</div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-bold text-sm">First Time Training</span>
                          <span className="text-slate-600 text-xs">Learning first aid skills for the first time</span>
                        </div>
                      </label>
                      <label className={`flex items-center min-h-[52px] p-4 rounded-xl border cursor-pointer transition-all ${courseType === 'refresher' ? 'bg-sky-500/5 border-sky-500 ring-1 ring-sky-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="courseType" checked={courseType === 'refresher'} onChange={() => setCourseType('refresher')} className="sr-only" />
                        <div className={`size-5 rounded-full border flex items-center justify-center mr-3 shrink-0 ${courseType === 'refresher' ? 'border-sky-500 bg-sky-500' : 'border-gray-300 bg-white'}`}>{courseType === 'refresher' && <div className="size-2.5 bg-white rounded-full" />}</div>
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-bold text-sm">Refresher / Certificate Renewal</span>
                          <span className="text-slate-600 text-xs">Renewing or updating your existing certificate parameters</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center min-h-[48px] gap-3 cursor-pointer py-1">
                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="sr-only" />
                    <div className={`size-5 rounded-md border flex items-center justify-center shrink-0 ${rememberMe ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-300'}`}>{rememberMe && <Check size={14} className="text-white stroke-[3]" />}</div>
                    <span className="text-slate-700 text-sm font-medium select-none">Remember my details for next time</span>
                  </label>

                  <label className="flex items-center min-h-[48px] gap-3 cursor-pointer py-1">
                    <input type="checkbox" checked={smsConsent} onChange={() => setSmsConsent(!smsConsent)} className="sr-only" />
                    <div className={`size-5 rounded-md border flex items-center justify-center shrink-0 ${smsConsent ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-300'}`}>{smsConsent && <Check size={14} className="text-white stroke-[3]" />}</div>
                    <span className="text-slate-700 text-sm select-none">I consent to receive SMS reminders about my booking</span>
                  </label>

                  <label className="flex items-start min-h-[48px] gap-3 cursor-pointer py-1">
                    <input type="checkbox" checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} className="sr-only" required aria-required="true" />
                    <div className={`size-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${agreedToTerms ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-300'}`}>{agreedToTerms && <Check size={14} className="text-white stroke-[3]" />}</div>
                    <span className="text-slate-700 text-sm select-none leading-relaxed">
                      I agree to the{" "}
                      <Link href="/policies/terms" target="_blank" className="text-sky-600 font-semibold underline hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none rounded" onClick={(e) => e.stopPropagation()}>terms</Link>
                      {" "}and{" "}
                      <Link href="/policies/cancellation" target="_blank" className="text-sky-600 font-semibold underline hover:text-sky-700 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none rounded" onClick={(e) => e.stopPropagation()}>cancellation policies</Link>
                    </span>
                  </label>

                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium flex items-start gap-2.5" role="alert">
                      <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{submitError}</p>
                        <p className="text-xs text-red-600 mt-1 font-normal">No payment was taken and your card was NOT charged.</p>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading || isFullyBooked} className="w-full min-h-[52px] h-14 bg-[#8DC63F] hover:bg-[#7AB32E] text-white rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_24px_rgba(141,198,63,0.35)] focus-visible:ring-2 focus-visible:ring-[#8DC63F] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50">
                    {isLoading && <Loader2 className="animate-spin" />}
                    {isFullyBooked ? "Session Fully Booked" : (isLoading ? "Preparing Checkout..." : "Continue to Payment")}
                  </button>
                </form>
              )}
            </div>

            {/* Order Card Container Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-fit">
              <div className="p-6 border-b border-slate-100"><h2 className="text-slate-800 text-lg font-bold">Order Summary</h2></div>
              <div className="relative aspect-[4/3] w-full bg-gray-200">
                {courseDetails.image && <Image src={courseDetails.image} alt={courseDetails.title} fill className="object-cover" priority />}
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-800 text-base font-bold">{courseDetails.title}</h3>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-950 border border-neutral-300 text-xs font-medium w-fit rounded-sm">{courseDetails.badge}</span>
                </div>
                <div className="flex flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-sky-500" /><span>{courseDetails.date}</span></div>
                  <div className="flex items-center gap-2"><Clock size={16} className="text-sky-500" /><span>{courseDetails.time}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-sky-500" /><span>{courseDetails.venue}</span></div>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Course Fee</span><span className="text-slate-800 font-bold">£{courseDetails.price}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-800 text-base font-bold">Total</span><span className="text-slate-800 text-3xl font-bold">£{courseDetails.price}</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}