import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, AlertCircle } from 'lucide-react';
import UserStepIndicator from '../user-booking/UserStepIndicator';
import DateTimeStep from '../user-booking/DateTimeStep';
import UserRescheduleReviewStep from './UserRescheduleReviewStep';
import UserRescheduleSuccess from './UserRescheduleSuccess';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { useState } from 'react';

const UserRescheduleWizard = ({ reschedule, appointment }) => {
    const navigate = useNavigate();
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

    // Auto-scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const [showExitModal, setShowExitModal] = useState(false);
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
                </div>
            </header>

            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
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
                            disableWaitlist={true} // Hide waitlist for reschedule
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
