"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "Courses", href: "/courses" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQs", href: "/faqs" },
];

const informationalPaths = [
  "/faqs",
  "/privacy-policy",
  "/terms-and-conditions",
  "/policies/cancellation", // Corrected path for cancellation policy
  "/book/step1", // Update to the new booking step 1 path
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("U");
  const [userRole, setUserRole] = useState("student");
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isInformational = informationalPaths.includes(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Keyboard Escape listener for accessible modal/menu closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        // Fetch initials silently without throwing errors if RLS fails
        const { data } = await supabase.from('users').select('first_name, last_name, email, role').eq('id', session.user.id).maybeSingle();
        if (data) {
          setUserRole(data.role || 'student');
          if (data.first_name) {
            setUserInitials(`${data.first_name[0]}${data.last_name?.[0] || ''}`.toUpperCase());
          }
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[80px] transition-all duration-300 flex items-center ${
          scrolled || menuOpen
            ? "bg-[rgba(255,255,255,0.72)] backdrop-blur-[14px] border-b border-[rgba(41,171,226,0.15)] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="UAchieve First Aid"
              width={160}
              height={60}
              className="object-contain h-[60px] w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-[15px] font-medium transition-colors duration-200 font-['Plus Jakarta Sans'] ${ // Ensure font is Plus Jakarta Sans
                  pathname === item.href // Ensure font is Plus Jakarta Sans
                    ? "text-[#29ABE2]"
                    : "text-[#4A5568] hover:text-[#29ABE2]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn && userRole === 'admin' && (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)} 
                  className="size-10 bg-gradient-to-br from-sky-500 via-sky-400 via-[7%] to-[#8DC63F] rounded-full flex justify-center items-center text-white font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  {userInitials}
                </button>
                {showDropdown && (
                  <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 flex flex-col overflow-hidden">
                    <Link href="/admin" className="px-4 py-3 hover:bg-gray-50 text-sm font-medium text-slate-700 transition-colors font-bold">
                      Admin Dashboard
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-600 text-left transition-colors">
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {isInformational ? (
              <Link href="/contact">
                <button className="border-[1.5px] border-[#29ABE2] text-[#29ABE2] hover:bg-[rgba(41,171,226,0.05)] text-[15px] font-medium h-[40px] px-6 rounded-full transition-all duration-300 hover:scale-[1.02] font-['Plus Jakarta Sans']">
                  Contact Us
                </button>
              </Link>
            ) : (
              <Link href="/courses">
                <button className="bg-[#8DC63F] hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] text-white text-[15px] font-medium h-[40px] px-6 rounded-full transition-all duration-300 hover:scale-[1.02] font-['Plus Jakarta Sans']">
                  Book a Course
                </button>
              </Link>
            )}
          </div>

          {/* Mobile: Book button + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/courses">
              <button className="bg-[#8DC63F] text-white text-[13px] font-semibold h-[40px] px-3.5 rounded-full font-['Plus Jakarta Sans'] focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none">
                Book a Course
              </button>
            </Link>
            {menuOpen ? (
              <button
                onClick={() => setMenuOpen(false)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-[#1A2E3B] rounded-lg hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-colors"
                aria-label="Close menu"
                aria-expanded="true"
                aria-controls="mobile-navigation"
              >
                <X size={24} />
              </button>
            ) : (
              <button
                onClick={() => setMenuOpen(true)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-[#1A2E3B] rounded-lg hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-colors"
                aria-label="Open menu"
                aria-expanded="false"
                aria-controls="mobile-navigation"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[55] md:hidden transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-xs"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col z-[60] ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel header */}
          <div className="h-[80px] flex items-center justify-between px-6 border-b border-[#F0F4F8]">
            <span className="font-bold text-[#1A2E3B] text-lg font-['Plus Jakarta Sans']">Menu</span>
            {menuOpen && (
              <button
                onClick={() => setMenuOpen(false)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-[#9CA3AF] hover:text-[#1A2E3B] rounded-lg hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#29ABE2] focus-visible:outline-none transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Nav links */}
          <nav className="flex flex-col flex-1 px-6 py-2 overflow-y-auto">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href} 
                className={`self-stretch py-5 border-b border-[#F0F4F8] flex flex-col justify-start items-start text-lg font-bold leading-7 transition-colors duration-200 font-['Plus Jakarta Sans'] ${
                  pathname === item.href
                    ? "text-[#29ABE2]"
                    : "text-[#1A2E3B] hover:text-[#29ABE2]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-6 py-8 flex flex-col gap-3 border-t border-[#F0F4F8]">
            <Link href="/courses" className="w-full">
              <button className="w-full bg-[#8DC63F] text-white text-[16px] font-medium h-[52px] rounded-full hover:shadow-[0_0_28px_rgba(141,198,63,0.35)] transition-all duration-300 font-['Plus Jakarta Sans']">
                Book a Course
              </button>
            </Link>
            {isLoggedIn && userRole === 'admin' && (
              <>
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="w-full text-center text-[16px] font-bold text-[#1A2E3B] hover:text-[#29ABE2] transition-colors py-2">
                  Admin Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-center text-[16px] font-bold text-red-500 hover:text-red-600 transition-colors py-2">
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}