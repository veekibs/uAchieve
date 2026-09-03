"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export default function AccountSettingsTab() {
  const supabase = createClient();

  // State for Personal Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // State for Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // State for Email Notifications
  const [expiryReminders, setExpiryReminders] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [bookingConfirmations, setBookingConfirmations] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // State for Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Fetch the user's actual data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setEmail(session.user.email || ""); // Email comes from Auth
        
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, last_name, phone')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setPhone(profile.phone || "");
        }
      }
    };
    fetchUserData();
  }, [supabase]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('users')
      .update({ first_name: firstName, last_name: lastName, phone: phone })
      .eq('id', session.user.id);

    setIsSaving(false);
    if (error) {
      setSaveMessage({ type: 'error', text: "Failed to update profile." });
    } else {
      setSaveMessage({ type: 'success', text: "Profile updated successfully!" });
    }
  };

  const handleUpdatePassword = () => {
    console.log("Updating password:", {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    // Add API call to update password
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText === "DELETE") {
      console.log("Deleting account...");
      // Add API call to delete account
      setShowDeleteModal(false);
      setDeleteConfirmationText("");
    } else {
      alert("Please type 'DELETE' to confirm.");
    }
  };

  const toggleSwitchClass = (isOn: boolean) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
      isOn ? "bg-sky-500" : "bg-gray-300"
    }`;

  const toggleThumbClass = (isOn: boolean) =>
    `inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
      isOn ? "translate-x-6" : "translate-x-1"
    }`;

  return (
    <div className="flex flex-col gap-12">
      {/* Personal Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6"
      >
        <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
          >
            Email Address <span className="text-gray-400 text-xs font-normal">(Contact support to change)</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            readOnly
            className="w-full px-4 py-3 bg-gray-50 rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-200 text-gray-500 text-base font-normal font-['Plus Jakarta Sans'] leading-6 cursor-not-allowed"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
          {saveMessage && (
            <p className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-[#8DC63F]' : 'text-red-500'}`}>
              {saveMessage.text}
            </p>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full sm:w-36 h-10 bg-sky-500 rounded-lg text-white text-sm font-bold font-['Plus Jakarta Sans'] leading-5 transition-all hover:bg-sky-600 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col gap-6"
      >
        <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
          Password
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-[#29ABE2] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleUpdatePassword}
            className="w-40 h-10 bg-sky-500 rounded-lg text-white text-sm font-medium font-['Plus Jakarta Sans'] leading-5 transition-all hover:bg-sky-600 active:scale-[0.98]"
          >
            Update Password
          </button>
        </div>
      </motion.div>

      {/* Email Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-6"
      >
        <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
          Email Notifications
        </h2>
        <div className="bg-white rounded-xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 divide-y divide-gray-200">
          <div className="flex items-start justify-between p-4 sm:p-5 gap-4">
            <span className="text-slate-800 text-sm sm:text-base font-medium font-['Plus Jakarta Sans'] leading-6">
              Certificate expiry reminders (60 days before)
            </span>
            <button
              type="button"
              onClick={() => setExpiryReminders(!expiryReminders)}
              className={`${toggleSwitchClass(expiryReminders)} shrink-0 mt-0.5`}
            >
              <span className="sr-only">Toggle certificate expiry reminders</span>
              <span className={toggleThumbClass(expiryReminders)} />
            </button>
          </div>
          <div className="flex items-start justify-between p-4 sm:p-5 gap-4">
            <span className="text-slate-800 text-sm sm:text-base font-medium font-['Plus Jakarta Sans'] leading-6">
              New course announcements and updates
            </span>
            <button
              type="button"
              onClick={() => setCourseUpdates(!courseUpdates)}
              className={`${toggleSwitchClass(courseUpdates)} shrink-0 mt-0.5`}
            >
              <span className="sr-only">Toggle new course announcements</span>
              <span className={toggleThumbClass(courseUpdates)} />
            </button>
          </div>
          <div className="flex items-start justify-between p-4 sm:p-5 gap-4">
            <span className="text-slate-800 text-sm sm:text-base font-medium font-['Plus Jakarta Sans'] leading-6">
              Booking confirmations and venue details
            </span>
            <button
              type="button"
              onClick={() => setBookingConfirmations(!bookingConfirmations)}
              className={`${toggleSwitchClass(bookingConfirmations)} shrink-0 mt-0.5`}
            >
              <span className="sr-only">Toggle booking confirmations</span>
              <span className={toggleThumbClass(bookingConfirmations)} />
            </button>
          </div>
          <div className="flex items-start justify-between p-4 sm:p-5 gap-4">
            <span className="text-slate-800 text-sm sm:text-base font-medium font-['Plus Jakarta Sans'] leading-6">
              Marketing emails and special offers
            </span>
            <button
              type="button"
              onClick={() => setMarketingEmails(!marketingEmails)}
              className={`${toggleSwitchClass(marketingEmails)} shrink-0 mt-0.5`}
            >
              <span className="sr-only">Toggle marketing emails</span>
              <span className={toggleThumbClass(marketingEmails)} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-red-500 text-xl font-bold font-['Plus Jakarta Sans'] leading-8">
          Danger Zone
        </h2>
        <div className="px-6 py-6 bg-red-50 rounded-xl outline outline-1 outline-offset-[-1.11px] outline-red-200 flex flex-col gap-4">
          <p className="text-slate-600 text-sm font-normal font-['Plus Jakarta Sans'] leading-5">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-44 h-10 bg-red-500 rounded-lg text-white text-sm font-medium font-['Plus Jakarta Sans'] leading-5 transition-all hover:bg-red-600 active:scale-[0.98]"
          >
            Delete My Account
          </button>
        </div>
      </motion.div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6"
          >
            <div className="size-12 p-3 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h2 className="text-slate-800 text-2xl font-bold font-['Plus Jakarta Sans'] leading-9">
              Are you absolutely sure?
            </h2>
            <p className="text-slate-600 text-base font-normal font-['Plus Jakarta Sans'] leading-6">
              This will permanently delete all your bookings, certificates, and
              personal data. This cannot be undone.
            </p>
            <div>
              <label
                htmlFor="deleteConfirm"
                className="block text-gray-700 text-sm font-medium font-['Plus Jakarta Sans'] leading-5 mb-1.5"
              >
                Type{" "}
                <span className="font-bold text-gray-700">DELETE</span> to
                confirm
              </label>
              <input
                type="text"
                id="deleteConfirm"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 text-slate-800 text-base font-normal font-['Plus Jakarta Sans'] leading-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1.11px] outline-gray-200 text-slate-600 text-base font-medium font-['Plus Jakarta Sans'] leading-6 transition-all hover:bg-gray-50 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== "DELETE"}
                className={`px-4 py-2 rounded-lg text-white text-base font-medium font-['Plus Jakarta Sans'] leading-6 transition-all ${
                  deleteConfirmationText === "DELETE"
                    ? "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}