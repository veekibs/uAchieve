"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Calendar, Clock, MapPin, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [stats, setStats] = useState({ 
    totalStudentsTrained: 0, 
    certificatesIssued: 0,
    totalRevenue: 0 
  });
  const [newSessionData, setNewSessionData] = useState({
    course_id: '', // Will be mapped from selected course title
    date: '',
    max_capacity: 12,
    start_time: '09:00',
    end_time: '15:00',
    venue_name: '', // New field for venue
    venue_address: '', // Added required address field
  });
  const [courses, setCourses] = useState<any[]>([]); // To fetch actual courses

  // Address lookup autocomplete states
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isValidAddressSelected, setIsValidAddressSelected] = useState(false);

  // Edit Session States
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [editSessionData, setEditSessionData] = useState({
    course_id: '',
    date: '',
    max_capacity: 12,
    start_time: '09:00',
    end_time: '15:00',
    venue_name: '',
    venue_address: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editWarning, setEditWarning] = useState<{ show: boolean; message: string; payload: any } | null>(null);
  const [editAddressInput, setEditAddressInput] = useState('');
  const [editIsValidAddress, setEditIsValidAddress] = useState(true);

  const supabase = createClient();

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (!res.ok) {
        // Log the full response for debugging the SyntaxError
        const errorText = await res.text();
        console.error("API Response Error:", res.status, errorText);
        throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
      }
      const result = await res.json();
      if (result.sessions && Array.isArray(result.sessions)) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setAllSessions(result.sessions);
        setSessions(result.sessions.filter((s: any) => new Date(s.date) >= now && !s.is_finalised && !s.is_archived));
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Escape listener to close admin modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editWarning) setEditWarning(null);
        else if (showEditModal) setShowEditModal(false);
        else if (showCreateModal) setShowCreateModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editWarning, showEditModal, showCreateModal]);

  const fetchCourses = async () => {
    try {
      // Assuming you have an API route to fetch courses, or fetch directly if safe
      const { data, error } = await supabase.from('courses').select('id, title');
      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0) {
        setNewSessionData(prev => ({ ...prev, course_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchCourses();
  }, []);

  useEffect(() => {
    const query = addressInput.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    if (isValidAddressSelected && query === newSessionData.venue_address) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=gb&addressdetails=1&limit=5`,
          {
            headers: {
              'User-Agent': 'uAchieve-Admin-Dashboard/1.0 (kibaaraeve@gmail.com)'
            }
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Nominatim fetch error:", err);
        setSearchError("Couldn't load suggestions. Please try again or verify connection.");
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [addressInput, isValidAddressSelected, newSessionData.venue_address]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-sky-500" size={40} /></div>;
  }

  const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateChange = (dateVal: string) => {
    if (!dateVal) {
      setNewSessionData(prev => ({ ...prev, date: '' }));
      return;
    }

    const [year, month, day] = dateVal.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek !== 6) {
      alert("Training sessions can only be scheduled on Saturdays. Please select a Saturday.");
      setNewSessionData(prev => ({ ...prev, date: '' }));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (localDate < today) {
      alert("You cannot schedule a session in the past.");
      setNewSessionData(prev => ({ ...prev, date: '' }));
      return;
    }

    setNewSessionData(prev => ({ ...prev, date: dateVal }));
  };

  const formatCleanAddress = (item: any) => {
    const addr = item.address;
    if (!addr) return item.display_name;

    const parts: string[] = [];
    
    const amenityOrBuilding = addr.amenity || addr.building || addr.office || addr.house_name;
    if (amenityOrBuilding) parts.push(amenityOrBuilding);
    
    const streetParts = [addr.house_number, addr.road].filter(Boolean);
    if (streetParts.length > 0) {
      parts.push(streetParts.join(" "));
    }
    
    const cityOrTown = addr.city || addr.town || addr.village || addr.suburb || addr.city_district;
    if (cityOrTown) parts.push(cityOrTown);
    
    if (addr.postcode) parts.push(addr.postcode);

    return parts.length > 0 ? parts.join(", ") : item.display_name;
  };

  const handleSelectAddress = (item: any) => {
    const formatted = formatCleanAddress(item);
    setAddressInput(formatted);
    setIsValidAddressSelected(true);
    setSuggestions([]);
    setSearchError(null);
    
    setNewSessionData(prev => {
      const updated = { ...prev, venue_address: formatted };
      
      const matchedSession = allSessions.find(
        s => s.venue_address && s.venue_address.trim().toLowerCase() === formatted.trim().toLowerCase()
      );
      
      if (matchedSession) {
        updated.venue_name = prev.venue_name || matchedSession.venue_name;
      }
      
      return updated;
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewSessionData({
      course_id: courses.length > 0 ? courses[0].id : '',
      date: '',
      max_capacity: 12,
      start_time: '09:00',
      end_time: '15:00',
      venue_name: '',
      venue_address: '',
    });
    setAddressInput('');
    setSuggestions([]);
    setSearchError(null);
    setIsValidAddressSelected(false);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAddressSelected) {
      alert("Please select a verified address from the dropdown suggestions.");
      return;
    }

    // Secondary validation check before submit
    const [year, month, day] = newSessionData.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (localDate.getDay() !== 6) {
      alert("Sessions must be scheduled on Saturdays.");
      return;
    }
    if (localDate < today) {
      alert("Cannot create a session in the past.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      // Refresh sessions list after successful creation
      fetchSessions();
      setShowCreateModal(false);
      setNewSessionData({ // Reset form
        course_id: courses.length > 0 ? courses[0].id : '',
        date: '',
        max_capacity: 12,
        start_time: '09:00',
        end_time: '15:00',
        venue_name: '',
        venue_address: '',
      });
      setAddressInput('');
      setSuggestions([]);
      setSearchError(null);
      setIsValidAddressSelected(false);
    } catch (error) {
      console.error("Error creating session:", error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditModal = (session: any) => {
    const dt = new Date(session.date);
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    setEditingSession(session);
    setEditSessionData({
      course_id: session.course_id,
      date: dateStr,
      max_capacity: session.max_capacity,
      start_time: session.start_time ? session.start_time.slice(0, 5) : '09:00',
      end_time: session.end_time ? session.end_time.slice(0, 5) : '15:00',
      venue_name: session.venue_name || '',
      venue_address: session.venue_address || '',
    });
    setEditAddressInput(session.venue_address || '');
    setEditIsValidAddress(true);
    setShowEditModal(true);
  };

  const handleSaveEditSession = async (overrideConfirm = false) => {
    if (!editingSession) return;

    if (!editIsValidAddress) {
      alert("Please enter/verify a valid venue address.");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        ...editSessionData,
        confirmManualNotification: overrideConfirm,
      };

      const res = await fetch(`/api/admin/sessions/${editingSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.requiresConfirmation) {
        setEditWarning({
          show: true,
          message: data.message,
          payload,
        });
        setIsUpdating(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update session');
      }

      // Success
      fetchSessions();
      setShowEditModal(false);
      setEditingSession(null);
      setEditWarning(null);
      alert('Session updated successfully!');
    } catch (err: any) {
      console.error('Save session edit error:', err);
      alert(`Error updating session: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm("Remove all sessions that are missing course data?")) return;
    setIsCleaning(true);
    try {
      const res = await fetch('/api/admin/sessions/cleanup', { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Cleanup complete");
      fetchSessions();
    } catch (err) {
      console.error("Cleanup failed:", err);
    } finally {
      setIsCleaning(false);
    }
  };

  // Stats mapping to your design requirements
  const now = new Date();
  const sessionsThisMonth = sessions.filter(s => new Date(s.date).getMonth() === now.getMonth()).length;

  return (
    <main className="w-full max-w-[768px] mx-auto pb-8 flex flex-col justify-start items-start">
      <div className="self-stretch px-4 py-6 flex flex-col gap-8">
        
        {/* Header & Stats */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-slate-800 text-3xl font-bold leading-10">Good morning, Ann 👋</h1>
            <p className="text-slate-600 text-base leading-6 mt-2">Here's what's coming up this week.</p>
            <p className="text-gray-400 text-xs mt-1 leading-5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCleanup} disabled={isCleaning} title="Clean broken sessions" className="size-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 hover:bg-red-100 transition-all">
              {isCleaning ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            </button>
            <button onClick={() => setShowCreateModal(true)} className="size-10 bg-[#29ABE2] text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-24 p-3 bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-[#E5E7EB] flex flex-col items-center justify-center">
            <span className="text-[#29ABE2] text-2xl font-bold leading-9">{sessionsThisMonth}</span>
            <span className="text-slate-600 text-xs text-center leading-3 whitespace-pre-line">Sessions<br/>This Month</span>
          </div>
          <div className="h-24 p-3 bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-[#E5E7EB] flex flex-col items-center justify-center">
            <span className="text-[#8DC63F] text-2xl font-bold leading-9">{stats.totalStudentsTrained}</span>
            <span className="text-slate-600 text-xs text-center leading-3 whitespace-pre-line">Students<br/>Trained</span>
          </div>
          <div className="h-24 p-3 bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-[#E5E7EB] flex flex-col items-center justify-center">
            <span className="text-slate-800 text-2xl font-bold leading-9">{stats.certificatesIssued}</span>
            <span className="text-slate-600 text-xs text-center leading-3 whitespace-pre-line">Certificates<br/>Issued</span>
          </div>
          <div className="h-24 p-3 bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-[#E5E7EB] flex flex-col items-center justify-center">
            <span className="text-slate-800 text-2xl font-bold leading-9">£{Number(stats.totalRevenue || 0).toFixed(2)}</span>
            <span className="text-slate-600 text-xs text-center leading-3 whitespace-pre-line">Total<br/>Revenue</span>
          </div>
        </div>


        {/* Upcoming Sessions List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-slate-800 text-xl font-bold">Upcoming Sessions</h2>
          
          {sessions.length === 0 && <p className="text-slate-500 italic">No upcoming sessions found.</p>}
          
          {sessions.map(session => {
            const bookedCount = session.bookings?.length || 0;
            const attendedCount = session.bookings?.filter((b: any) => b.attendance_status === 'attended').length || 0;
            const capacityFill = Math.min((bookedCount / session.max_capacity) * 100, 100);

            return (
              <div key={session.id} className="p-5 bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] border border-gray-200 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-slate-800 text-base font-bold pr-4">{session.course.title}</h3>
                  <div className="px-3 py-1 bg-[#29ABE2]/10 text-[#29ABE2] text-xs font-semibold rounded-full shrink-0">
                    {new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {new Date(session.date).getFullYear()}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Clock size={16} className="text-[#29ABE2]" />
                    {session.start_time.slice(0,5)} - {session.end_time.slice(0,5)}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={16} className="text-[#29ABE2]" />
                    {session.venue_name}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-lime-400 rounded-full transition-all" style={{ width: `${capacityFill}%` }} />
                  </div>
                  <span className="text-gray-400 text-xs">{bookedCount}/{session.max_capacity} students confirmed</span>
                </div>

                <div className="flex gap-2">
                  <div className="px-2 py-1 bg-gray-100 rounded text-green-700 text-xs font-bold">{bookedCount} Confirmed</div>
                  <div className="px-2 py-1 bg-sky-100 rounded text-blue-800 text-xs font-bold">{attendedCount} Attended</div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleOpenEditModal(session)}
                    className="flex-1 h-12 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Edit Session
                  </button>
                  <Link href={`/admin/bookings/${session.id}`} className="flex-1 h-12 rounded-full border border-sky-500 flex justify-center items-center gap-1 hover:bg-sky-50 transition-colors">
                    <span className="text-sky-500 text-sm font-semibold">View Roster →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Session Modal (UI Only for now) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} role="dialog" aria-modal="true" aria-labelledby="create-session-title" className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 id="create-session-title" className="text-xl font-bold text-slate-800 mb-4">Add New Session</h2>
            <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-800 text-sm font-semibold">Course</label>
                <select 
                  className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB] focus:ring-2 focus:ring-[#29ABE2]"
                  value={newSessionData.course_id}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, course_id: e.target.value }))}
                  required
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        type="button" 
                        className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB] text-left text-slate-700 flex items-center justify-between focus:ring-2 focus:ring-[#29ABE2]"
                      >
                        <span>
                          {newSessionData.date ? (() => {
                            const [y, m, d] = newSessionData.date.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                          })() : "Select Date"}
                        </span>
                        <Calendar className="size-4 text-slate-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newSessionData.date ? (() => {
                          const [y, m, d] = newSessionData.date.split('-').map(Number);
                          return new Date(y, m - 1, d);
                        })() : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            setNewSessionData(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
                          } else {
                            setNewSessionData(prev => ({ ...prev, date: '' }));
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isNotSaturday = date.getDay() !== 6;
                          return date < today || isNotSaturday;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">Max Capacity</label>
                  <input type="number" value={newSessionData.max_capacity} onChange={(e) => setNewSessionData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) || 0 }))} className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">Start Time</label>
                  <input type="time" value={newSessionData.start_time} onChange={(e) => setNewSessionData(prev => ({ ...prev, start_time: e.target.value }))} className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">End Time</label>
                  <input type="time" value={newSessionData.end_time} onChange={(e) => setNewSessionData(prev => ({ ...prev, end_time: e.target.value }))} className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-800 text-sm font-semibold">Venue Name</label>
                <input type="text" value={newSessionData.venue_name} onChange={(e) => setNewSessionData(prev => ({ ...prev, venue_name: e.target.value }))} placeholder="e.g., Sydney CBD Training Centre" className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" required />
              </div>
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-slate-800 text-sm font-semibold">Venue Address</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={addressInput} 
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setIsValidAddressSelected(false);
                      setNewSessionData(prev => ({ ...prev, venue_address: e.target.value }));
                    }} 
                    placeholder="Search UK address (e.g. 10 High St, Bradford)" 
                    className="w-full h-12 pl-4 pr-20 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB] focus:outline-[#29ABE2]" 
                    required 
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2 className="animate-spin text-slate-400 size-5" />
                    </div>
                  )}
                  {isValidAddressSelected && !isSearching && (
                    <div className="absolute right-3 top-3.5 text-[#8DC63F] text-xs font-bold">
                      ✓ Verified
                    </div>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {(suggestions.length > 0 || searchError) && (
                  <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-2 divide-y divide-gray-100">
                    {searchError ? (
                      <li className="px-4 py-2.5 text-xs text-red-500 font-medium">
                        {searchError}
                      </li>
                    ) : (
                      suggestions.map((item) => (
                        <li 
                          key={item.place_id} 
                          onClick={() => handleSelectAddress(item)}
                          className="px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-medium leading-relaxed"
                        >
                          {formatCleanAddress(item)}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 h-12 rounded-2xl border border-gray-200 text-slate-600 font-bold">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 h-12 bg-[#8DC63F] text-white rounded-2xl font-bold flex justify-center items-center gap-2">
                  {isCreating ? <Loader2 size={20} className="animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} role="dialog" aria-modal="true" aria-labelledby="edit-session-title" className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 id="edit-session-title" className="text-xl font-bold text-slate-800 mb-4">Edit Session Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEditSession(false); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-800 text-sm font-semibold">Course</label>
                <select 
                  className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB] focus:ring-2 focus:ring-[#29ABE2]"
                  value={editSessionData.course_id}
                  onChange={(e) => setEditSessionData(prev => ({ ...prev, course_id: e.target.value }))}
                  required
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        type="button" 
                        className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB] text-left text-slate-700 flex items-center justify-between focus:ring-2 focus:ring-[#29ABE2]"
                      >
                        <span>
                          {editSessionData.date ? (() => {
                            const [y, m, d] = editSessionData.date.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                          })() : "Select Date"}
                        </span>
                        <Calendar className="size-4 text-slate-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={editSessionData.date ? (() => {
                          const [y, m, d] = editSessionData.date.split('-').map(Number);
                          return new Date(y, m - 1, d);
                        })() : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            setEditSessionData(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const isNotSaturday = date.getDay() !== 6;
                          return date < today || isNotSaturday;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">Max Capacity</label>
                  <input 
                    type="number" 
                    value={editSessionData.max_capacity} 
                    onChange={(e) => setEditSessionData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) || 0 }))} 
                    className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">Start Time</label>
                  <input 
                    type="time" 
                    value={editSessionData.start_time} 
                    onChange={(e) => setEditSessionData(prev => ({ ...prev, start_time: e.target.value }))} 
                    className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-800 text-sm font-semibold">End Time</label>
                  <input 
                    type="time" 
                    value={editSessionData.end_time} 
                    onChange={(e) => setEditSessionData(prev => ({ ...prev, end_time: e.target.value }))} 
                    className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-800 text-sm font-semibold">Venue Name</label>
                <input 
                  type="text" 
                  value={editSessionData.venue_name} 
                  onChange={(e) => setEditSessionData(prev => ({ ...prev, venue_name: e.target.value }))} 
                  className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-800 text-sm font-semibold">Venue Address</label>
                <input 
                  type="text" 
                  value={editSessionData.venue_address} 
                  onChange={(e) => setEditSessionData(prev => ({ ...prev, venue_address: e.target.value }))} 
                  className="w-full h-12 px-4 bg-[#F9FAFB] rounded-2xl outline outline-1 outline-[#E5E7EB]" 
                  required 
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-12 rounded-2xl border border-gray-200 text-slate-600 font-bold">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 h-12 bg-[#29ABE2] text-white rounded-2xl font-bold flex justify-center items-center gap-2">
                  {isUpdating ? <Loader2 size={20} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirmation Warning Modal for Active Bookings & Date/Venue Changes */}
      {editWarning && editWarning.show && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} role="dialog" aria-modal="true" aria-labelledby="warning-modal-title" className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-center">
            <div className="size-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
              <span className="text-amber-600 text-2xl font-bold">⚠️</span>
            </div>
            <h2 id="warning-modal-title" className="text-xl font-bold text-slate-800">Active Bookings Notice</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {editWarning.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setEditWarning(null)} 
                className="flex-1 h-12 rounded-2xl border border-gray-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => handleSaveEditSession(true)} 
                className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold"
              >
                Yes, Confirm Edit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}