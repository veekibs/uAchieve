import { Suspense } from "react";
import Step1DetailsPage from "@/components/booking/Step1Details"; // Ensure font is Plus Jakarta Sans

export default function BookingStep1PageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <Step1DetailsPage />
    </Suspense>
  );
}