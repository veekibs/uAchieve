"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Login Page
 * Accessible to the client (Ann) for internal management.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Authenticate securely via Supabase
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    console.log("Authenticated successfully");
    // Force a hard navigation so middleware picks up the new cookie instantly
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center px-6 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1.11px] outline-[#E5E7EB] flex flex-col items-center">
        
        {/* Brand/Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="pb-4">
            <Image 
              src="/images/logo.png" 
              alt="UAchieve Logo" 
              width={160} 
              height={60} 
              className="relative object-contain h-auto w-auto"
            />
          </div>
          <h1 className="text-[#1A2E3B] text-2xl font-bold font-['Plus_Jakarta_Sans'] leading-8">
            Admin Portal
          </h1>
          <p className="mt-2 text-[#4A5568] text-sm font-normal leading-5 max-w-[280px]">
            Sign in to manage training sessions and student attendance.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-5 p-3 bg-[#FEF2F2] rounded-[10px] outline outline-1 outline-offset-[-1.11px] outline-[#F87171] flex items-center justify-center gap-2">
            <AlertCircle size={16} className="text-[#B91C1C]" />
            <span className="text-[#B91C1C] text-sm font-medium leading-5">
                {error}
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="pl-1 text-[#1A2E3B] text-sm font-semibold leading-5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@uachieve.com"
              className={`w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-offset-[-1.11px] outline-[#E5E7EB] ${error ? 'border-[#F87171] text-[#1A2E3B]' : 'border-[#E5E7EB] text-[#9CA3AF]'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#29ABE2] transition-all`}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="pl-1 text-[#1A2E3B] text-sm font-semibold leading-5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full h-12 pl-4 pr-12 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-offset-[-1.11px] outline-[#E5E7EB] ${error ? 'border-[#F87171] text-[#1A2E3B]' : 'border-[#E5E7EB] text-[#9CA3AF]'} text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#29ABE2] transition-all`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4A5568] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full h-12 bg-[#29ABE2] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] flex justify-center items-center gap-2 text-white text-base font-semibold leading-6 hover:bg-[#1A2E3B] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="w-full mt-8 pt-6 border-t border-[#E5E7EB] text-center">
          <p className="text-[#9CA3AF] text-xs font-normal leading-4">
            Protected by UAchieve. Internal access only.
          </p>
        </div>
      </div>
    </div>
  );
}
