import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  paymentMethod: 'card' | 'klarna'; // Add paymentMethod prop
  klarnaLogoUrl?: string; // Support passing a custom URL from parent
  klarnaIcon?: React.ReactNode; // Support passing a custom icon component
}

export default function VerificationModal({ isOpen, paymentMethod, klarnaLogoUrl, klarnaIcon }: VerificationModalProps) {
  if (!isOpen) return null;

  const isCard = paymentMethod === 'card';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-80 max-w-96 p-8 bg-white rounded-2xl shadow-2xl flex flex-col justify-start items-center gap-6">
        {isCard ? (
          <div className="size-16 bg-sky-50 rounded-full flex items-center justify-center">
            <ShieldCheck size={32} className="text-sky-500" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="size-16 bg-pink-50 rounded-full flex items-center justify-center">
            {klarnaIcon ? (
              klarnaIcon
            ) : (
              <img 
                src={klarnaLogoUrl || "/images/klarna-logo.png"} 
                alt="Klarna Logo" 
                className="w-10 h-10 object-contain" 
              />
            )}
          </div>
        )}
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="self-stretch flex flex-col justify-start items-center">
            <div className="w-72 text-center justify-start text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
              {isCard ? "Additional verification required by your bank" : "Redirecting you to Klarna to complete your purchase"}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-center">
            <div className="w-72 text-center justify-start text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">
              Please wait while we securely process your payment...
            </div>
          </div>
        </div>
        <div className="size-12 relative flex items-center justify-center">
          <Loader2 size={48} className="text-sky-500 animate-spin" /> {/* Spinner color remains sky-500 */}
        </div>
      </div>
    </div>
  );
}