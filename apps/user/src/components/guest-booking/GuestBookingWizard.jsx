import { useEffect, useState, useRef } from 'react';
import { X, Calendar, Clock, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import StepIndicator from './StepIndicator';
import ServiceStep from './ServiceStep';
import DateTimeStep from './DateTimeStep';
import InfoStep from './InfoStep';
import ConfirmStep from './ConfirmStep';
import OTPStep from './OTPStep';
import GuestBookingSuccess from './GuestBookingSuccess';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    } catch (e) {
        return dateStr;
    }
};

const formatTime = (time24) => {
    if (!time24) return '';
    try {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
        return time24;
    }
};

const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime) return '';
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

const GuestBookingWizard = ({ booking }) => {
    const navigate = useNavigate();
    const {
        sessionId,
        step,
        currentStep,
        formData,
        submitting,
        error,
        result,
        slotHold,
        updateField,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        submit,
        reset,
    } = booking;
    const toast = useToast();

    const [isCheckingRecovery, setIsCheckingRecovery] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showExpiryModal, setShowExpiryModal] = useState(false);
    const [hasDismissedRecovery, setHasDismissedRecovery] = useState(false);
    const [hasCheckedRecovery, setHasCheckedRecovery] = useState(false);
    const [wasRecovered, setWasRecovered] = useState(false);
    const hadHoldRef = useRef(false);

    // Track if we HAD a hold so we can detect when it disappears (expiry)
    useEffect(() => {
        if (slotHold.activeHold) {
            hadHoldRef.current = true;
        }
    }, [slotHold.activeHold]);

    // ✅ Release hold on page exit (close browser, navigate away, refresh)
    useEffect(() => {
        const handleUnload = async (e) => {
            if (sessionId && !result) {
                // We use a beacon or a synchronous-like call if possible, 
                // but for simplicity in this wizard, we rely on the hook's cleanup.
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [sessionId, result]);

    // ✅ Phase 1: Robust Auto-scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        // Double-check with a slight delay to ensure dynamic content is loaded
        const timeoutId = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [step]);

    // ✅ Phase 2: Recovery Interceptor
    useEffect(() => {
        const verifySession = async () => {
            // Check recovery on ANY active step (>= 1) if we haven't checked yet
            if (step >= 1 && !result && !hasCheckedRecovery) {
                setIsCheckingRecovery(true);
                try {
                    // checkActiveHold will update slotHold.activeHold state internally
                    const hold = await slotHold.checkActiveHold();
                    
                    if (hold) {
                        // Only show the "Continue Booking?" modal if we are at the START of the session
                        // (meaning the user just loaded the page and we found a hold)
                        setWasRecovered(true);
                    } else if (step > 1) {
                        // If we are on a later step but the hold is gone, we MUST reset
                        handleReset();
                        toast.error('Session expired. Please start again.');
                    }
                } catch (err) {
                    console.error('Recovery check failed:', err);
                } finally {
                    setIsCheckingRecovery(false);
                    setHasCheckedRecovery(true);
                }
            } else if (step === 0 && !hasCheckedRecovery) {
                // If they are on Service step, we can check early or wait. 
                // Let's wait until they hit Step 1 to keep it clean, but mark as checked if they are at the start
                // Actually, if they are on Step 0, we should still check if there's a hold to offer recovery
                setIsCheckingRecovery(true);
                try {
                    const hold = await slotHold.checkActiveHold();
                    if (hold) setWasRecovered(true);
                } finally {
                    setIsCheckingRecovery(false);
                    setHasCheckedRecovery(true);
                }
            }
        };

        verifySession();
    }, [step, result, hasCheckedRecovery, slotHold.checkActiveHold]);

    // ✅ Phase 2: Handle Expired Holds during session
    useEffect(() => {
        // If we HAD a hold and now it's null (and we aren't currently checking/loading)
        // AND we still have a time selection in our form (meaning it didn't get cleared intentionally)
        if (hasCheckedRecovery && !slotHold.isCheckingHold && !isCheckingRecovery && !slotHold.holdLoading && step >= 1 && hadHoldRef.current && !slotHold.activeHold && formData.time && !result) {
            // Auto-redirect to Step 1 (DateTime) if hold expires
            hadHoldRef.current = false;
            goToStep(1);
            
            // Force deep clean
            slotHold.clearHold();
            updateFields({ date: '', time: '' });
            setShowExpiryModal(true);
            setShowRecoveryModal(false); // ✅ Prevent double modal conflict
        }
    }, [slotHold.activeHold, slotHold.isCheckingHold, slotHold.holdLoading, slotHold.clearHold, step, result, hasCheckedRecovery, isCheckingRecovery, goToStep, updateFields, showRecoveryModal, formData.time]);

    // ✅ Phase 2: Show Recovery Modal once we know the hold status
    useEffect(() => {
        // ONLY show if we actually RECOVERED a session (wasRecovered is true)
        // AND the user hasn't already dismissed it in this page load
        // AND they are at least on the DateTime step (step >= 1)
        // AND they haven't been locked out by security (failedOtpAttempts < 5)
        if (hasCheckedRecovery && wasRecovered && step >= 1 && slotHold.activeHold && !showRecoveryModal && !hasDismissedRecovery && booking.failedOtpAttempts < 5) {
            setShowRecoveryModal(true);
        }
    }, [hasCheckedRecovery, wasRecovered, step, slotHold.activeHold, showRecoveryModal, hasDismissedRecovery, booking.failedOtpAttempts]);

    const breadcrumbLabels = ['Service', 'Date & Time', 'Your Info', 'Review', 'Verify'];

    const handleReset = () => {
        setWasRecovered(false);
        setHasDismissedRecovery(true);
        hadHoldRef.current = false;
        reset();
    };

    const handlePartialReset = async () => {
        // Release hold but keep personal info (Step 2 data)
        if (slotHold.activeHold) {
            await slotHold.releaseHold();
        }
        updateFields({ date: '', time: '' });
        hadHoldRef.current = false;
        setWasRecovered(false);
        goToStep(1); // Go back to DateTime
    };

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
            handleReset();
            navigate('/');
        }
    };

    // If booking succeeded, show success screen
    if (result) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                    <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                        <StepIndicator
                            currentStep={6} // Success step indicator (6th step)
                            labels={[...breadcrumbLabels, 'Success']}
                            onStepClick={() => {}}
                        />
                    </div>
                </div>
                
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
                    <GuestBookingSuccess
                        result={result}
                        onReset={handleReset}
                        booking={booking}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sticky Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-center relative">
                    {/* Exit Button - Absolute positioned on the left */}
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center">
                        <button
                            onClick={handleExit}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-base transition-colors p-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Exit</span>
                        </button>
                    </div>

                    {/* Step Indicator - Truly Centered */}
                    <StepIndicator
                        currentStep={step + 1}
                        labels={breadcrumbLabels}
                        onStepClick={(index) => goToStep(index)}
                        isLocked={step >= 3}
                    />

                    {/* ✅ Phase 3: Global Timer (Right Side) */}
                    {slotHold.activeHold && (
                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl animate-in slide-in-from-right-10 duration-500 shadow-theme-xs sm:shadow-none">
                            <Clock className="text-amber-600 dark:text-amber-400 animate-pulse hidden sm:block" size={18} />
                            <div className="flex flex-col">
                                <span className="text-[7px] sm:text-[9px] uppercase tracking-widest font-black text-amber-600/60 dark:text-amber-400/50 leading-none mb-0.5 sm:mb-1">
                                    <span className="hidden sm:inline">Slot </span>Hold
                                </span>
                                <span className="text-[11px] sm:text-[13px] font-mono font-black text-amber-700 dark:text-amber-300 leading-none">
                                    {slotHold.formattedTime}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ Global Timer Progress Bar (Full Width Bottom) */}
                {slotHold.activeHold && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-100 dark:bg-gray-800/50 overflow-hidden">
                        <div 
                            className="h-full bg-amber-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            style={{ 
                                width: `${(slotHold.timeRemaining / 600) * 100}%`,
                                backgroundColor: slotHold.timeRemaining < 60 ? '#ef4444' : '#f59e0b'
                            }}
                        />
                    </div>
                )}
            </header>

            {/* ✅ Phase 2: Recovery Modal */}
            <Modal
                isOpen={showRecoveryModal}
                onClose={() => setShowRecoveryModal(false)}
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md sm:max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} sm:size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Continue Booking?</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">We saved your progress</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 sm:py-6 flex-1 overflow-y-auto">
                        <div className="p-5 sm:p-6 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/30 rounded-2xl sm:rounded-3xl flex flex-col items-center text-center gap-4 sm:gap-5 shadow-theme-xs">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-primary-800 flex items-center justify-center shrink-0 shadow-theme-sm">
                                <Calendar className="text-primary-600 dark:text-primary-400" size={24} sm:size={28} />
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">Pending Appointment</h4>
                                <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-snug">
                                    We've held your selected slot while you were away:
                                </p>
                            </div>

                            <div className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-primary-100 dark:border-primary-900/20 shadow-theme-xs flex flex-col items-center">
                                <span className="text-[9px] sm:text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mb-1">
                                    {formatDate(slotHold.activeHold?.date)}
                                </span>
                                <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                                    {formatTimeRange(slotHold.activeHold?.time, formData.service_duration)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] sm:text-[12px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl">
                                <Clock size={13} sm:size={14} className="animate-pulse" />
                                <span>Slot expires in {slotHold.formattedTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => {
                                setShowRecoveryModal(false);
                                handleReset();
                            }}
                            className="flex-1 h-11 sm:h-12 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/10 transition-all duration-300 uppercase tracking-widest border border-transparent"
                        >
                            Start Fresh
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => {
                                setShowRecoveryModal(false);
                                setHasDismissedRecovery(true);
                            }}
                            className="flex-1 h-11 sm:h-12 text-[10px] sm:text-sm font-black shadow-lg shadow-primary-500/20 uppercase tracking-widest"
                        >
                            CONTINUE
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ✅ Standard Reset Confirmation Modal */}
            <Modal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                showCloseButton={true}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-red-600 dark:text-red-400" size={20} sm:size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Start Over?</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">This action cannot be undone</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 sm:py-8 flex-1 overflow-y-auto">
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                Do you want to <span className="text-red-600 dark:text-red-400 font-bold">release your slot hold</span> and start fresh?
                            </p>
                            <p className="text-[12px] sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                If you start over, your selected time will be made available to other patients, and any information you've entered will be cleared.
                            </p>
                            <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl sm:rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
                                    <Clock size={16} sm:size={18} className="text-amber-500" />
                                    <span className="text-[12px] sm:text-sm font-bold italic">Your {slotHold.formattedTime || '10:00'} hold will end immediately.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-5 sm:px-6 sm:py-6 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => setShowResetModal(false)}
                            className="flex-1 h-10 sm:h-12 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-gray-900 transition-all duration-300 uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => {
                                setShowResetModal(false);
                                handleReset();
                            }}
                            className="flex-[1.5] h-10 sm:h-12 text-[10px] sm:text-sm font-black bg-red-500 hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/20 uppercase tracking-widest"
                        >
                            START OVER
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ✅ Phase 2: Expiry Notification Modal */}
            <Modal
                isOpen={showExpiryModal}
                onClose={() => setShowExpiryModal(false)}
                showCloseButton={true}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <Clock className="text-amber-600 dark:text-amber-400" size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Expired</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your time slot was released</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-8 flex-1 overflow-y-auto text-center">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                For security and fairness, we can only hold a time slot for 10 minutes. Your previous selection has expired.
                            </p>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 flex items-center justify-center gap-3 mx-auto">
                                <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 leading-tight">
                                    Please pick a new date and time to continue.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => {
                                setShowExpiryModal(false);
                                handleReset();
                            }}
                            className="flex-1 h-10 sm:h-12 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 transition-all duration-300 uppercase tracking-widest"
                        >
                            Reset
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => setShowExpiryModal(false)}
                            className="flex-[1.5] h-10 sm:h-12 text-[10px] sm:text-sm font-black shadow-lg shadow-primary-500/20 uppercase tracking-widest"
                        >
                            PICK NEW TIME
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ✅ OTP Hard Block Modal */}
            <Modal
                isOpen={booking.failedOtpAttempts >= 5}
                onClose={() => {}} // Mandatory action required
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-red-600 dark:text-red-400" size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Security Lock</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Access paused for your safety</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 sm:py-8 flex-1 overflow-y-auto text-center">
                        <div className="space-y-4">
                            <p className="text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                To protect your information, we've paused this session after <span className="text-red-500 font-bold">5 unsuccessful attempts</span>.
                            </p>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 leading-normal">
                                    Don't worry—you can try again in a new session or return home to explore our services.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => navigate('/')}
                            className="flex-1 h-11 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest"
                        >
                            Go Home
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={handleReset}
                            className="flex-[1.5] h-11 text-[10px] sm:text-sm font-black bg-brand-500 hover:bg-brand-600 border-brand-500 shadow-lg shadow-brand-500/20 uppercase tracking-widest"
                        >
                            START FRESH
                        </Button>
                    </div>
                </div>
            </Modal>


            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-8 md:px-12 py-10 md:py-16">
                <div className="min-h-[60vh]">
                    {currentStep === 'service' && (
                        <ServiceStep
                            selectedServiceId={formData.service_id}
                            onSelect={(id, name, tier, duration) => updateFields({ service_id: id, service_name: name, service_tier: tier, service_duration: duration })}
                            onUpdateFields={updateFields}
                            onNext={nextStep}
                            allowSpecialized={false}
                        />
                    )}

                    {currentStep === 'datetime' && (
                        <DateTimeStep
                            formData={formData}
                            serviceId={formData.service_id}
                            selectedDate={formData.date}
                            selectedTime={formData.time}
                            serviceName={formData.service_name}
                            serviceTier={formData.service_tier}
                            sessionId={sessionId}
                            slotHold={slotHold}
                            onUpdate={(fields) => updateFields(fields)}
                            onNext={nextStep}
                            onBack={prevStep}
                            error={error}
                        />
                    )}

                    {currentStep === 'info' && (
                        <InfoStep
                            formData={formData}
                            onUpdate={(field, value) => updateField(field, value)}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}

                            {currentStep === 'review' && (
                                <ConfirmStep
                                    formData={formData}
                                    onSubmit={async () => {
                                        const success = await booking.sendGuestOTP();
                                        if (success) {
                                            toast.success('Verification code sent to your email!');
                                            nextStep();
                                        }
                                    }}
                                    onBack={prevStep}
                                    onEdit={goToStep}
                                    onReset={() => setShowResetModal(true)}
                                    submitting={booking.isVerifying}
                                    error={error}
                                />
                            )}

                            {currentStep === 'verification' && (
                                <OTPStep
                                    email={formData.email}
                                    onVerify={async (code) => {
                                        const res = await booking.verifyGuestOTP(code);
                                        if (res.success) {
                                            await submit(res.token);
                                        }
                                    }}
                                    onResend={async () => {
                                        const success = await booking.sendGuestOTP();
                                        if (success) {
                                            toast.success('A new code has been sent!');
                                        }
                                    }}
                                    isVerifying={submitting || booking.isVerifying}
                                    error={error}
                                    onReset={() => setShowResetModal(true)}
                                    resendCount={booking.otpResendCount}
                                    failedAttempts={booking.failedOtpAttempts}
                                />
                            )}
                </div>
            </main>
        </div>
    );
};

export default GuestBookingWizard;
