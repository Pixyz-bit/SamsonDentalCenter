import React from "react";
import { UserPlus, CalendarPlus, Printer } from "lucide-react";

const DashboardWelcomeBanner = ({ firstName = "Lisa" }) => {
  return (
    <div className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-br from-[#008f70] to-[#00a884] p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 text-white shadow-md border border-[#00a884]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-outfit leading-tight drop-shadow-sm">
          Good morning, {firstName}!
        </h2>
        <p className="text-white/90 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-xl">
          Here's what's happening today at DentaCare. Manage appointments, register patients, and oversee daily operations.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
        <button className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-[15px] font-semibold text-[#008f70] transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm hover:shadow">
          <UserPlus size={18} className="shrink-0 transition-transform group-hover:scale-110" />
          <span>Register Patient</span>
        </button>

        <button className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-white/10 backdrop-blur-md px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-[15px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98] border border-white/20 shadow-sm">
          <CalendarPlus size={18} className="shrink-0 transition-transform group-hover:scale-110" />
          <span>Book Appointment</span>
        </button>

        <button className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-white/10 backdrop-blur-md px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-[15px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98] border border-white/20 shadow-sm">
          <Printer size={18} className="shrink-0 transition-transform group-hover:scale-110" />
          <span>Print Schedule</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardWelcomeBanner;
