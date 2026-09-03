"use client";

import Step3ConfirmationPage from "@/components/booking/Step3Confirmation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function BookingConfirmationPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>}><Step3ConfirmationPage /></Suspense>;
}