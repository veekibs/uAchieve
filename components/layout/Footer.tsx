import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1A2E3B] pt-[120px] pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="bg-white rounded w-8 h-8 flex items-center justify-center">
                <span className="font-bold text-[#1A2E3B] text-lg">U</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                UAchieve
              </span>
            </Link>
            <p className="text-[#9CA3AF] text-[14px] leading-relaxed pr-4">
              Professional first aid training with over 30 years of healthcare
              experience. Helping individuals and organizations build
              life-saving skills.
            </p>
          </div>

          {/* Courses Column */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-6">Courses</h4>
            <ul className="flex flex-col gap-4">
              {[
                "Basic Life Support",
                "Emergency First Aid",
                "Refresher Courses",
                "Group Bookings",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/courses"
                    className="text-[#9CA3AF] text-[14px] hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-6">Company</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: "About Us", path: "/about" },
                { name: "Our Trainers", path: "/about" },
                { name: "Accreditations", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-[#9CA3AF] text-[14px] hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-bold text-[15px] mb-6">Support</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: "FAQs", path: "/faqs" },
                { name: "Cancellation Policy", path: "/cancellation-policy" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Terms & Conditions", path: "/terms-and-conditions" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-[#9CA3AF] text-[14px] hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#9CA3AF]/60 text-[13px]">
            © 2026 UAchieve. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}