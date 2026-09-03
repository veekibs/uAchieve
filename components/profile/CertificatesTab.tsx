"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  AlertTriangle,
  FileText,
  CheckCircle,
  X,
  Mail,
  Link2,
  Check,
  Loader2
} from "lucide-react";

// Custom Social Icons (Lucide removed brand icons in recent versions)
const Facebook = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Twitter = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const Linkedin = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;

// Real data placeholders - Empty for now until admin issues certificates
const activeCertificates: any[] = [];

const expiredCertificates: any[] = [];

export default function CertificatesTab() {
  const [downloadState, setDownloadState] = useState<'idle' | 'preparing' | 'complete'>('idle');
  const [downloadedFileName, setDownloadedFileName] = useState("");
  const [downloadedCourse, setDownloadedCourse] = useState("");
  const [shareCert, setShareCert] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = (fileName: string, courseTitle: string) => {
    setDownloadedFileName(fileName);
    setDownloadedCourse(courseTitle);
    setDownloadState('preparing');
    setTimeout(() => {
      setDownloadState('complete');
    }, 2000);
  };

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`https://uachieve.co.uk/verify/${id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-12 font-['Plus_Jakarta_Sans']">
      {/* Active Certificates Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-2 sm:gap-0">
          <h2 className="text-slate-800 text-xl font-bold font-['Plus Jakarta Sans'] leading-8 text-center sm:text-left">
            Active Certificates
          </h2>
        {activeCertificates.length > 0 && (
          <button 
            onClick={() => handleDownload("UAchieve-Certificates.zip", "all your certificates")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:p-0 bg-sky-50 sm:bg-transparent text-sky-500 text-sm font-bold font-['Plus Jakarta Sans'] rounded-xl sm:rounded-none hover:bg-sky-100 sm:hover:bg-transparent sm:hover:underline transition-all"
          >
            <Download size={16} />
            Download All
          </button>
        )}
        </div>

      {activeCertificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
          <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="text-slate-800 text-lg font-bold mb-2">No certificates yet</h3>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            Once you complete a course, your accredited certificates will appear here for you to download and share.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeCertificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.06)] outline outline-1 outline-offset-[-1.11px] outline-gray-200 overflow-hidden"
            >
              {/* Certificate Preview */}
              <div className="relative h-44 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100">
                <div className="w-full max-w-[240px] aspect-[1.6/1] bg-white rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center p-4">
                  <div className="size-8 p-1 bg-gradient-to-br from-sky-500 via-sky-400 to-lime-400 rounded-full flex justify-center items-center mb-1 font-['Plus Jakarta Sans']">
                    <span className="text-white text-[10px] font-bold">
                      {cert.logoText}
                    </span>
                  </div>
                  <span className="text-slate-800 text-[11px] font-bold text-center line-clamp-1">
                    {cert.course}
                  </span>
                  <span className="text-gray-400 text-[8px] font-normal text-center">
                    Certificate of Completion
                  </span>
                  <span className="text-gray-300 text-[8px] font-normal text-center mt-1">
                    {cert.id}
                  </span>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-[#8DC63F] rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle size={12} className="text-white" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                    {cert.status}
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-slate-800 text-lg font-bold leading-7 line-clamp-1">
                    {cert.course}
                  </h3>
                  <span className="text-gray-400 text-sm font-normal">
                    Issued by {cert.issuedBy}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      Issued
                    </span>
                    <span className="text-slate-600 text-[13px] font-medium">
                      {cert.issuedDate}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      Expires
                    </span>
                    <span className={`text-[13px] font-bold ${cert.expiresInDays && cert.expiresInDays < 365 ? 'text-red-500' : 'text-[#8DC63F]'}`}>
                      {cert.expiryDate}
                    </span>
                  </div>
                </div>

                {cert.expiresInDays && cert.expiresInDays < 365 && (
                  <div className="px-4 py-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span className="text-amber-600 text-xs font-medium">
                      Expires in {cert.expiresInDays} days
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-1">
                  <button onClick={() => handleDownload(`${cert.id}.pdf`, cert.course)} className="flex-1 h-12 bg-sky-500 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-bold transition-all hover:bg-sky-600 active:scale-[0.98]">
                    <Download size={16} />
                    Download
                  </button>
                  <button onClick={() => setShareCert(cert)} className="flex-1 h-12 bg-white rounded-xl outline outline-1 outline-offset-[-1.11px] outline-gray-200 flex items-center justify-center gap-2 text-slate-600 text-sm font-bold transition-all hover:bg-gray-50 active:scale-[0.98]">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </motion.div>

      {/* Expired Certificates Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <h2 className="text-gray-400 text-base font-bold font-['Plus Jakarta Sans'] leading-6 text-center sm:text-left">
          Expired Certificates
        </h2>

        {expiredCertificates.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No expired certificates.</p>
        ) : (
          expiredCertificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-neutral-50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-gray-400 text-base font-medium font-['Plus Jakarta Sans'] leading-6">
                    {cert.course}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-xs font-normal font-['Plus Jakarta Sans'] leading-5">
                      Issued {cert.issuedDate}
                    </span>
                    <span className="text-red-500 text-xs font-normal font-['Plus Jakarta Sans'] leading-5">
                      Expired {cert.expiredDate}
                    </span>
                  </div>
                </div>
              </div>
              <Link href="/courses" className="shrink-0">
                <button className="px-4 py-2 bg-[#8DC63F] rounded-full text-white text-xs font-medium font-['Plus Jakarta Sans'] leading-5 transition-all hover:bg-[#7AB32E] active:scale-[0.98]">
                  Book Refresher
                </button>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Download Progress / Success Modals */}
      <AnimatePresence>
        {downloadState !== 'idle' && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full overflow-hidden text-center">
              {downloadState === 'preparing' ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Loader2 size={32} className="text-sky-500 animate-spin" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-slate-800 text-xl font-bold">Preparing Download...</h3>
                    <p className="text-slate-500 text-sm">Generating your certificate PDF</p>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-sky-500" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="size-16 bg-lime-50 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-[#8DC63F]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-slate-800 text-xl font-bold">Download Complete!</h3>
                    <div className="text-slate-600 text-sm px-4 leading-relaxed">
                      Your certificate for <span className="font-bold">{downloadedCourse}</span> has been downloaded successfully.
                    </div>
                  </div>

                  {/* File card simulation */}
                  <div className="w-full p-4 bg-gray-50 rounded-xl outline outline-1 outline-gray-200 flex items-center gap-3 text-left">
                    <div className="size-10 bg-white rounded-lg outline outline-1 outline-gray-200 flex justify-center items-center shrink-0">
                      <FileText size={20} className="text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-bold truncate">
                        {downloadedFileName}
                      </p>
                      <p className="text-gray-400 text-[10px]">Check your Downloads folder</p>
                    </div>
                  </div>

                  <button onClick={() => setDownloadState('idle')} className="w-full h-12 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all mt-2">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareCert && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="bg-sky-500 p-6 flex justify-between items-start relative">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Share2 size={24} className="text-white" />
                  </div>
                  <div className="flex flex-col text-white">
                    <span className="text-lg font-bold leading-tight">Share Certificate</span>
                    <span className="text-xs text-white/80 line-clamp-1">{shareCert.course}</span>
                  </div>
                </div>
                <button onClick={() => setShareCert(null)} className="size-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-8">
                <p className="text-slate-600 text-center text-sm leading-relaxed px-4">
                  Share your achievement with friends, family, and employers!
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Email", icon: Mail, color: "bg-red-500" },
                    { label: "LinkedIn", icon: Linkedin, color: "bg-[#0A66C2]" },
                    { label: "Twitter", icon: Twitter, color: "bg-[#1DA1F2]" },
                    { label: "Facebook", icon: Facebook, color: "bg-[#1877F2]" }
                  ].map((social) => (
                    <button key={social.label} className={`${social.color} h-12 rounded-xl flex items-center justify-center gap-2.5 text-white text-sm font-bold shadow-sm active:scale-95 transition-all`}>
                      <social.icon size={18} /> {social.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-1">
                    <Link2 size={14} className="text-slate-400" />
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Certificate Link</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center px-4 overflow-hidden">
                      <span className="text-slate-400 text-xs truncate">uachieve.co.uk/verify/{shareCert.id}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyLink(shareCert.id)} 
                      className={`h-11 px-6 rounded-xl text-white text-xs font-bold transition-all active:scale-95 ${isCopied ? 'bg-[#8DC63F]' : 'bg-sky-500'}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isCopied ? <Check size={14} /> : null}
                        {isCopied ? 'Copied' : 'Copy'}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100/50">
                  <p className="text-sky-900 text-xs leading-5 text-center">
                    Anyone with this link can verify your certificate is authentic and view your qualification details.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
