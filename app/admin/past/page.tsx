"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminPastSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/admin/past');
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Response Error:", res.status, errorText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSessions(data);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;

  return (
    <main className="w-full max-w-[768px] mx-auto pt-6 pb-24">
      <div className="px-4 flex flex-col gap-8">
        <div>
          <h1 className="text-slate-800 text-3xl font-bold leading-9">Past Sessions</h1>
          <p className="text-slate-600 text-base leading-6 mt-2">Review historical attendance and certificates.</p>
        </div>

        <div className="flex flex-col gap-4">
          {sessions.length === 0 && <p className="text-slate-500 italic">No past sessions found.</p>}
          {sessions.map(session => {
            const attendedCount = session.bookings?.filter((b: any) => b.attendance_status === 'attended').length || 0;
            return (
              <div key={session.id} className="p-4 bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-[#E5E7EB] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-slate-800 text-base font-bold leading-5">{session.course.title}</span>
                    <span className="text-gray-400 text-xs mt-1 leading-5">{new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {new Date(session.date).getFullYear()}</span>
                  </div>
                  <Link href={`/admin/bookings/${session.id}`} className="text-[#29ABE2] text-sm font-semibold hover:underline">
                    View
                  </Link>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-slate-600 text-xs">{attendedCount}/{session.max_capacity} attended</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className="text-[#8DC63F]" />
                    <span className="text-slate-600 text-xs">{attendedCount} certs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}