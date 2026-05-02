import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import StepIndicator from '../guest-booking/StepIndicator';
import DateTimeStep from '../user-booking/DateTimeStep';
import UserRescheduleReviewStep from './UserRescheduleReviewStep';
import UserRescheduleSuccess from './UserRescheduleSuccess';

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

    const handleExit = () => {
        if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
            reset();
            navigate(`/patient/appointments/${appointment.id}`);
        }
    };

    const breadcrumbLabels = ['Service', 'Date & Time', 'Review'];

    if (result && result.success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                    <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                        <StepIndicator
                            currentStep={step + 1} // success = 4
                            labels={[...breadcrumbLabels, 'Done']}
                            onStepClick={() => {}}
                        />
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
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
                <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <button
                            onClick={handleExit}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white font-bold text-base transition-all px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        >
                            <X size={20} />
                            <span className="hidden sm:inline">Exit</span>
                        </button>
                    </div>

                    <StepIndicator
                        currentStep={step + 1}
                        labels={breadcrumbLabels}
                        onStepClick={(index) => index > 0 && goToStep(index)}
                    />
                </div>
            </header>

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
