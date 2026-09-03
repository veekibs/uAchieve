"use client";

import React, { Suspense } from "react";
import Step3ConfirmationPage from "@/components/booking/Step3Confirmation";
import { Loader2 } from "lucide-react";

export default function BookingStep3PageWrapper() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-sky-500" size={40} />
        </div>
      }
    >
      <Step3ConfirmationPage />
    </Suspense>
  );
}