import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, Calendar, Clock, Edit2, CheckCircle2, ShieldCheck, Mail, Loader2, Info, AlertCircle, ClipboardList, CalendarDays, UserRound, StickyNote, UserCircle, Contact } from 'lucide-react';

const ConfirmStep = ({ formData, onSubmit, onBack, onEdit, onReset, submitting, error, clinicPhone }) => {
    // ✅ Phase 1: Robust Auto-scroll to top on error
    useEffect(() => {
        if (error) {
            window.scrollTo({ top: 0, behavior: 'auto' });
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    }, [error]);

    // Formatting for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not selected';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not selected';
        try {
            const [hours, minutes] = timeString.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const formattedHour = h % 12 || 12;
            const formattedMinute = m < 10 ? `0${m}` : m;
            return `${formattedHour}:${formattedMinute} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    const formatTimeRange = (startTime, durationMinutes) => {
        if (!startTime) return 'Not selected';
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
            return formatTime(startTime);
        }
    };

    const ReviewSection = ({ title, children, onEditClick, icon: Icon }) => (
        <div className="mb-6 sm:mb-8">
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden">
                <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-3">
                        {Icon && <Icon size={18} className="text-brand-500" />}
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    {onEditClick && (
                        <button
                            onClick={onEditClick}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 bg-white dark:bg-gray-800 px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.03] transition-all shadow-theme-xs active:scale-95 shrink-0"
                        >
                            <Edit2 size={11} className="text-gray-400 sm:w-3.5 sm:h-3.5" />
                            Edit
                        </button>
                    )}
                </div>
                <div className="px-5 py-6 sm:px-10 sm:py-8">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10 sm:pb-6">
            {/* Header Section */}
            <div className='mb-6 sm:mb-8'>
                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Review Your Appointment Details
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Please double-check your appointment schedule and information before submitting your request for approval.
                </p>
            </div>

            {error && (
                <div className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-4 sm:p-5 mb-8 animate-in shake duration-500 shadow-sm'>
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                            <AlertCircle size={18} className="sm:hidden" />
                            <AlertCircle size={20} className="hidden sm:block" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-[13px] sm:text-base font-black text-red-600 dark:text-red-400 truncate">
                                    {error.includes('limited to 3 active bookings') ? 'Booking Limit Reached' : 
                                     error.includes('already scheduled for this email on the selected date') ? 'Duplicate Appointment' :
                                     error.includes('This time overlaps with another booking') ? 'Time Conflict' :
                                     'Booking Restricted'}
                                </h3>
                                <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 uppercase tracking-tighter shrink-0">
                                    Notice
                                </span>
                            </div>
                            
                            {error.includes('limited to 3 active bookings') ? (
                                <div className="space-y-1">
                                    <p className="text-[12px] sm:text-[14px] text-gray-900 dark:text-white font-bold leading-snug">
                                        Each email is limited to 3 active appointments to ensure fair scheduling.
                                    </p>
                                    <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        Please use a different email to book for others, or contact us at <span className="font-bold text-gray-700 dark:text-gray-300">{clinicPhone}</span> if you believe this is an error.
                                    </p>
                                </div>
                            ) : error.includes('already scheduled for this email on the selected date') ? (
                                <div className="space-y-1">
                                    <p className="text-[12px] sm:text-[14px] text-gray-900 dark:text-white font-bold leading-snug">
                                        You already have this treatment scheduled for this day under <span className="text-brand-600 dark:text-brand-400 underline decoration-brand-500/30">{formData.email}</span>.
                                    </p>
                                    <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        Please use a different email to book for others, or contact us at <span className="font-bold text-gray-700 dark:text-gray-300">{clinicPhone}</span> if you believe this is an error.
                                    </p>
                                </div>
                            ) : error.includes('This time overlaps with another booking') ? (
                                <div className="space-y-1">
                                    <p className="text-[12px] sm:text-[14px] text-gray-900 dark:text-white font-bold leading-snug">
                                        This slot overlaps with an existing appointment for <span className="text-brand-600 dark:text-brand-400 underline decoration-brand-500/30">{formData.email}</span>.
                                    </p>
                                    <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        Please use a different email to book for others, or contact us at <span className="font-bold text-gray-700 dark:text-gray-300">{clinicPhone}</span> if you believe this is an error.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-[12px] sm:text-[14px] text-gray-900 dark:text-white font-bold leading-snug">
                                        For security, we limit the number of active bookings per guest account.
                                    </p>
                                    <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                        Please use a different email to book for others, or contact us at <span className="font-bold text-gray-700 dark:text-gray-300">{clinicPhone}</span> if you believe this is an error.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className='w-full space-y-6'>
                {/* 1. Service Selection */}
                <ReviewSection title="Service Selection" icon={ClipboardList} onEditClick={() => onEdit(0)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Selected Treatment
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                {formData.service_name || 'No service selected'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Duration
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.service_duration ? `${formData.service_duration} mins` : '-'}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 2. Date & Time */}
                <ReviewSection title="Schedule Details" icon={CalendarDays} onEditClick={() => onEdit(1)}>
                    <div className="grid grid-cols-1 gap-6 sm:gap-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-7">
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                    Appointment Date
                                </p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                    {formatDate(formData.date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                    Timeslot
                                </p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                    {formatTimeRange(formData.time, formData.service_duration)}
                                </p>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-50 dark:border-gray-800/50">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1.5 leading-none">
                                Selected Dentist
                            </p>
                            <div className="text-[14px] sm:text-base font-bold">
                                {!formData.dentist_id ? (
                                    <span className="text-gray-400 dark:text-gray-500 italic font-medium">
                                        Any Available Dentist
                                    </span>
                                ) : (
                                    <span className="text-brand-600 dark:text-brand-400">
                                        {formData.dentist_name || 'Selected Specialist'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </ReviewSection>

                {/* 3. Personal Details */}
                <ReviewSection title="Personal Details" icon={UserCircle} onEditClick={() => onEdit(2)}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-7 2xl:gap-x-12">
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Full Name
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white break-words leading-tight">
                                {formData.first_name ? `${formData.last_name}, ${formData.first_name} ${formData.middle_name || ''} ${formData.suffix_name || ''}`.replace(/\s+/g, ' ').trim() : (formData.full_name || '—')}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Birthday
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.birthday ? formatDate(formData.birthday) : '—'}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Sex
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.sex || '—'}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 4. Contact Details */}
                <ReviewSection title="Contact Details" icon={Contact} onEditClick={() => onEdit(2)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Email Address
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white break-all leading-tight">
                                {formData.email}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Phone Number
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.phone}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 4. Additional Notes */}
                <ReviewSection title="Additional Notes" icon={StickyNote} onEditClick={() => onEdit(2)}>
                    <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                            Note for the Clinic
                        </p>
                        <p className={`text-[14px] sm:text-base font-bold leading-relaxed break-words whitespace-pre-wrap ${formData.patient_note ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
                            {formData.patient_note || 'No additional notes provided'}
                        </p>
                    </div>
                </ReviewSection>

                {/* Verification Email Highlight Banner */}
                <div className='bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 rounded-2xl p-5 sm:p-7 animate-in zoom-in-95 duration-500 overflow-hidden'>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                                <Mail size={20} />
                            </div>
                            <h4 className="text-[14px] sm:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                Verify Your Email
                            </h4>
                        </div>
                        
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                <p className="text-[12px] sm:text-[14px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                    This email is our <strong className="text-brand-600 dark:text-brand-400">only way</strong> to send your confirmation and status updates.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                <p className="text-[12px] sm:text-[14px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Please double-check <strong className="text-brand-600 dark:text-brand-400 break-all">{formData.email}</strong> before proceeding.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                <p className="text-[12px] sm:text-[14px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Click <strong className="text-gray-900 dark:text-white">"Confirm & Send Code"</strong> below to receive your 6-digit code.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Final Navigation Controls */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-10 sm:pt-6 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center gap-3 w-full sm:justify-between'>
                    <button 
                        onClick={onBack} 
                        disabled={submitting} 
                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[11px] sm:text-sm px-4 py-3.5 sm:px-8 transition-colors disabled:opacity-30 bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs'
                    >
                        Back to Info
                    </button>
                    
                    <button 
                        onClick={onSubmit} 
                        disabled={submitting} 
                        className='flex-1 sm:flex-none sm:min-w-[200px] group bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black px-4 py-3.5 sm:px-10 sm:py-4.5 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-base'
                    >
                        {submitting ? (
                            <div className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        ) : (
                            <>
                                Confirm & Send Code
                                <ShieldCheck size={14} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform hidden sm:block" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmStep;
