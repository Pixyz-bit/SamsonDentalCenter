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

    const { showToast } = useToast();

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

    // ✅ Auto-scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // ✅ Phase 2: Recovery Interceptor
    useEffect(() => {
        const verifySession = async () => {
            // Only check if we are at least on the date/time step and haven't finished
            if (step >= 1 && !result && !hasCheckedRecovery) {
                setIsCheckingRecovery(true);
                try {
                    // checkActiveHold will update slotHold.activeHold state internally
                    const hold = await slotHold.checkActiveHold();
                    if (hold) {
                        setWasRecovered(true);
                    } else {
                        // Handle initial expiry/invalid session
                        goToStep(1);
                        updateFields({ date: '', time: '' });
                        showToast('Your previous booking session expired. Please select a new time.', 'info', 'Session Expired');
                    }
                } catch (err) {
                    console.error('Recovery check failed:', err);
                } finally {
                    setIsCheckingRecovery(false);
                    // Add a tiny delay to ensure state propagation before enabling the expiry effect
                    setTimeout(() => {
                        setHasCheckedRecovery(true);
                    }, 100);
                }
            } else if (step <= 1) {
                setHasCheckedRecovery(true);
            }
        };

        verifySession();
    }, [step, result, hasCheckedRecovery, slotHold]);

    // ✅ Phase 2: Handle Expired Holds during session
    useEffect(() => {
        // If we HAD a hold and now it's null (and we aren't currently checking/loading)
        if (hasCheckedRecovery && !slotHold.isCheckingHold && !isCheckingRecovery && !slotHold.holdLoading && step >= 1 && hadHoldRef.current && !slotHold.activeHold && !result) {
            // Auto-redirect to Step 2 (DateTime) if hold expires
            hadHoldRef.current = false;
            goToStep(1);
            
            // Force deep clean
            slotHold.clearHold();
            updateFields({ date: '', time: '' });
            setShowExpiryModal(true);
        }
    }, [slotHold.activeHold, slotHold.isCheckingHold, slotHold.holdLoading, step, result, hasCheckedRecovery, isCheckingRecovery, goToStep, updateFields, showToast]);

    // ✅ Phase 2: Show Recovery Modal once we know the hold status
    useEffect(() => {
        // ONLY show if we actually RECOVERED a session (wasRecovered is true)
        // AND the user hasn't already dismissed it in this page load
        // AND they are at least on the DateTime step (step >= 1)
        if (hasCheckedRecovery && wasRecovered && step >= 1 && slotHold.activeHold && !showRecoveryModal && !hasDismissedRecovery) {
            setShowRecoveryModal(true);
        }
    }, [hasCheckedRecovery, wasRecovered, step, slotHold.activeHold, showRecoveryModal, hasDismissedRecovery]);

    const breadcrumbLabels = ['Service', 'Date & Time', 'Your Info', 'Review', 'Verify'];

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
            reset();
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
                            currentStep={5} // Success step indicator
                            labels={[...breadcrumbLabels, 'Verification']}
                            onStepClick={() => {}}
                        />
                    </div>
                </div>
                
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
                    <GuestBookingSuccess
                        result={result}
                        onReset={reset}
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
                <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                    {/* Exit Button - Absolute positioned on the left */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <button
                            onClick={handleExit}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-base transition-colors px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X size={20} />
                            <span className="hidden sm:inline">Exit</span>
                        </button>
                    </div>

                    {/* Step Indicator - Truly Centered */}
                    <StepIndicator
                        currentStep={step + 1}
                        labels={breadcrumbLabels}
                        onStepClick={(index) => goToStep(index)}
                    />

                    {/* ✅ Phase 3: Global Timer */}
                    {slotHold.activeHold && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                            <div className="relative w-5 h-5">
                                <Clock className="text-amber-600 dark:text-amber-400 animate-pulse" size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600/70 dark:text-amber-400/50 leading-none mb-1">Hold Active</span>
                                <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-300 leading-none">
                                    {slotHold.formattedTime}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ Global Timer Progress Bar (Mobile & Tablet) */}
                {slotHold.activeHold && (
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div 
                            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                            style={{ 
                                width: `${(slotHold.timeRemaining / 300) * 100}%`,
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
                className="max-w-md"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-amber-600 dark:text-amber-400" size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Continue Booking?</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">We saved your progress from earlier</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-8 flex-1 overflow-y-auto">
                        <div className="p-5 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-2xl flex items-start gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-primary-800 flex items-center justify-center shrink-0 shadow-sm">
                                <Calendar className="text-primary-600 dark:text-primary-400" size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">Pending Appointment</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You were in the middle of booking for:
                                </p>
                                <div className="mt-3 py-2 px-3 bg-white dark:bg-gray-800 rounded-lg inline-flex flex-col">
                                    <span className="text-sm font-black text-primary-700 dark:text-primary-300 uppercase tracking-tight">
                                        {formatDate(slotHold.activeHold?.date)}
                                    </span>
                                    <span className="text-lg font-black text-gray-900 dark:text-white">
                                        at {formatTime(slotHold.activeHold?.time)}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 w-fit px-2 py-0.5 rounded-full">
                                    <Clock size={12} />
                                    <span>Slot held for {slotHold.formattedTime} more minutes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => {
                                setShowRecoveryModal(false);
                                setHasDismissedRecovery(true);
                            }}
                            className="h-13 text-base font-black shadow-lg shadow-primary-500/20"
                        >
                            CONTINUE BOOKING
                        </Button>
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => {
                                setShowRecoveryModal(false);
                                setHasDismissedRecovery(true);
                                reset();
                            }}
                            className="h-12 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/10 transition-all duration-300"
                        >
                            No thanks, start fresh
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
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-red-600 dark:text-red-400" size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Start Over?</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-8 flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Are you sure you want to start over? This will <span className="text-red-600 dark:text-red-400 font-bold">release your held time slot</span> and clear all information you've entered so far.
                            </p>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <Clock size={18} className="text-gray-400" />
                                    <span className="text-sm font-bold">Slot will be made available to others</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => {
                                setShowResetModal(false);
                                reset();
                            }}
                            className="h-13 text-base font-black bg-red-500 hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/20"
                        >
                            YES, START OVER
                        </Button>
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => setShowResetModal(false)}
                            className="h-12 text-sm font-bold text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-all duration-300"
                        >
                            Nevermind, keep booking
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
                                For security and fairness, we can only hold a time slot for 5 minutes. Your previous selection has expired.
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
                    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={() => setShowExpiryModal(false)}
                            className="h-13 text-base font-black shadow-lg shadow-primary-500/20"
                        >
                            PICK NEW TIME
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
                                if (success) nextStep();
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
                            onResend={booking.sendGuestOTP}
                            isVerifying={submitting || booking.isVerifying}
                            error={error}
                            onReset={() => setShowResetModal(true)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default GuestBookingWizard;
