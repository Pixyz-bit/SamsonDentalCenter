import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import StepIndicator from '../guest-booking/StepIndicator';
import ServiceStep from '../guest-booking/ServiceStep';
import DateTimeStep from './DateTimeStep';
import UserOtherInfoStep from './UserOtherInfoStep';
import UserReviewStep from './UserReviewStep';
import UserBookingSuccess from './UserBookingSuccess';
import BookingExitModal from './BookingExitModal';
import { useState } from 'react';

const UserBookingWizard = ({ booking }) => {
    const navigate = useNavigate();
    const {
        sessionId,
        step,
        currentStep,
        formData,
        error,
        submitting,
        result,
        book_for_others,
        setBookForOthersMode,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        submit,
        joinWaitlist,
        reset,
        slotHold,
        userWaitlist,
    } = booking;

    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    // ✅ Auto-scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const handleExit = () => {
        setIsExitModalOpen(true);
    };

    const confirmExit = () => {
        reset();
        navigate(-1);
    };

    const breadcrumbLabels = ['Service', 'Date & Time', 'Patient Info', 'Review'];

    if (result && result.success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                    <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                        <StepIndicator
                            currentStep={5} // Success step indicator
                            labels={[...breadcrumbLabels, 'Done']}
                            onStepClick={() => {}}
                        />
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
                    <UserBookingSuccess
                        result={result}
                        onReset={reset}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Sticky Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                    {/* Exit Button - Absolute positioned on the left */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <button
                            onClick={handleExit}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white font-bold text-base transition-all px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        >
                            <X size={20} />
                            <span className="hidden sm:inline">Exit</span>
                        </button>
                    </div>

                    {/* Step Indicator - Truly Centered */}
                    <StepIndicator
                        currentStep={step + 1}
                        labels={breadcrumbLabels}
                        onStepClick={goToStep}
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-6xl mx-auto px-8 md:px-12 py-10 md:py-16 w-full">
                <div className="min-h-[60vh]">
                    {/* Step 1: Service Selection */}
                    {currentStep === 'service' && (
                        <ServiceStep
                            selectedServiceId={formData.service_id}
                            onSelect={(serviceId, serviceName, serviceTier, serviceDuration) =>
                                updateFields({
                                    service_id: serviceId,
                                    service_name: serviceName,
                                    service_tier: serviceTier,
                                    service_duration: serviceDuration,
                                    date: '',
                                    time: '',
                                    waitlist_date: '',
                                    waitlist_time: '',
                                    dentist_id: '',
                                })
                            }
                            onNext={nextStep}
                            allowSpecialized={true}
                        />
                    )}

                    {/* Step 2: Date & Time Selection */}
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
                            joinWaitlist={joinWaitlist}
                            userWaitlist={userWaitlist}
                        />
                    )}

                    {/* Step 3: Patient Information */}
                    {currentStep === 'other_info' && (
                        <UserOtherInfoStep
                            formData={formData}
                            book_for_others={book_for_others}
                            onUpdate={(fields) => updateFields(fields)}
                            setBookForOthersMode={setBookForOthersMode}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}

                    {/* Step 4: Review Details & Submission */}
                    {currentStep === 'review' && (
                        <UserReviewStep
                            formData={formData}
                            book_for_others={book_for_others}
                            onSubmit={submit}
                            onBack={prevStep}
                            onEdit={goToStep}
                            submitting={submitting}
                            error={error}
                        />
                    )}
                </div>
            </main>

            <BookingExitModal
                isOpen={isExitModalOpen}
                onClose={() => setIsExitModalOpen(false)}
                onConfirm={confirmExit}
            />
        </div>
    );
};

export default UserBookingWizard;
