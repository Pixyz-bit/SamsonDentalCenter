import React from 'react';
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
    ShieldCheck
} from 'lucide-react';
import { formatDate, formatTime } from '../../hooks/useAppointments';

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
    const serviceName = appointment?.service?.name || appointment?.service || '—';
    
    const newDateStr = formatDate(formData.date);
    const newTimeStr = formatTime(formData.time);
    
    const oldDateStr = formatDate(appointment?.appointment_date);
    const oldTimeStr = formatTime(appointment?.start_time);

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

            {error && (
                <div className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-3xl mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden'>
                    <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-[14px] sm:text-lg font-bold text-red-600 dark:text-red-400">
                                Scheduling Alert
                            </h3>
                        </div>
                    </div>
                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <p className="text-[13px] sm:text-[15px] text-gray-900 dark:text-white font-bold leading-snug">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full space-y-4 sm:space-y-6">
                <ReviewSection title="Schedule Comparison" icon={CalendarDays} onEditClick={onBack}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        {/* Current Schedule */}
                        <div className="p-5 sm:p-6 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-gray-800 opacity-60">
                            <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Original Appointment</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-[14px] sm:text-base font-bold text-gray-600 dark:text-gray-400">{oldDateStr}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-[14px] sm:text-base font-bold text-gray-600 dark:text-gray-400">{oldTimeStr}</span>
                                </div>
                            </div>
                        </div>

                        {/* New Schedule */}
                        <div className="p-5 sm:p-6 bg-brand-50/50 dark:bg-brand-500/5 rounded-2xl border border-brand-200 dark:border-brand-500/20 relative shadow-theme-xs">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center z-10 hidden lg:flex">
                                <ArrowRight size={12} className="text-brand-500" />
                            </div>
                            <h4 className="text-[10px] sm:text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-4">New Schedule</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-brand-500" />
                                    <span className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">{newDateStr}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-brand-500" />
                                    <span className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">{newTimeStr}</span>
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
                        onClick={onSubmit} 
                        disabled={submitting} 
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
