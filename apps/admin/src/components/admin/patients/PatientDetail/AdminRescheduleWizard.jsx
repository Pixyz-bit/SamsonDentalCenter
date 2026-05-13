import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Stethoscope, ChevronLeft, ChevronRight, Loader2, CheckCircle2, RefreshCw, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import useAdminReschedule from '../../../../hooks/useAdminReschedule';
import DateTimeStep from './steps/DateTimeStep';
import { api } from '../../../../utils/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatDateLong = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).toUpperCase();
};

const formatTime12h = (time24) => {
    if (!time24) return '—';
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours % 12 || 12;
    const displayM = minutes < 10 ? '0' + minutes : minutes;
    return `${displayH}:${displayM} ${ampm}`;
};

const formatFullTimeRange = (startTime, durationMinutes) => {
    if (!startTime) return '—';
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    
    if (!durationMinutes) return formatTime12h(startTime);
    
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const endH = end.getHours();
    const endM = end.getMinutes();
    const endStr = `${endH}:${endM < 10 ? '0' + endM : endM}`;
    
    return `${formatTime12h(startTime)} – ${formatTime12h(endStr)}`;
};

// ─── Inline Review Step for Reschedule ────────────────────────────────────────
const RescheduleReviewStep = ({ appointment, formData, result, dentists }) => {
    const serviceName = appointment?.service?.name || appointment?.service || 'Dental Service';
    const serviceDuration = appointment?.service?.duration_minutes;
    
    const oldDoctorName = appointment?.dentist?.profile?.full_name || 'Any Available Doctor';
    const newDoctor = dentists.find(d => d.id === formData.dentist_id);
    const newDoctorName = newDoctor ? (newDoctor.profile?.full_name || newDoctor.name) : 'Any Available Doctor';

    if (result?.success) {
        return (
            <div className='py-10 text-center animate-in zoom-in-95 duration-500'>
                <div className='w-20 h-20 bg-success-50 dark:bg-success-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success-500/10'>
                    <CheckCircle2 size={40} className='text-success-500' />
                </div>
                <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2'>
                    Rescheduled Successfully
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed font-medium'>
                    The appointment has been moved. The patient will receive an updated schedule notice.
                </p>
                <div className='max-w-md mx-auto p-6 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 space-y-4 shadow-theme-sm'>
                    <div className='grid grid-cols-1 gap-4 text-left'>
                        <div className='flex items-center gap-4'>
                            <Calendar size={16} className='text-brand-500 shrink-0' />
                            <span className='text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest'>{formatDateLong(formData.date)}</span>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Clock size={16} className='text-brand-500 shrink-0' />
                            <span className='text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest'>{formatFullTimeRange(formData.time, serviceDuration)}</span>
                        </div>
                        <div className='flex items-center gap-4'>
                            <UserCheck size={16} className='text-brand-500 shrink-0' />
                            <span className='text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest'>{newDoctorName}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-8 animate-in fade-in duration-500'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Old Schedule Column */}
                <div className='p-6 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800 relative group overflow-hidden'>
                    <div className='absolute -right-4 -top-4 w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700' />
                    
                    <label className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-6 relative'>
                        Current Appointment
                    </label>
                    
                    <div className='space-y-4 relative'>
                        <div className='flex items-center gap-3 opacity-60 line-through decoration-gray-400/50 decoration-2'>
                            <Calendar size={14} className='text-gray-400 shrink-0' />
                            <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>
                                {formatDateLong(appointment?.appointment_date)}
                            </span>
                        </div>
                        <div className='flex items-center gap-3 opacity-60 line-through decoration-gray-400/50 decoration-2'>
                            <Clock size={14} className='text-gray-400 shrink-0' />
                            <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>
                                {formatFullTimeRange(appointment?.start_time, serviceDuration)}
                            </span>
                        </div>
                        <div className='flex items-center gap-3 opacity-60'>
                            <UserCheck size={14} className='text-gray-400 shrink-0' />
                            <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>
                                {oldDoctorName}
                            </span>
                        </div>
                    </div>

                    <div className='mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 opacity-40'>
                         <Stethoscope size={14} className='text-gray-400' />
                         <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{serviceName}</span>
                    </div>
                </div>

                {/* New Schedule Column */}
                <div className='p-6 rounded-[2rem] bg-brand-50/30 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/20 relative group overflow-hidden shadow-theme-sm'>
                    <div className='absolute -right-4 -top-4 w-20 h-20 bg-brand-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700' />

                    <label className='text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] block mb-6 relative'>
                        Proposed New Schedule
                    </label>

                    <div className='space-y-4 relative'>
                        <div className='flex items-center gap-3'>
                            <Calendar size={14} className='text-brand-500 shrink-0' />
                            <span className='text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest'>
                                {formatDateLong(formData.date)}
                            </span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Clock size={14} className='text-brand-500 shrink-0' />
                            <span className='text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest'>
                                {formatFullTimeRange(formData.time, serviceDuration)}
                            </span>
                        </div>
                        <div className='flex items-center gap-3'>
                            <UserCheck size={14} className='text-brand-500 shrink-0' />
                            <span className='text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest'>
                                {newDoctorName}
                            </span>
                        </div>
                    </div>

                    <div className='mt-8 pt-6 border-t border-brand-100 dark:border-brand-500/10 flex items-center gap-3'>
                         <Stethoscope size={14} className='text-brand-500' />
                         <span className='text-[10px] font-black text-brand-500 uppercase tracking-widest'>{serviceName}</span>
                    </div>
                </div>
            </div>
            
            <div className='flex items-center justify-center gap-4 py-2 opacity-50'>
                <div className='flex-1 h-px bg-gray-100 dark:bg-gray-800' />
                <div className='flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest'>
                    <RefreshCw size={10} /> Confirm Changes Below
                </div>
                <div className='flex-1 h-px bg-gray-100 dark:bg-gray-800' />
            </div>
        </div>
    );
};

const AdminRescheduleWizard = ({ isOpen, onClose, appointment, token, onSuccess }) => {
    const reschedule = useAdminReschedule(appointment, token);
    const contentRef = useRef(null);

    // ✅ Auto-scroll to top on error
    useEffect(() => {
        if (error && contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [error]);

    const {
        step,
        currentStep,
        sessionId,
        formData,
        submitting,
        error,
        result,
        updateFields,
        nextStep,
        prevStep,
        submit,
        reset,
    } = reschedule;

    // ✅ Error Detail Parsing (Parity with User Booking)
    const getErrorDetails = () => {
        if (!error) return null;

        if (error.includes('Conflict:')) {
            return {
                headline: 'Scheduling Conflict',
                message: error,
                solution: "This patient is already booked for another service during this time. Please select a different slot.",
                action: { label: 'Change Time', onClick: prevStep }
            };
        }

        if (error.includes('already booked for this service')) {
            return {
                headline: 'Duplicate Treatment',
                message: "This patient already has this service scheduled for the selected date.",
                solution: "Treatment guidelines limit this service to once per day per patient.",
                action: { label: 'Change Date', onClick: prevStep }
            };
        }

        return {
            headline: 'Reschedule Alert',
            message: error,
            solution: "Please verify the schedule availability and try again.",
            action: null
        };
    };

    const errorDetails = getErrorDetails();

    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [dentists, setDentists] = useState([]);

    useEffect(() => {
        if (isOpen) {
            reset();
            const fetchDentists = async () => {
                try {
                    const res = await api.get('/admin/dentists', token);
                    setDentists(res.dentists || []);
                } catch (e) {
                    console.error('Failed to fetch dentists:', e);
                }
            };
            fetchDentists();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (result?.success && onSuccess) onSuccess();
        setShowExitConfirm(false);
        onClose();
    };

    const requestClose = () => {
        if (result?.success) {
            handleClose();
        } else {
            setShowExitConfirm(true);
        }
    };

    const canProceed = () => {
        if (currentStep === 'datetime') return !!(formData.date && formData.time);
        if (currentStep === 'review') return true;
        return false;
    };

    const handleNextOrSubmit = () => {
        if (currentStep === 'review') {
            submit();
        } else {
            nextStep();
        }
    };

    const stepLabels = [
        { id: 'datetime', label: 'New Schedule', icon: Calendar },
        { id: 'review',   label: 'Review',       icon: CheckCircle2 },
    ];

    const serviceId = appointment?.service_id || appointment?.service?.id;
    const serviceName = appointment?.service?.name || appointment?.service || '';
    const serviceTier = appointment?.service?.tier || 'standard';

    const modalContent = (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6'>
            <div className='absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300' />

            <div className='relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] border border-gray-100 dark:border-gray-800'>

                {/* Header */}
                <div className='p-8 sm:px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0'>
                    <div className='flex items-center gap-5'>
                        <div className='w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 shadow-inner'>
                            <RefreshCw size={28} />
                        </div>
                        <div>
                            <p className='text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] leading-none mb-2'>
                                Admin Wizard
                            </p>
                            <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-display'>
                                Reschedule Visit
                            </h3>
                        </div>
                    </div>

                    <button
                        onClick={requestClose}
                        className='p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all hover:scale-110 active:scale-95'
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className='px-10 py-5 bg-gray-50/30 dark:bg-white/[0.01] border-b border-gray-100 dark:border-gray-800 shrink-0'>
                    <div className='flex items-center justify-center gap-10'>
                        {stepLabels.map((s, i) => {
                            const isCompleted = i < step || (i === step && result?.success);
                            const isActive = i === step && !result?.success;
                            return (
                                <div key={s.id} className='flex items-center gap-4 relative'>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all duration-500 ${
                                        isCompleted ? 'bg-success-500 text-white shadow-lg shadow-success-500/20' :
                                        isActive ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/30 scale-110' :
                                        'bg-gray-100 dark:bg-white/5 text-gray-400'
                                    }`}>
                                        {isCompleted ? <CheckCircle2 size={18} /> : i + 1}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                        isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                                    }`}>
                                        {s.label}
                                    </span>
                                    {i < stepLabels.length - 1 && (
                                        <div className='w-12 h-[2px] bg-gray-100 dark:bg-gray-800 mx-2 rounded-full' />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div 
                    ref={contentRef}
                    className='p-8 sm:px-10 overflow-y-auto grow custom-scrollbar'
                >
                    {errorDetails && (
                        <div className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-[2rem] mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden'>
                            <div className="px-6 pt-6 pb-5 sm:px-8 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
                                        {errorDetails.headline}
                                    </h3>
                                </div>
                            </div>
                            
                            <div className="px-6 py-6 sm:px-8">
                                <div className="space-y-6">
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0 shadow-sm" />
                                            <p className="text-xs sm:text-[13px] text-gray-900 dark:text-white font-bold leading-snug">
                                                {errorDetails.message}
                                            </p>
                                        </li>
                                        {errorDetails.solution && (
                                            <li className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 opacity-40" />
                                                <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-wide">
                                                    {errorDetails.solution}
                                                </p>
                                            </li>
                                        )}
                                    </ul>

                                    <div className="pt-2 flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={submit}
                                            disabled={submitting}
                                            className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white dark:bg-red-900/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 shrink-0 disabled:opacity-50"
                                        >
                                            <RefreshCw size={12} className={submitting ? 'animate-spin' : ''} />
                                            Retry
                                        </button>
                                        
                                        {errorDetails.action && (
                                            <button
                                                type="button"
                                                onClick={errorDetails.action.onClick}
                                                className="flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-theme-md active:scale-95 shrink-0"
                                            >
                                                {errorDetails.action.label}
                                                <ArrowRight size={12} className="opacity-80" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 'datetime' && (
                        <DateTimeStep
                            serviceId={serviceId}
                            selectedDate={formData.date}
                            selectedTime={formData.time}
                            formData={formData}
                            sessionId={sessionId}
                            serviceName={serviceName}
                            serviceTier={serviceTier}
                            slotHold={{
                                activeHold: null,
                                holdSlot: async () => ({ success: true }),
                                releaseHold: async () => {},
                                formattedTime: '',
                                holdLoading: false,
                                holdError: null,
                                timeRemaining: null,
                            }}
                            onUpdate={updateFields}
                            disableWaitlist={true}
                        />
                    )}

                    {currentStep === 'review' && (
                        <RescheduleReviewStep
                            appointment={appointment}
                            formData={formData}
                            result={result}
                            dentists={dentists}
                        />
                    )}
                </div>

                {/* Sticky Footer */}
                <div className='p-8 sm:px-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center shrink-0'>
                    {result?.success ? (
                        <div className='flex w-full justify-end'>
                            <button
                                onClick={handleClose}
                                className='h-14 px-12 rounded-[1.5rem] bg-brand-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all'
                            >
                                Finish Wizard
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={prevStep}
                                disabled={step === 0 || submitting}
                                className='h-14 px-8 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group'
                            >
                                <ChevronLeft size={18} className='group-hover:-translate-x-1 transition-transform' /> Previous
                            </button>

                            <button
                                onClick={handleNextOrSubmit}
                                disabled={!canProceed() || submitting}
                                className='h-14 px-12 rounded-[1.5rem] bg-brand-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/30 hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group'
                            >
                                {submitting ? (
                                    <><Loader2 size={18} className='animate-spin' /> Processing Request...</>
                                ) : currentStep === 'review' ? (
                                    'Confirm New Schedule'
                                ) : (
                                    <>Continue Review <ChevronRight size={18} className='group-hover:translate-x-1 transition-transform' /></>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Exit Confirmation Dialog */}
            {showExitConfirm && (
                <div className='absolute inset-0 z-[10000] flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300' onClick={() => setShowExitConfirm(false)} />
                    <div className='relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center'>
                        <div className='w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-8 mx-auto shadow-inner'>
                            <X size={36} className='text-red-500' />
                        </div>
                        <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4'>
                            Abort Changes?
                        </h3>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium'>
                            Any selection for the new schedule will be lost. The original appointment remains unchanged.
                        </p>
                        <div className='flex flex-col gap-3'>
                            <button
                                onClick={handleClose}
                                className='w-full py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95'
                            >
                                Yes, Abandon
                            </button>
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className='w-full py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95'
                            >
                                Stay in Wizard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AdminRescheduleWizard;
