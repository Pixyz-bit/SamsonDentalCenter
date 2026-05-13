import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, AlertCircle, Clock, Calendar } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import UserStepIndicator from '../user-booking/UserStepIndicator';
import DateTimeStep from '../user-booking/DateTimeStep';
import UserRescheduleReviewStep from './UserRescheduleReviewStep';
import UserRescheduleSuccess from './UserRescheduleSuccess';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    } catch (e) { return dateStr; }
};

const formatTime = (time24) => {
    if (!time24) return '';
    try {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) { return time24; }
};

const UserRescheduleWizard = ({ reschedule, appointment }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const {
        sessionId,
        step,
        currentStep,
        formData,
        error,
        submitting,
        result,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        submit,
        reset,
        slotHold,
    } = reschedule;

    const [showExitModal, setShowExitModal] = useState(false);
    const [showExpiryModal, setShowExpiryModal] = useState(false);
    const warnedExpiryRef = useRef(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);

    // Initial hold check (Recovery Interceptor)
    useEffect(() => {
        const checkRecovery = async () => {
            if (slotHold.checkActiveHold) {
                const hasHold = await slotHold.checkActiveHold();
                // Only show recovery if we are on step 1 and have a hold
                if (hasHold && step === 1 && formData.date && formData.time) {
                    setShowRecoveryModal(true);
                }
            }
        };
        checkRecovery();
    }, []);

    // Track hold for expiry detection
    useEffect(() => {
        if (slotHold.activeHold && slotHold.timeRemaining === 120 && !warnedExpiryRef.current) {
            toast.warning('Your slot hold expires in 2 minutes. Please complete your reschedule soon!');
            warnedExpiryRef.current = true;
        }

        if (!slotHold.activeHold || slotHold.timeRemaining > 120) {
            warnedExpiryRef.current = false;
        }

        // Auto-show expiry modal if hold is lost while on review step
        // ✅ Added check for !slotHold.isCheckingHold to avoid false positives during hydration
        if (!slotHold.isCheckingHold && !slotHold.activeHold && !result && currentStep === 'review' && !showExpiryModal) {
            setShowExpiryModal(true);
        }
    }, [slotHold.activeHold, slotHold.timeRemaining, slotHold.isCheckingHold, toast, result, currentStep, showExpiryModal]);

    // Auto-scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const breadcrumbLabels = ['Schedule', 'Review'];

    if (result && result.success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-center relative">
                        <UserStepIndicator
                            currentStep={3} // success = 3 (Schedule=1, Review=2, Success=3)
                            labels={[...breadcrumbLabels, 'Success']}
                            onStepClick={() => {}}
                        />
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-8 md:px-12 py-10 md:py-16">
                    <UserRescheduleSuccess
                        newDate={formData.date}
                        newTime={formData.time}
                        serviceName={appointment?.service?.name || appointment?.service}
                        onReturn={() => navigate('/patient/appointments')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-center relative">
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                        <button
                            onClick={() => setShowExitModal(true)}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-base transition-colors p-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X size={18} />
                            <span className="hidden sm:inline">Exit</span>
                        </button>
                    </div>

                    <UserStepIndicator
                        currentStep={step}
                        labels={breadcrumbLabels}
                        onStepClick={(index) => goToStep(index + 1)}
                    />

                    {slotHold.activeHold && (
                        <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg sm:rounded-xl">
                            <Clock className="text-amber-600 dark:text-amber-400 animate-pulse hidden sm:block" size={18} />
                            <div className="flex flex-col items-center sm:items-start justify-center">
                                <span className="order-2 sm:order-1 text-[6px] sm:text-[9px] font-black text-amber-600/70 dark:text-amber-400/50 leading-none tracking-wider uppercase">
                                    <span className="hidden sm:inline">Slot </span>Hold
                                </span>
                                <span className="order-1 sm:order-2 text-[10px] sm:text-[13px] font-mono font-black text-amber-700 dark:text-amber-300 leading-none">
                                    {slotHold.formattedTime}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {slotHold.activeHold && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-100 dark:bg-gray-800/50 overflow-hidden">
                        <div
                            className="h-full bg-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            style={{
                                width: `${(slotHold.timeRemaining / ((slotHold.activeHold?.expires_in_minutes || 10) * 60)) * 100}%`,
                                backgroundColor: slotHold.timeRemaining < 60 ? '#ef4444' : '#f59e0b'
                            }}
                        />
                    </div>
                )}
            </header>

            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <LogOut className="text-amber-600 dark:text-amber-400 rotate-180" size={22} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white">Discard Changes?</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold">Action required to leave</p>
                        </div>
                    </div>

                    <div className="px-6 py-6 sm:py-8 flex-1 overflow-y-auto text-center">
                        <div className="space-y-4">
                            <p className="text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold italic">
                                Your rescheduling progress will be lost and your original appointment time will remain unchanged.
                            </p>
                        </div>
                    </div>

                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => {
                                reset();
                                navigate(`/patient/appointments/${appointment.id}`);
                            }}
                            className="flex-1 h-11 text-[11px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        >
                            Discard & Exit
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => setShowExitModal(false)}
                            className="flex-[1.5] h-11 text-[11px] sm:text-sm font-black shadow-lg shadow-brand-500/20"
                        >
                            Continue Rescheduling
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showExpiryModal}
                onClose={() => setShowExpiryModal(false)}
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <Clock className="text-amber-600 dark:text-amber-400" size={22} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Need More Time?</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your current slot reservation has timed out.</p>
                        </div>
                    </div>

                    <div className="px-6 py-8 flex-1 overflow-y-auto text-center">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                We’ve kept your info ready for you. Simply pick a new time to complete your reschedule!
                            </p>
                        </div>
                    </div>

                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => {
                                setShowExpiryModal(false);
                                goToStep(1);
                                updateFields({ date: '', time: '' });
                            }}
                            className="flex-1 h-10 sm:h-12 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 transition-all duration-300"
                        >
                            Select New Time
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => setShowExpiryModal(false)}
                            className="flex-[1.5] h-10 sm:h-12 text-[10px] sm:text-sm font-black shadow-lg shadow-brand-500/20"
                        >
                            Keep Browsing
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showRecoveryModal}
                onClose={() => setShowRecoveryModal(false)}
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-brand-600 dark:text-brand-400" size={22} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white">Resume Rescheduling?</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold">We’ve saved your progress.</p>
                        </div>
                    </div>

                    <div className="px-6 py-6 sm:py-8 flex-1 overflow-y-auto">
                        <div className="p-5 sm:p-6 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100/50 dark:border-brand-800/30 rounded-2xl sm:rounded-3xl flex flex-col items-center text-center gap-4 sm:gap-5 shadow-theme-xs">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-brand-800 flex items-center justify-center shrink-0 shadow-theme-sm">
                                <Calendar className="text-brand-600 dark:text-brand-400" size={24} sm:size={28} />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">Reserved Slot:</h4>
                                <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-snug">
                                    We are still holding your appointment for:
                                </p>
                            </div>

                            <div className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-brand-100 dark:border-brand-900/20 shadow-theme-xs flex flex-col items-center">
                                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center">
                                    <span className="text-[10px] sm:text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                        {formatDate(slotHold.activeHold?.date)}
                                    </span>
                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700 font-light">|</span>
                                    <span className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
                                        {formatTime(slotHold.activeHold?.time)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] sm:text-[12px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl">
                                <Clock size={13} sm:size={14} className="animate-pulse" />
                                <span>Hold expires in {slotHold.formattedTime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => {
                                setShowRecoveryModal(false);
                                reset();
                            }}
                            className="flex-1 h-11 text-[11px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 transition-all duration-300 border border-transparent"
                        >
                            Discard & Start Over
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => {
                                setShowRecoveryModal(false);
                            }}
                            className="flex-[1.5] h-11 text-[11px] sm:text-sm font-black shadow-lg shadow-brand-500/20"
                        >
                            Continue Reschedule
                        </Button>
                    </div>
                </div>
            </Modal>

            <main className="flex-1 max-w-6xl mx-auto px-8 md:px-12 py-10 md:py-16 w-full">
                <div className="min-h-[60vh]">
                    {currentStep === 'datetime' && (
                        <DateTimeStep
                            serviceId={appointment?.service_id || appointment?.service?.id}
                            selectedDate={formData.date}
                            selectedTime={formData.time}
                            formData={formData}
                            onUpdate={updateFields}
                            onNext={nextStep}
                            onBack={() => navigate(`/patient/appointments/${appointment.id}`)}
                            serviceName={appointment?.service?.name || appointment?.service}
                            serviceTier={appointment?.service?.tier || 'standard'}
                            sessionId={sessionId}
                            slotHold={slotHold}
                            nextLabel="Continue to Review"
                        />
                    )}

                    {currentStep === 'review' && (
                        <UserRescheduleReviewStep
                            formData={formData}
                            appointment={appointment}
                            onSubmit={submit}
                            onBack={prevStep}
                            submitting={submitting}
                            error={error}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserRescheduleWizard;
