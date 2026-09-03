export function StatsBar() {
  const stats = [
    { value: "30+", label: "Years Experience" },
    { value: "100%", label: "Accredited Training" },
    { value: "12", label: "Max Class Size" },
    { value: "3 Years", label: "Certificate Validity" },
  ];

  return (
    <section className="bg-[#1A2E3B] py-[80px] relative z-20">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-x md:divide-x divide-white/10 text-center divide-y md:divide-y-0">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center py-8 md:py-0"
            >
              <span className="font-bold text-4xl text-white mb-2 font-['Plus Jakarta Sans']">
                {stat.value}
              </span>
              <span className="font-medium text-[15px] text-[#9CA3AF] font-['Plus Jakarta Sans']">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}