"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans'] flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Navbar Layer */}
        <div className="h-14 relative bg-white/70 backdrop-blur-md shadow-[0px_4px_24px_0px_rgba(0,0,0,0.06)] border-b border-sky-500/20 flex justify-center items-center">
          <div className="w-full max-w-[1280px] px-6 flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <Image src="/images/logo.png" alt="Logo" width={64} height={32} className="w-16 h-8 object-contain" />
            </div>
            <div className="flex justify-start items-center gap-4">
              <div className="size-9 bg-[#29ABE2] rounded-full flex justify-center items-center">
                <div className="text-white text-sm font-bold leading-5">AN</div>
              </div>
              <button onClick={handleLogout} className="text-[#9CA3AF] text-sm font-medium hover:text-[#4A5568] transition-colors leading-5">
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-12 bg-white/70 backdrop-blur-md shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] border-b border-gray-200 flex">
          <Link href="/admin" className={`flex-1 flex justify-center items-center transition-all ${pathname === '/admin' ? 'border-b-2 border-[#29ABE2]' : ''}`}>
            <span className={`text-sm font-medium leading-5 ${pathname === '/admin' ? 'text-[#29ABE2]' : 'text-[#4A5568]'}`}>Sessions</span>
          </Link>
          <Link href="/admin/past" className={`flex-1 flex justify-center items-center transition-all ${pathname === '/admin/past' ? 'border-b-2 border-[#29ABE2]' : ''}`}>
            <span className={`text-sm font-medium leading-5 ${pathname === '/admin/past' ? 'text-[#29ABE2]' : 'text-[#4A5568]'}`}>Past Sessions</span>
          </Link>
        </div>
      </div>

      <div className="pt-[104px] flex-1 flex flex-col">{children}</div>
    </div>
  );
}