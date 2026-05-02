import { useEffect } from 'react';
import { X, AlertTriangle, RefreshCcw, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../guest-booking/StepIndicator';
import DateTimeStep from '../guest-booking/DateTimeStep';
import RescheduleReviewStep from './RescheduleReviewStep';
import RescheduleSuccess from './RescheduleSuccess';

/**
 * Reschedule Wizard for Guest Appointments.
 * Follows the 3-step premium flow:
 * 1. Date & Time
 * 2. Review
 * 3. Success
 */
const RescheduleWizard = ({ reschedule }) => {
    const navigate = useNavigate();
    const {
        loading,
        currentAppt,
        step,
        currentStep,
        formData,
        submitting,
        error,
        result,
        slotHold,
        token,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        submit,
    } = reschedule;

    // ✅ Auto-scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const breadcrumbLabels = ['Service', 'Date & Time', 'Review'];

    const handleExit = () => {
        if (window.confirm('Discard rescheduling changes and return home?')) {
            navigate('/');
        }
    };

    // ── LOADING STATE ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Initializing Reschedule Wizard...</p>
            </div>
        );
    }

    // ── ERROR STATE (Token Invalid/Expired) ──
    if (error && !currentAppt) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-theme-lg text-center border border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">Link Invalid</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                        {error || "This rescheduling link is no longer valid or has expired."}
                    </p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full py-4 bg-gray-900 dark:bg-brand-500 text-white rounded-2xl font-bold hover:opacity-90 transition-all uppercase tracking-widest text-sm"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    // ── SUCCESS STATE ──
    if (result) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                    <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center">
                        <StepIndicator
                            currentStep={4}
                            labels={[...breadcrumbLabels, 'Confirmed']}
                            onStepClick={() => {}}
                        />
                    </div>
                </header>
                <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
                    <RescheduleSuccess result={result} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-center relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <button
                            onClick={handleExit}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-base transition-colors px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X size={20} />
                            <span className="hidden sm:inline">Cancel</span>
                        </button>
                    </div>

                    <StepIndicator
                        currentStep={step + 2}
                        labels={breadcrumbLabels}
                        onStepClick={(index) => index > 0 && goToStep(index - 1)}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-8 md:px-12 py-10 md:py-16">
                <div className="min-h-[60vh]">
                    {currentStep === 'datetime' && (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-8 items-start">
                            {/* ── LEFT: Current Appointment Details ── */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-theme-sm sticky top-28">
                                <span className="inline-block px-4 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">Original Slot</span>
                                
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Calendar size={14} className="text-brand-500" /> Date
                                        </p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            {currentAppt.date ? new Date(currentAppt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', weekday: 'short' }) : '---'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Clock size={14} className="text-brand-500" /> Time
                                        </p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            {currentAppt.time ? (
                                                (() => {
                                                    const [h, m] = currentAppt.time.split(':');
                                                    const hours = parseInt(h, 10);
                                                    return `${hours % 12 || 12}:${m} ${hours >= 12 ? 'PM' : 'AM'}`;
                                                })()
                                            ) : '---'}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 dark:border-gray-900">
                                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Stethoscope size={14} /> Service
                                        </p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white uppercase">
                                            {currentAppt.service}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <User size={14} /> Patient
                                        </p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">
                                            {currentAppt.guest_name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT: New Date & Time Selection ── */}
                            <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-[40px] p-8 sm:p-12 shadow-theme-lg">
                                <DateTimeStep
                                    serviceId={formData.service_id || currentAppt.service_id}
                                    selectedDate={formData.date}
                                    selectedTime={formData.time}
                                    serviceName={formData.service_name || currentAppt.service}
                                    sessionId={token}
                                    slotHold={slotHold}
                                    excludeAppointmentId={currentAppt.id}
                                    onUpdate={updateFields}
                                    onNext={nextStep}
                                    onBack={() => navigate('/')}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 'review' && (
                        <RescheduleReviewStep
                            currentAppt={currentAppt}
                            newData={formData}
                            onBack={prevStep}
                            onSubmit={submit}
                            submitting={submitting}
                            error={error}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default RescheduleWizard;
