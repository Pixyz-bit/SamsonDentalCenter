import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import useAdminBooking from '../../../../hooks/useAdminBooking';

// Steps
                import ServiceStep from './steps/ServiceStep';
import DateTimeStep from './steps/DateTimeStep';
import PatientSelectStep from './steps/PatientSelectStep';
import ReviewStep from './steps/ReviewStep';

const AdminBookingWizard = ({ isOpen, onClose, primaryPatient, dependents, token, onSuccess }) => {
    const {
        step,
        currentStep,
        formData,
        submitting,
        error,
        result,
        updateFields,
        nextStep,
        prevStep,
        submit,
        reset
    } = useAdminBooking(primaryPatient, token);

    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Auto-reset when opening
    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (result?.success) {
            onSuccess();
        }
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

    const renderStep = () => {
        switch (currentStep) {
            case 'service':
                return (
                    <ServiceStep 
                        selectedServiceId={formData.service_id}
                        onSelect={updateFields}
                    />
                );
            case 'datetime':
                return (
                    <DateTimeStep 
                        selectedDate={formData.date}
                        selectedTime={formData.time}
                        serviceId={formData.service_id}
                        formData={formData}
                        sessionId={formData.sessionId}
                        slotHold={{
                            activeHold: null, 
                            holdSlot: async () => ({ success: true }), 
                            releaseHold: async () => {},
                            formattedTime: '',
                            holdLoading: false,
                            holdError: null,
                            timeRemaining: null
                        }}
                        onUpdate={updateFields}
                    />
                );
            case 'patient_select':
                return (
                    <PatientSelectStep 
                        primaryPatient={primaryPatient}
                        dependents={dependents}
                        selectedPatientId={formData.target_patient_id}
                        onSelect={(id) => {
                            const p = [primaryPatient, ...dependents].find(p => p.id === id);
                            updateFields({ 
                                target_patient_id: id,
                                target_patient_name: p?.full_name || 'Selected Patient'
                            });
                        }}
                    />
                );
            case 'review':
                return (
                    <ReviewStep 
                        formData={formData}
                        submitting={submitting}
                        result={result}
                        onReset={handleClose}
                    />
                );
            default:
                return null;
        }
    };

    const stepLabels = [
        { id: 'service', label: 'Service', icon: CheckCircle2 },
        { id: 'datetime', label: 'Schedule', icon: Calendar },
        { id: 'patient_select', label: 'Patient', icon: User },
        { id: 'review', label: 'Review', icon: CheckCircle2 }
    ];

    const canProceed = () => {
        switch (currentStep) {
            case 'service': return !!formData.service_id;
            case 'datetime': return !!(formData.time || formData.waitlist_time);
            case 'patient_select': return !!formData.target_patient_id;
            case 'review': return true;
            default: return false;
        }
    };

    const handleNextOrSubmit = () => {
        if (currentStep === 'review') {
            submit();
        } else {
            nextStep();
        }
    };

    const modalContent = (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6'>
            {/* Backdrop */}
            <div 
                className='absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300' 
            />
            
            {/* Modal */}
            <div className='relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]'>
                {/* Header */}
                <div className='p-6 sm:p-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500'>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1.5'>
                                Internal Scheduling
                            </p>
                            <h3 className='text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight'>
                                Book Appointment
                            </h3>
                        </div>
                    </div>
                    
                    <button 
                        onClick={requestClose}
                        className='p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors'
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className='px-8 py-4 bg-gray-50/50 dark:bg-white/[0.01] border-b border-gray-100 dark:border-gray-800 shrink-0 overflow-x-auto no-scrollbar'>
                    <div className='flex items-center justify-between gap-4 min-w-[500px]'>
                        {stepLabels.map((s, i) => {
                            const isCompleted = i < step || (i === step && result?.success);
                            const isActive = i === step && !result?.success;
                            return (
                                <div key={s.id} className='flex items-center gap-3 relative'>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                                        isCompleted ? 'bg-success-500 text-white' : 
                                        isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-110' : 
                                        'bg-gray-100 dark:bg-white/5 text-gray-400'
                                    }`}>
                                        {isCompleted ? <CheckCircle2 size={16} /> : i + 1}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                                    }`}>
                                        {s.label}
                                    </span>
                                    {i < stepLabels.length - 1 && (
                                        <div className='w-8 h-[2px] bg-gray-100 dark:bg-gray-800 mx-1' />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className='p-8 overflow-y-auto grow custom-scrollbar'>
                    {error && (
                        <div className='mb-6 p-4 rounded-2xl bg-error-50 dark:bg-error-500/5 border border-error-100 dark:border-error-500/10 text-error-600 dark:text-error-400 text-xs font-bold uppercase tracking-tight flex items-center gap-3'>
                            <X size={16} className='shrink-0' />
                            {error}
                        </div>
                    )}
                    
                    {renderStep()}
                </div>

                {/* Footer Navigation */}
                <div className='p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between shrink-0'>
                    {result?.success ? (
                        <div className="flex w-full justify-end">
                            <button 
                                onClick={handleClose}
                                className='h-12 px-10 rounded-2xl bg-brand-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 active:scale-95 transition-all'
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={prevStep}
                                disabled={step === 0 || submitting}
                                className='h-12 px-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all flex items-center gap-2 disabled:opacity-50'
                            >
                                <ChevronLeft size={16} /> Back
                            </button>

                            <button 
                                onClick={handleNextOrSubmit}
                                disabled={!canProceed() || submitting}
                                className='h-12 px-10 rounded-2xl bg-brand-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className='animate-spin' /> Processing...</>
                                ) : currentStep === 'review' ? (
                                    'Confirm Schedule'
                                ) : (
                                    <>Next Step <ChevronRight size={16} /></>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Exit Confirmation Overlay */}
            {showExitConfirm && (
                <div className='absolute inset-0 z-[10000] flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200' onClick={() => setShowExitConfirm(false)} />
                    <div className='relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800'>
                        <div className='w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6 mx-auto'>
                            <X size={28} className='text-red-500' />
                        </div>
                        <h3 className='text-lg font-black text-center text-gray-900 dark:text-white uppercase tracking-tight mb-2'>
                            Cancel Booking?
                        </h3>
                        <p className='text-sm text-center text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>
                            Are you sure you want to exit? Any unsaved progress will be lost.
                        </p>
                        <div className='flex gap-3'>
                            <button 
                                onClick={() => setShowExitConfirm(false)}
                                className='flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                            >
                                Continue Booking
                            </button>
                            <button 
                                onClick={handleClose}
                                className='flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20'
                            >
                                Yes, Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AdminBookingWizard;
