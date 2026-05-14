import React from 'react';
import { CalendarPlus, Phone } from 'lucide-react';

const DashboardWelcomeBanner = ({ firstName, onBookAppointment, onContactClinic }) => {
    return (
        <div className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-br from-[#c02424] to-[#f44336] p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 text-white shadow-md border border-[#f44336]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 transition-all duration-300">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight font-outfit leading-tight">
                    Good morning, {firstName}!
                </h2>
                <p className="text-white/90 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-xl">
                    Ready to perfect your smile? Track your journey, manage sessions, and stay connected with our clinical team.
                </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <button 
                    onClick={onBookAppointment}
                    className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-[15px] font-semibold text-[#c02424] transition-all hover:bg-gray-50 active:scale-[0.98] shadow-sm hover:shadow"
                >
                    <CalendarPlus size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                    <span>New Appointment</span>
                </button>

                <button 
                    onClick={onContactClinic}
                    className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-white/10 backdrop-blur-md px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-[15px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98] border border-white/20 shadow-sm"
                >
                    <Phone size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                    <span>Contact Clinic</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardWelcomeBanner;
