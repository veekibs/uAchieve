"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, Award, XCircle, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminSessionRosterPage() {
  const params = useParams<{ id: string }>();
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showFinaliseModal, setShowFinaliseModal] = useState(false);
  const [isFinalising, setIsFinalising] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!params?.id) return;
      try {
        const res = await fetch(`/api/admin/sessions/${params.id}`);
        const data = await res.json();
        setSelectedSession(data);
      } catch (err) {
        console.error("Failed to load session", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [params?.id]);

  const handleUpdateBooking = async (bookingId: string, updates: { attendance_status?: string; is_completed?: boolean }) => {
    setProcessingId(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save changes to the database");
      }
      
      setSelectedSession((prev: any) => ({
        ...prev,
        bookings: prev.bookings.map((b: any) => 
          b.id === bookingId ? { ...b, ...updates } : b
        )
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to update booking. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFinaliseSession = async () => {
    setIsFinalising(true);
    try {
      const response = await fetch(`/api/admin/sessions/${params.id}/finalise`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to finalise session");
      }
      
      setSelectedSession((prev: any) => ({
        ...prev,
        is_finalised: true
      }));
      
      setShowFinaliseModal(false);
      alert("Session has been finalised and emails sent successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to finalise session. Please try again.");
    } finally {
      setIsFinalising(false);
    }
  };

  const handleNotifyStudents = async () => {
    setIsNotifying(true);
    try {
      const response = await fetch(`/api/admin/sessions/${params.id}/notify`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to notify students");
      }
      
      const data = await response.json();
      
      setSelectedSession((prev: any) => ({
        ...prev,
        certificate_notified_at: data.session.certificate_notified_at
      }));
      
      setShowNotifyModal(false);
      alert(`Successfully sent certificate emails to ${data.notifiedCount} completed student(s).`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to notify students. Please try again.");
    } finally {
      setIsNotifying(false);
    }
  };

  const handleCancelSession = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/admin/sessions/${params.id}/cancel`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel session");
      }
      
      const data = await response.json();
      
      setShowCancelModal(false);
      let alertMsg = `Session cancelled successfully.\n- Processed ${data.processedCount} booking(s).\n- Applied ${data.refundTier}% refund tier.`;
      if (data.manualRefundsNeeded > 0) {
        alertMsg += `\n⚠️ Note: ${data.manualRefundsNeeded} manual refund(s) may require manual admin action in Stripe.`;
      }
      alert(alertMsg);
      // Redirect back to admin dashboard since session is now archived
      window.location.href = "/admin";
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to cancel session. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
  }

  if (!selectedSession || selectedSession.error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Session not found.</p></div>;
  }

  const attendedCount = selectedSession.bookings?.filter((b: any) => b.attendance_status === 'attended').length || 0;
  const completedCount = selectedSession.bookings?.filter((b: any) => b.is_completed).length || 0;

  return (
    <main className="w-full max-w-[768px] mx-auto pb-32 flex flex-col justify-start items-start relative min-h-screen">
      <div className="w-full px-4 pt-6 flex flex-col gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-sky-500 transition-colors w-fit font-bold text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
 
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] gap-6 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-800">{selectedSession.course.title}</h1>
                {selectedSession.is_finalised ? (
                  <span className="px-3 py-1 bg-red-50 text-red-500 border border-red-100 rounded-full font-bold text-xs flex items-center gap-1">
                    🔒 Finalised
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full font-bold text-xs">
                    Active Roster
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 mb-4">
                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-sky-500"/> {new Date(selectedSession.date).toLocaleDateString('en-GB')}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-sky-500"/> {selectedSession.venue_name}</span>
              </div>
              
              {!selectedSession.is_finalised ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowFinaliseModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Finalise Session
                  </button>
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    Cancel Session
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowNotifyModal(true)}
                  disabled={!!selectedSession.certificate_notified_at}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedSession.certificate_notified_at ? "Students Notified" : "Notify Students"}
                </button>
              )}
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="flex-1 lg:flex-none p-4 bg-sky-50 rounded-2xl border border-sky-100 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-sky-600">{selectedSession.bookings.length}</span>
                <span className="text-[10px] uppercase font-bold text-sky-500 tracking-wider">Enrolled</span>
              </div>
              <div className="flex-1 lg:flex-none p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-blue-600">{attendedCount}</span>
                <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Attended</span>
              </div>
              <div className="flex-1 lg:flex-none p-4 bg-lime-50 rounded-2xl border border-lime-100 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-[#8DC63F]">{completedCount}</span>
                <span className="text-[10px] uppercase font-bold text-[#7AB32E] tracking-wider">Completed</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-slate-400 w-[40%]">Student & Type</th>
                    <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-slate-400 w-[30%]">Contact Info</th>
                    <th className="py-4 px-6 text-xs uppercase tracking-wider font-bold text-slate-400 text-right w-[30%]">Actions / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedSession.bookings.length === 0 && ( 
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">No students enrolled in this session yet.</td>
                    </tr> 
                  )}
                  {selectedSession.bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-800 text-base">{booking.user.first_name} {booking.user.last_name}</span>
                          {booking.course_type === 'refresher' ? (
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200/80 text-[11px] font-bold rounded-md inline-flex items-center gap-1">
                              🔄 Renewal
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold rounded-md inline-flex items-center gap-1">
                              🌱 First Time
                            </span>
                          )}
                        </div>
                        {booking.user.company_name && (
                          <div className="text-xs text-slate-500 font-medium mb-1">
                            🏢 {booking.user.company_name}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 font-mono">Ref: {booking.booking_reference}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 text-sm text-slate-600 font-medium">
                          <span className="flex items-center gap-2 truncate">
                            <Mail size={14} className="text-gray-400 shrink-0"/> {booking.user.email}
                          </span>
                          {booking.user.phone && (
                            <span className="flex items-center gap-2 truncate">
                              <Phone size={14} className="text-gray-400 shrink-0"/> {booking.user.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2 items-center flex-wrap">
                          {selectedSession.is_finalised ? (
                            <>
                              {booking.attendance_status === 'attended' && (
                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-xs">
                                  Attended
                                </span>
                              )}
                              {booking.attendance_status === 'noshow' && (
                                <span className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg font-bold text-xs">
                                  No Show
                                </span>
                              )}
                              {booking.attendance_status === 'not_attended' && (
                                <span className="px-3 py-1.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg font-bold text-xs">
                                  Unmarked
                                </span>
                              )}
                              {booking.attendance_status === 'attended' && booking.is_completed && (
                                <span className="px-3 py-1.5 bg-lime-50 text-[#8DC63F] border border-lime-100 rounded-lg font-bold text-xs">
                                  Completed
                                </span>
                              )}
                              {booking.attendance_status === 'attended' && !booking.is_completed && (
                                <span className="px-3 py-1.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg font-bold text-xs">
                                  Attended Only
                                </span>
                              )}
                            </>
                          ) : (
                            processingId === booking.id ? (
                              <Loader2 size={20} className="animate-spin text-sky-500" />
                            ) : (
                              <>
                                {/* Presence Control */}
                                {booking.attendance_status === 'not_attended' && (
                                  <>
                                    <button onClick={() => handleUpdateBooking(booking.id, { attendance_status: 'attended' })} className="px-3 py-1.5 bg-sky-500 text-white rounded-xl text-xs font-bold hover:bg-sky-600 active:scale-95 transition-all">Mark Attended</button>
                                    <button onClick={() => handleUpdateBooking(booking.id, { attendance_status: 'noshow' })} className="px-3 py-1.5 bg-white border border-gray-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95 transition-all">No Show</button>
                                  </>
                                )}

                                {booking.attendance_status === 'attended' && (
                                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-xs">
                                    Attended
                                  </span>
                                )}

                                {booking.attendance_status === 'noshow' && (
                                  <span className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-100 rounded-lg font-bold text-xs">
                                    No Show
                                  </span>
                                )}

                                {/* Completion Control */}
                                {booking.attendance_status === 'attended' && (
                                  booking.is_completed ? (
                                    <span className="px-3 py-1.5 bg-lime-50 text-[#8DC63F] border border-lime-100 rounded-lg font-bold text-xs">
                                      Completed
                                    </span>
                                  ) : (
                                    <button onClick={() => handleUpdateBooking(booking.id, { is_completed: true })} className="px-3 py-1.5 bg-[#8DC63F] text-white rounded-xl text-xs font-bold hover:bg-[#7AB32E] active:scale-95 transition-all">Complete Training</button>
                                  )
                                )}
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showFinaliseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-100 flex flex-col gap-6 text-left"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-slate-800">Finalise Session?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    This will finalise the session and send emails to all students. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowFinaliseModal(false)} 
                    disabled={isFinalising}
                    className="flex-1 h-12 rounded-2xl border border-gray-200 text-slate-600 font-bold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleFinaliseSession} 
                    disabled={isFinalising}
                    className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isFinalising ? <Loader2 className="animate-spin" size={20} /> : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showNotifyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-100 flex flex-col gap-6 text-left"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-slate-800">Send Certificates?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Send certificate-ready email to all completed students?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowNotifyModal(false)} 
                    disabled={isNotifying}
                    className="flex-1 h-12 rounded-2xl border border-gray-200 text-slate-600 font-bold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNotifyStudents} 
                    disabled={isNotifying}
                    className="flex-1 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isNotifying ? <Loader2 className="animate-spin" size={20} /> : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-100 flex flex-col gap-6 text-left"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-red-600">Cancel Session?</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    <strong>Warning:</strong> This will cancel the entire session, send tier-based cancellation notice emails to all enrolled students, and attempt Stripe refunds based on policy (14+ days: full, 7-14 days: 50%, &lt;7 days: rebook only).
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    This action will archive the session and remove it from public view.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowCancelModal(false)} 
                    disabled={isCancelling}
                    className="flex-1 h-12 rounded-2xl border border-gray-200 text-slate-600 font-bold disabled:opacity-50"
                  >
                    Keep Session
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelSession} 
                    disabled={isCancelling}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isCancelling ? <Loader2 className="animate-spin" size={20} /> : "Confirm Cancellation"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
      </div>
    </main>
  );
}