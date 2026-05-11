import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Clock, Hash, ShieldCheck, ArrowRight, Home as HomeIcon, CalendarPlus, Calendar, User, Check, Info } from 'lucide-react';

const GuestBookingSuccess = ({ result, onReset, booking }) => {
    const navigate = useNavigate();
    const formData = booking?.formData || {};
    const appointment = result?.appointment || {};

    // Auto-scroll to top when success screen mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatTimeRange = (startTime, durationMinutes) => {
        if (!startTime) return '---';
        try {
            const [h, m] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(h, m, 0, 0);
            const endDate = new Date(startDate.getTime() + (durationMinutes || 60) * 60000);
            
            const format = (date) => {
                const hour = date.getHours();
                const min = date.getMinutes().toString().padStart(2, '0');
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${h12}:${min} ${ampm}`;
            };
            return `${format(startDate)} – ${format(endDate)}`;
        } catch (e) {
            return startTime;
        }
    };

    return (
        <div className="w-full max-w-[600px] mx-auto animate-in fade-in zoom-in-95 duration-1000 pb-20 sm:pb-8">
            {/* 1. The Visual Confirmation */}
            <div className='mb-6 sm:mb-6 text-center px-4'>
                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-emerald-100 dark:border-emerald-500/20 shadow-theme-lg animate-in zoom-in-50 duration-700 delay-300'>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 animate-in fade-in zoom-in duration-500 delay-500">
                        <Check className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={4} />
                    </div>
                </div>
                <h2 className='text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2 sm:mb-3'>
                    Thank you for choosing Us!
                </h2>
                <p className='text-[12px] sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-sm mx-auto px-2'>
                    Your booking request has been received. We've sent the details to <span className="text-brand-500 dark:text-brand-400 font-bold break-all">{appointment.guest_email || formData.email}</span>.
                </p>
            </div>

            {/* 2. The "Quick Summary" (Request Summary) */}
            <div className='bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-[28px] sm:rounded-[32px] p-4 sm:p-8 shadow-theme-xl mb-4 sm:mb-6 overflow-hidden relative'>
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-500/10"></div>
                
                <div className="flex items-center justify-between mb-5 sm:mb-8 pb-4 border-b border-gray-50 dark:border-gray-800/50">
                    <h3 className="text-[10px] sm:text-sm font-black text-gray-400 tracking-[0.05em]">Request Summary</h3>
                    <div className="px-3 py-1 bg-brand-50/50 dark:bg-brand-500/10 rounded-full border border-brand-100/50 dark:border-brand-500/20 flex items-center">
                        <span className="text-[10px] sm:text-xs font-black font-mono tracking-tighter">
                            <span className="text-brand-400 dark:text-brand-500 mr-1.5">REF</span>
                            <span className="text-brand-600 dark:text-brand-400">
                                {appointment.reference_id || `#PRM-${Math.floor(1000 + Math.random() * 9000)}`}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                    {/* Service */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 border border-brand-100/50 dark:border-brand-800/50">
                            <ShieldCheck className="text-brand-500" size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Service</p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                {appointment.service_name || formData.service_name}
                            </p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                            <Calendar className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Date</p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                {formatDate(appointment.date || formData.date)}
                            </p>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                            <Clock className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Time Window</p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                {formatTimeRange(appointment.time || formData.time, appointment.service_duration || formData.service_duration)}
                            </p>
                        </div>
                    </div>

                    {/* Guest Patient */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                            <User className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Guest Patient</p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight capitalize">
                                {`${appointment.guest_first_name || formData.first_name || ''} ${appointment.guest_last_name || formData.last_name || ''}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. The "Next Steps" */}
            <div className='bg-brand-50/30 dark:bg-brand-500/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 border border-brand-100/50 dark:border-brand-500/10'>
                <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0 shadow-theme-xs">
                        <Info size={18} sm:size={20} />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-[12px] sm:text-sm font-black text-gray-900 dark:text-white tracking-wide">What happens now?</h4>
                        <div className="space-y-1.5 sm:space-y-2">
                            <p className='text-[11px] sm:text-[13px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed flex items-start gap-2'>
                                <span className="w-1 h-1 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                                Our team will review your request and send a final confirmation within 24 hours.
                            </p>
                            <p className='text-[11px] sm:text-[13px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed flex items-start gap-2'>
                                <span className="w-1 h-1 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                                Please wait for the final confirmation before heading to the clinic.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Action Buttons (Sticky Footer on Mobile) */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 sm:flex sm:flex-row gap-4 sm:mt-8 z-50">
                <div className="max-w-[600px] mx-auto flex flex-row gap-3 sm:w-full">
                    <button
                        onClick={() => navigate('/')}
                        className='flex-1 group flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all shadow-theme-xs'
                    >
                        <HomeIcon size={18} className="sm:size-[22px]" />
                        <span className="text-[11px] sm:text-base font-black">Home</span>
                    </button>
                    <button
                        onClick={onReset}
                        className='flex-[2] flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black transition-all shadow-lg shadow-brand-500/20'
                    >
                        <CalendarPlus size={20} className="sm:size-6" />
                        <span className="text-[11px] sm:text-lg font-black">Book Another</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestBookingSuccess;
