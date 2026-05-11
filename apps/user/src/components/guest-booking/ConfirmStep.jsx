import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Stethoscope, ShieldCheck, MailWarning, Edit2, ArrowRight, Info } from 'lucide-react';

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

    const ReviewSection = ({ title, children, onEditClick }) => (
        <div className="p-4 border border-gray-200 rounded-2xl dark:border-gray-800 sm:p-6 mb-5 overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800/80 lg:mb-6 lg:pb-6">
                <h4 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white/90 truncate min-w-0 tracking-tight">
                    {title}
                </h4>
                <button
                    onClick={onEditClick}
                    className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-[12px] sm:text-sm font-bold text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-all shrink-0 active:scale-95"
                >
                    <Edit2 size={12} className="text-gray-500" />
                    Edit
                </button>
            </div>
            <div className="w-full min-w-0">
                {children}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10 sm:pb-6">
            {/* Header Section */}
            <div className='mb-6 sm:mb-8'>
                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Review Your Appointment Details
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Please double-check your appointment schedule and information before submitting your request for approval.
                </p>
            </div>

            {error && (
                <div className='group relative overflow-hidden bg-white dark:bg-red-950/20 border-2 border-red-500/30 dark:border-red-500/20 rounded-3xl p-6 mb-8 animate-in shake duration-500 shadow-2xl shadow-red-500/10'>
                    {/* Decorative Background Pattern */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
                    
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
                            <ShieldCheck size={28} strokeWidth={2.5} />
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-lg font-black text-red-600 dark:text-red-400 tracking-tight">
                                    {error.includes('limited to 3 active bookings') ? 'Booking Limit Reached' : 
                                     error.includes('already scheduled for this email on the selected date') ? 'Duplicate Booking Detected' :
                                     error.includes('This time overlaps with another booking') ? 'Scheduling Conflict' :
                                     'Booking Blocked'}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 w-fit mx-auto sm:mx-0">
                                    Security Notice
                                </span>
                            </div>
                            
                            {error.includes('limited to 3 active bookings') ? (
                                <>
                                    <p className="text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                                        To maintain a fair scheduling system, each email is limited to 3 active bookings (Pending or Confirmed).
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            Our records show that <span className="text-brand-600 dark:text-brand-400 font-bold underline">{formData.email}</span> already has 3 upcoming appointments.
                                        </p>
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            If you need to schedule additional family members, or if you believe this is an error, please contact the clinic directly at <span className="text-gray-900 dark:text-white font-black">{clinicPhone}</span> so our staff can assist you manually.
                                        </p>
                                    </div>
                                </>
                            ) : error.includes('already scheduled for this email on the selected date') ? (
                                <>
                                    <p className="text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                                        An appointment for this treatment is already scheduled for this date.
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            Our system prevents multiple bookings for the same treatment on the same day under <span className="text-brand-600 dark:text-brand-400 font-bold underline">{formData.email}</span>.
                                        </p>
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            If you need to change your time or book for a second person using this email, please contact the clinic directly at <span className="text-gray-900 dark:text-white font-black">{clinicPhone}</span> so our staff can assist you manually.
                                        </p>
                                    </div>
                                </>
                            ) : error.includes('This time overlaps with another booking') ? (
                                <>
                                    <p className="text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                                        This time slot overlaps with another appointment.
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            Our records show that <span className="text-brand-600 dark:text-brand-400 font-bold underline">{formData.email}</span> already has an appointment scheduled during or near this time.
                                        </p>
                                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                            To avoid double-booking, please select a different time or contact us at <span className="text-gray-900 dark:text-white font-black">{clinicPhone}</span> for assistance.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                                        {error}
                                    </p>
                                    <p className="mt-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                                        To protect our scheduling system, we enforce strict limits on guest accounts. If you believe this is an error, please reach out to us directly.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className='w-full space-y-6'>
                {/* 1. Service Selection */}
                <ReviewSection title="Service Selection" onEditClick={() => onEdit(0)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="mb-1 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                                Selected Treatment
                            </p>
                            <p className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.service_name || 'No service selected'}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                                Duration
                            </p>
                            <p className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.service_duration ? `${formData.service_duration} mins` : '-'}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 2. Date & Time */}
                <ReviewSection title="Date & Time" onEditClick={() => onEdit(1)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="mb-1 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                                Appointment Date
                            </p>
                            <p className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formatDate(formData.date)}
                            </p>
                        </div>
                        <div>
                            <p className="mb-1 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                                Selected Timeslot
                            </p>
                            <p className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formatTimeRange(formData.time, formData.service_duration)}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 3. Your Information */}
                <ReviewSection title="Your Information" onEditClick={() => onEdit(2)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div className="min-w-0">
                            <p className="mb-1 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 font-bold">
                                Full Name
                            </p>
                            <p className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white truncate">
                                {formData.first_name ? `${formData.last_name}, ${formData.first_name} ${formData.middle_name || ''} ${formData.suffix_name || ''}`.replace(/\s+/g, ' ').trim() : (formData.full_name || '—')}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="mb-1 text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 font-bold">
                                Email Address
                            </p>
                            <p className="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white break-all leading-tight">
                                {formData.email}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="mb-0.5 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                                Phone Number
                            </p>
                            <p className="text-[13px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.phone}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="mb-0.5 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                                Birthday
                            </p>
                            <p className="text-[13px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.birthday ? formatDate(formData.birthday) : '—'}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 4. Additional Notes */}
                <ReviewSection title="Additional Notes" onEditClick={() => onEdit(2)}>
                    <div className="min-w-0">
                        <p className="mb-0.5 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                            Note for the Clinic
                        </p>
                        <p className={`text-[13px] sm:text-base font-bold leading-relaxed ${formData.patient_note ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
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
                <div className='flex items-center gap-1.5 w-full sm:justify-between'>
                    <button 
                        onClick={onBack} 
                        disabled={submitting} 
                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[9px] sm:text-sm px-4 py-3.5 sm:px-8 transition-colors disabled:opacity-30 bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs'
                    >
                        Back to Info
                    </button>
                    
                    <button 
                        onClick={onSubmit} 
                        disabled={submitting} 
                        className='flex-1 sm:flex-none sm:min-w-[200px] group bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black px-4 py-3.5 sm:px-10 sm:py-4.5 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-3 text-[9px] sm:text-base'
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
