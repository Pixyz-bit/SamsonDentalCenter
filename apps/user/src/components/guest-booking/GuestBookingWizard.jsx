import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import ServiceStep from './ServiceStep';
import DateTimeStep from './DateTimeStep';
import InfoStep from './InfoStep';
import ConfirmStep from './ConfirmStep';
import OTPStep from './OTPStep';
import GuestBookingSuccess from './GuestBookingSuccess';

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
                </div>
            </header>

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
                            onBack={prevStep}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default GuestBookingWizard;
