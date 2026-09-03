"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
} from "lucide-react";

import VerificationModal from "@/components/booking/VerificationModal";

export default function Step2PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'klarna'>('card');
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [courseDetails, setCourseDetails] = useState({
    title: "Basic Life Support",
    badge: "Beginner Friendly",
    date: "Saturday, 13 May 2026",
    time: "9:00 AM - 12:00 PM",
    venue: "Venue TBC (in email)",
    price: "85.00",
    image: "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop",
  });

  useEffect(() => {
    const slug = searchParams.get('slug');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const price = searchParams.get('price');
    const image = searchParams.get('image');

    const allCourses = [
      {
        slug: "bls",
        title: "Basic Life Support",
        badge: "Beginner Friendly",
        price: "85.00",
        image: "https://images.unsplash.com/photo-1622115297822-a3798fdbe1f6?q=80&w=2148&auto=format&fit=crop",
      },
      {
        slug: "efaw",
        title: "Emergency First Aid at Work",
        badge: "HSE Approved",
        price: "145.00",
        image: "https://images.unsplash.com/photo-1600091474842-83bb9c05a723?q=80&w=2148&auto=format&fit=crop",
      },
    ];

    if (slug) {
      const foundCourse = allCourses.find(course => course.slug === slug);
      if (foundCourse) {
        setCourseDetails({
          title: foundCourse.title,
          badge: foundCourse.badge,
          date: date || "Date TBC",
          time: time || "Time TBC",
          venue: "Venue TBC (in email)",
          price: price || foundCourse.price,
          image: image || foundCourse.image,
        });
      }
    }
  }, [searchParams]);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (expiryDate.endsWith(" / ") && input.length < expiryDate.length) {
      setExpiryDate(input.slice(0, -3));
      return;
    }
    const cleaned = input.replace(/\D/g, "");
    if (cleaned.length <= 4) {
      if (cleaned.length > 2) {
        setExpiryDate(`${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`);
      } else {
        setExpiryDate(cleaned);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // 1. Get metadata from URL (passed from Step 1)
    const email = searchParams.get('email');
    const sessionId = searchParams.get('sessionId');
    const courseId = searchParams.get('courseId');

    if (!email || !sessionId || !courseId) {
      alert("Booking details are missing. Please go back to the previous step.");
      return;
    }

    try {
      // 2. Show the "Processing" state
      setShowVerificationModal(true);

      // 3. Call your Stripe Checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          sessionId,
          userEmail: email,
          price: Number(courseDetails.price)
        }),
      });

      const { url, error } = await response.json();

      if (url) {
        // 4. Redirect to secure Stripe Checkout page
        window.location.href = url;
      } else {
        throw new Error(error || 'Failed to initialize Stripe');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setShowVerificationModal(false);
      alert("Unable to process payment. Please try again.");
    }
  };

  const getCardInputClass = (fieldValue: string, minLength?: number, pattern?: RegExp) => {
    const isInvalid = formSubmitted && (
      fieldValue.trim() === "" ||
      (minLength && fieldValue.trim().length < minLength) ||
      (pattern && !pattern.test(fieldValue.trim()))
    );
    return `w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] border ${isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#29ABE2]'} text-slate-800 placeholder-gray-400 text-base font-normal focus:outline-none focus:border-transparent`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-['Plus Jakarta Sans']">
      <Navbar />

      <main className="flex-1 w-full pt-[100px] lg:pt-[140px] pb-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Booking Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center items-start gap-1 mb-16"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-[#8DC63F] rounded-full outline outline-1 outline-offset-[-1.11px] outline-[#8DC63F] flex justify-center items-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <span className="text-[#8DC63F] text-xs font-bold leading-4 font-['Plus Jakarta Sans']">Your Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 relative">
              <div className="absolute top-0 left-0 h-full w-1/2 bg-[#8DC63F]" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-sky-500 rounded-full outline outline-1 outline-offset-[-1.11px] outline-sky-500 flex justify-center items-center">
                <span className="text-white text-sm font-bold leading-5 font-['Plus Jakarta Sans']">2</span>
              </div>
              <span className="text-slate-800 text-xs font-bold leading-4 font-['Plus Jakarta Sans']">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-4" />
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 bg-gray-200 rounded-full outline outline-1 outline-offset-[-1.11px] outline-gray-200 flex justify-center items-center">
                <span className="text-gray-400 text-sm font-bold leading-5 font-['Plus Jakarta Sans']">3</span>
              </div>
              <span className="text-gray-400 text-xs font-medium leading-4 font-['Plus Jakarta Sans']">Confirmation</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8"
            >
              <h2 className="text-slate-800 text-3xl font-bold leading-10 font-['Plus Jakarta Sans']">
                Payment
              </h2>
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <span className="text-gray-400 text-xs font-bold uppercase leading-4 tracking-wide font-['Plus Jakarta Sans']">
                    Select Payment Method
                  </span>
                  <div className="relative rounded-lg outline outline-1 outline-offset-[-1.11px] outline-gray-200 overflow-hidden">
                    <label className={`w-full px-4 py-4 flex items-center gap-3 border-b border-gray-200 cursor-pointer transition-colors ${selectedPaymentMethod === 'card' ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={selectedPaymentMethod === 'card'}
                        onChange={() => setSelectedPaymentMethod('card')}
                        className="hidden"
                      />
                      <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'card' ? 'border-sky-500 bg-sky-500' : 'border-gray-300 bg-white'}`}>
                        {selectedPaymentMethod === 'card' && <div className="size-2.5 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className={`text-base font-bold leading-6 font-['Plus Jakarta Sans'] ${selectedPaymentMethod === 'card' ? 'text-sky-500' : 'text-slate-600'}`}>
                          Credit / Debit Card
                        </span>
                        <div className="flex items-center gap-1.5 opacity-60">
                          <div className="w-8 h-5 px-1 bg-gray-200 rounded-sm flex justify-center items-center">
                            <span className="text-center text-gray-500 text-[8px] font-bold leading-3 font-['Plus Jakarta Sans']">VISA</span>
                          </div>
                          <div className="w-8 h-5 px-1 bg-gray-200 rounded-sm flex justify-center items-center">
                            <span className="text-center text-gray-500 text-[8px] font-bold leading-3 font-['Plus Jakarta Sans']">MC</span>
                          </div>
                          <div className="w-8 h-5 px-1 bg-gray-200 rounded-sm flex justify-center items-center">
                            <span className="text-center text-gray-500 text-[8px] font-bold leading-3 font-['Plus Jakarta Sans']">AMEX</span>
                          </div>
                        </div>
                      </div>
                    </label>

                    {selectedPaymentMethod === 'card' && (
                      <div className="p-6 flex flex-col gap-6 bg-white">
                        <p className="text-sm text-slate-500 italic">Enter any card details below; you will be redirected to Stripe for secure processing.</p>
                        <div>
                          <label htmlFor="cardNumber" className="block text-gray-700 text-sm font-medium leading-5 mb-1.5 font-['Plus Jakarta Sans']">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className={getCardInputClass(cardNumber, 16)}
                          />
                        </div>
                        <div>
                          <label htmlFor="cardholderName" className="block text-gray-700 text-sm font-medium leading-5 mb-1.5 font-['Plus Jakarta Sans']">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            id="cardholderName"
                            placeholder="Name on card"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className={getCardInputClass(cardholderName)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-medium leading-5 mb-1.5 font-['Plus Jakarta Sans']">
                              Expiry Date *
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              placeholder="MM / YY"
                              value={expiryDate}
                              onChange={handleExpiryChange}
                              className={getCardInputClass(expiryDate, undefined, /^\d{2}\s\/\s\d{2}$/)}
                            />
                          </div>
                          <div>
                            <label htmlFor="cvv" className="block text-gray-700 text-sm font-medium leading-5 mb-1.5 font-['Plus Jakarta Sans']">
                              CVV *
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              className={getCardInputClass(cvv, 3)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <label className={`w-full px-4 py-4 flex items-center gap-3 cursor-pointer transition-colors ${selectedPaymentMethod === 'klarna' ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="klarna"
                        checked={selectedPaymentMethod === 'klarna'}
                        onChange={() => setSelectedPaymentMethod('klarna')}
                        className="hidden"
                      />
                      <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethod === 'klarna' ? 'border-sky-500 bg-sky-500' : 'border-gray-300 bg-white'}`}>
                        {selectedPaymentMethod === 'klarna' && <div className="size-2.5 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className={`text-base font-bold leading-6 font-['Plus Jakarta Sans'] ${selectedPaymentMethod === 'klarna' ? 'text-sky-500' : 'text-slate-600'}`}>
                          Pay in 3 with Klarna
                        </span>
                        <div className="w-16 h-8 relative flex items-center">
                          <img 
                            src="https://x.klarnacdn.net/payment-method/assets/badges/generic/pink/klarna.svg" 
                            alt="Klarna" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <Link href="/book/step1" className="w-32 sm:w-52 block">
                    <button type="button" className="w-full h-14 rounded-xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 text-slate-600 text-base font-bold leading-6 font-['Plus Jakarta Sans'] transition-all hover:bg-gray-50 active:scale-[0.98]">
                      Back
                    </button>
                  </Link>
                  <button
                    type="submit"
                    className={`flex-1 h-14 px-12 rounded-xl text-white text-lg font-bold leading-7 font-['Plus Jakarta Sans'] transition-all ${
                      selectedPaymentMethod === 'card'
                        ? 'bg-[#8DC63F] hover:bg-[#7AB32E] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)]'
                        : 'bg-pink-300 hover:shadow-[0_0_28px_rgba(255,179,199,0.35)]'
                    } active:scale-[0.98]`}
                  >
                    {selectedPaymentMethod === 'card' ? 'Complete Booking' : 'Continue with Klarna'}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <CreditCard size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-400 text-xs font-normal leading-4 font-['Plus Jakarta Sans']">Secure payment protected by Stripe</span>
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.08)] border border-gray-200 h-fit"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-slate-800 text-lg font-bold leading-7 font-['Plus Jakarta Sans']">Order Summary</h2>
              </div>
              <div className="relative aspect-[4/3] w-full bg-gray-200">
                <Image
                  src={courseDetails.image}
                  alt={courseDetails.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-800 text-base font-bold leading-6 font-['Plus Jakarta Sans']">{courseDetails.title}</h3>
                  <span className="inline-flex items-center px-2 py-1 bg-neutral-100 rounded-sm outline outline-1 outline-offset-[-1.11px] outline-neutral-300 text-neutral-950 text-xs font-medium leading-4 w-fit font-['Plus Jakarta Sans']">
                    {courseDetails.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-sky-500 shrink-0" />
                    <span className="text-slate-600 text-sm font-normal leading-5 font-['Plus Jakarta Sans']">{courseDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-sky-500 shrink-0" />
                    <span className="text-slate-600 text-sm font-normal leading-5 font-['Plus Jakarta Sans']">{courseDetails.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-sky-500 shrink-0" />
                    <span className="text-slate-600 text-sm font-normal leading-5 font-['Plus Jakarta Sans']">{courseDetails.venue}</span>
                  </div>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-normal leading-5 font-['Plus Jakarta Sans']">Course Fee</span>
                  <span className="text-slate-800 text-sm font-bold leading-5 font-['Plus Jakarta Sans']">£{courseDetails.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 text-base font-bold leading-6 font-['Plus Jakarta Sans']">Total</span>
                  <span className="text-slate-800 text-3xl font-bold leading-10 font-['Plus Jakarta Sans']">£{courseDetails.price}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <VerificationModal 
        isOpen={showVerificationModal} 
        paymentMethod={selectedPaymentMethod} 
        klarnaLogoUrl="https://x.klarnacdn.net/payment-method/assets/badges/generic/pink/klarna.svg"
      />

      <Footer />
    </div>
  );
}
