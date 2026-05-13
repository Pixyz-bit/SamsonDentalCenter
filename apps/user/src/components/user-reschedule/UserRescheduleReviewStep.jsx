import React, { useEffect, useState } from 'react';
import { 
    ArrowLeft, 
    ArrowRight, 
    Calendar, 
    Clock, 
    AlertCircle, 
    Loader2,
    RefreshCw,
    Edit2,
    CalendarDays,
    ShieldCheck,
    User
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../hooks/useAppointments';

// Helper to calculate end time based on start time (HH:mm) and duration (minutes)
const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return null;
    try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
        
        return `${endHours}:${endMinutes}`;
    } catch (e) {
        return null;
    }
};

const ReviewSection = ({ title, children, onEditClick, icon: Icon }) => (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden mb-6">
        <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/30 dark:bg-transparent">
            <div className="flex items-center gap-3">
                {Icon && <Icon size={18} className="text-brand-500" />}
                <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                </h3>
            </div>
            <button
                onClick={onEditClick}
                className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 bg-white dark:bg-gray-800 px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.03] transition-all shadow-theme-xs active:scale-95 shrink-0"
            >
                <Edit2 size={11} className="text-gray-400 sm:w-3.5 sm:h-3.5" />
                Change
            </button>
        </div>
        <div className="px-5 py-6 sm:px-10 sm:py-8">
            {children}
        </div>
    </div>
);

const UserRescheduleReviewStep = ({ formData, appointment, onSubmit, onBack, submitting, error }) => {
    const toast = useToast();
    const [isEntryLocked, setIsEntryLocked] = useState(true);

    // ✅ Phase 1: Robust Auto-scroll to top on error
    useEffect(() => {
        if (error) {
            window.scrollTo({ top: 0, behavior: 'auto' });
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    }, [error]);

    // Click Protection
    useEffect(() => {
        const timer = setTimeout(() => setIsEntryLocked(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleFinalSubmit = async () => {
        if (submitting || isEntryLocked) return;

        toast.info('Processing your reschedule request...');
        await onSubmit();
    };

    const service = appointment?.service;
    const serviceName = service?.name || appointment?.service || '—';
    const duration = service?.duration_minutes || 30;
    
    const newDateStr = formatDate(formData.date);
    const newStartTime = formatTime(formData.time);
    const newEndTimeRaw = calculateEndTime(formData.time, duration);
    const newEndTime = newEndTimeRaw ? formatTime(newEndTimeRaw) : null;
    
    const oldDateStr = formatDate(appointment?.appointment_date);
    const oldStartTime = formatTime(appointment?.start_time);
    const oldEndTimeRaw = calculateEndTime(appointment?.start_time, duration);
    const oldEndTime = oldEndTimeRaw ? formatTime(oldEndTimeRaw) : null;

    // Dentist labels
    const newDentistName = formData.dentist_name || 'Any Available Dentist';
    const oldDentistName = appointment?.dentist?.profile 
        ? `Dr. ${appointment.dentist.profile.first_name} ${appointment.dentist.profile.last_name}`
        : appointment?.dentist?.full_name || 'Any Available Dentist';

    // ✅ Error Detail Parsing (Parity with UserBookingWizard)
    const getErrorDetails = () => {
        if (!error) return null;

        if (error.includes('already been rescheduled once')) {
            return {
                headline: 'Reschedule Limit Reached',
                message: "This appointment has already been rescheduled once and cannot be changed again through the portal.",
                solution: "Please contact our clinic directly if you need further adjustments to this schedule.",
                action: null
            };
        }

        if (error.includes('Conflict:')) {
            return {
                headline: 'Time Slot Conflict',
                message: error,
                solution: "You already have another appointment during this time range. Please select a different slot.",
                action: { label: 'Change Time', onClick: onBack }
            };
        }

        if (error.includes('already booked for this service')) {
            return {
                headline: 'Duplicate Booking',
                message: "You already have this service scheduled for the selected date.",
                solution: "Patients are limited to one instance of this treatment per day. Please choose a different date.",
                action: { label: 'Change Date', onClick: onBack }
            };
        }

        return {
            headline: 'Scheduling Alert',
            message: error,
            solution: "We encountered an issue while updating your appointment. Please review the message above.",
            action: null
        };
    };

    const errorDetails = getErrorDetails();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-[60px] sm:pb-6">
            <div className="mb-8 sm:mb-10">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
                    Review Your Changes
                </h2>
                <p className="text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    You are updating your <strong>{serviceName}</strong> appointment. Please review the schedule change below.
                </p>
            </div>

            {errorDetails && (
                <div className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-3xl mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden'>
                    <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-[14px] sm:text-lg font-bold text-red-600 dark:text-red-400">
                                {errorDetails.headline}
                            </h3>
                        </div>
                    </div>
                    
                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className="space-y-6">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0 shadow-sm" />
                                    <p className="text-[13px] sm:text-[15px] text-gray-900 dark:text-white font-bold leading-snug">
                                        {errorDetails.message}
                                    </p>
                                </li>
                                {errorDetails.solution && (
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 opacity-40" />
                                        <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                            {errorDetails.solution}
                                        </p>
                                    </li>
                                )}
                            </ul>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleFinalSubmit}
                                    disabled={submitting || isEntryLocked}
                                    className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white dark:bg-red-900/10 px-4 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 shrink-0 disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={submitting ? 'animate-spin' : ''} />
                                    Retry
                                </button>
                                
                                {errorDetails.action && (
                                    <button
                                        type="button"
                                        onClick={errorDetails.action.onClick}
                                        className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-sm font-bold transition-all shadow-theme-md active:scale-95 shrink-0"
                                    >
                                        {errorDetails.action.label}
                                        <ArrowRight size={14} className="opacity-80" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full space-y-4 sm:space-y-6">
                <ReviewSection title="Schedule Comparison" icon={CalendarDays} onEditClick={onBack}>
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
                        {/* Centered Arrow (Desktop only) */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex">
                            <div className="w-12 h-12 bg-white dark:bg-gray-900 border-2 border-brand-100 dark:border-brand-800 rounded-full flex items-center justify-center shadow-theme-md">
                                <ArrowRight size={20} className="text-brand-500" />
                            </div>
                        </div>

                        {/* Current Schedule */}
                        <div className="p-8 sm:p-10 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-gray-800 opacity-70 flex flex-col h-full">
                            <div className="mb-8 flex flex-col gap-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current</span>
                                <h4 className="text-base sm:text-lg font-black text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    Original Appointment
                                </h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                    <div className="flex items-center gap-3 w-32 shrink-0 text-gray-400">
                                        <Calendar size={18} />
                                        <span className="text-sm font-medium">Date</span>
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400">{oldDateStr}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                    <div className="flex items-center gap-3 w-32 shrink-0 text-gray-400">
                                        <Clock size={18} />
                                        <span className="text-sm font-medium">Time</span>
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400">
                                        {oldStartTime} {oldEndTime ? `– ${oldEndTime}` : ''}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                                    <div className="flex items-center gap-3 w-32 shrink-0 text-gray-400 mt-0.5">
                                        <User size={18} />
                                        <span className="text-sm font-medium">Dentist</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400 leading-tight">
                                            {oldDentistName}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400 mt-1">
                                            {appointment?.is_dentist_preferred ? 'Preferred Doctor' : 'Assigned by System'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* New Schedule */}
                        <div className="p-8 sm:p-10 bg-brand-50/50 dark:bg-brand-500/5 rounded-3xl border-2 border-brand-200 dark:border-brand-500/20 relative shadow-theme-lg flex flex-col h-full">
                            <div className="mb-8 flex flex-col gap-1">
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Rescheduled</span>
                                <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    New Appointment
                                </h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                    <div className="flex items-center gap-3 w-32 shrink-0 text-brand-500">
                                        <Calendar size={20} />
                                        <span className="text-sm font-medium">Date</span>
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{newDateStr}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                    <div className="flex items-center gap-3 w-32 shrink-0 text-brand-500">
                                        <Clock size={20} />
                                        <span className="text-sm font-medium">Time</span>
                                    </div>
                                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                        {newStartTime} {newEndTime ? `– ${newEndTime}` : ''}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                                    <div className="flex items-center gap-3 w-32 shrink-0 text-brand-500 mt-0.5">
                                        <User size={20} />
                                        <span className="text-sm font-medium">Dentist</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            {newDentistName}
                                        </span>
                                        <span className={`text-xs font-bold mt-1 ${formData.dentist_id ? 'text-brand-500' : 'text-gray-400'}`}>
                                            {formData.dentist_id ? 'Preferred Doctor' : 'Assigned by System'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ReviewSection>
            </div>

            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-10 sm:pt-6 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center gap-3 w-full sm:justify-between'>
                    <button 
                        onClick={onBack} 
                        disabled={submitting} 
                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[11px] sm:text-sm px-4 py-3.5 sm:px-8 transition-colors bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs disabled:opacity-30'
                    >
                        Back
                    </button>
                    <button 
                        type="button"
                        onClick={handleFinalSubmit} 
                        disabled={submitting || isEntryLocked} 
                        className='flex-[2] sm:flex-none sm:min-w-[240px] group bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black px-6 py-3.5 sm:px-10 sm:py-4.5 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-base'
                    >
                        { submitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Confirming...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirm Reschedule</span>
                                <ShieldCheck size={22} className="group-hover:scale-110 transition-transform hidden sm:block" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserRescheduleReviewStep;
