import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Clock, 
    User, 
    Mail, 
    Phone, 
    Stethoscope, 
    ShieldCheck, 
    AlertCircle, 
    RefreshCw,
    Edit2,
    MessageSquare,
    CheckCircle2,
    Users,
    Loader2,
    ClipboardList,
    CalendarDays,
    UserCircle,
    Contact,
    StickyNote,
    Info,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const UserReviewStep = ({ 
    formData, 
    book_for_others, 
    onSubmit, 
    onUpdate, 
    onBack, 
    onEdit, 
    onValidate, 
    isVerifying,
    submitting, 
    error 
}) => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [isRetrying, setIsRetrying] = useState(false);
    const [isEntryLocked, setIsEntryLocked] = useState(true);

    // ✅ Phase 1: Robust Auto-scroll to top on error
    useEffect(() => {
        if (error) {
            window.scrollTo({ top: 0, behavior: 'auto' });
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
    }, [error]);

    // Click Protection
    useEffect(() => {
        const timer = setTimeout(() => setIsEntryLocked(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // handleFinalSubmit: Sequential validation then submission
    const handleFinalSubmit = async () => {
        // Only block if we are actually in the middle of a request
        if (submitting || isVerifying || isEntryLocked) return;

        // Clear any previous error before starting a new check
        onUpdate({});

        // 1. Run pre-flight validation
        const validation = await onValidate();
        
        // 2. Only proceed to submit if validation passed
        if (validation && validation.success) {
            toast.info('Processing your appointment request...');
            await onSubmit();
            toast.success('Appointment requested successfully!');
        } else if (validation && validation.error) {
            toast.error(validation.error);
        }
    };

    // Parse errors for specialized feedback
    const getErrorDetails = () => {
        if (!error) return null;
        
        const isSelf = !formData.booked_for_relationship || formData.booked_for_relationship === 'Self';
        const pName = formData.booked_for_first_name || 'The patient';
        const serviceName = formData.service_name || 'this service';

        // Check for Quota Limit (Backend: "This individual already has 3 active appointments.")
        if (error.includes('already has 3 active appointments') || error.includes('limit of 3 active appointments')) {
            return {
                headline: 'Booking Limit Reached',
                message: isSelf 
                    ? "You've reached the maximum of 3 active appointments allowed per patient."
                    : `${pName} already has 3 active appointments scheduled.`,
                solution: "To book a new visit, please complete or cancel one of your existing appointments first.",
                action: { label: 'View Appointments', onClick: () => navigate('/') }
            };
        }

        if (error.includes('Conflict:')) {
            const existingServiceMatch = error.match(/has a \[(.*?)\]/);
            const existingService = existingServiceMatch ? existingServiceMatch[1] : 'another service';
            
            return {
                headline: 'Time Slot Unavailable',
                message: isSelf
                    ? `You are already scheduled for ${existingService} at this time.`
                    : `${pName} is already booked for ${existingService} during this slot.`,
                solution: "Our system prevents overlapping appointments for the same patient. Please select a different time.",
                action: { label: 'Change Time', onClick: () => onEdit(1) }
            };
        }

        if (error.includes('already booked for this service')) {
            return {
                headline: 'Duplicate Service',
                message: isSelf
                    ? `You already have a ${serviceName} scheduled for this day.`
                    : `${pName} is already scheduled for a ${serviceName} on this date.`,
                solution: "Most treatments are limited to once per day. Please choose a different service or date.",
                action: { label: 'Change Service', onClick: () => onEdit(0) }
            };
        }

        if (error.includes('limit of 10 family members')) {
            return {
                headline: 'Family Profile Limit',
                message: "Your account has reached the maximum capacity of 10 linked family members.",
                solution: "To add a new member, please manage your inactive profiles in settings or contact our support team.",
                action: { label: 'Manage Family', onClick: () => navigate('/') }
            };
        }

        return {
            headline: 'Scheduling Alert',
            message: error,
            action: null
        };
    };

    const errorDetails = getErrorDetails();

    const formatDate = (dateString) => {
        if (!dateString) return 'Not selected';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) { return dateString; }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not selected';
        try {
            const [hours, minutes] = timeString.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const formattedHour = h % 12 || 12;
            const formattedMinute = m < 10 ? `0${m}` : m;
            return `${formattedHour}:${formattedMinute} ${ampm}`;
        } catch (e) { return timeString; }
    };

    const formatTimeRange = (startTime, durationMinutes) => {
        if (!startTime) return 'Not selected';
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

    const handleRetry = async () => {
        setIsRetrying(true);
        try { await onSubmit(); } finally { setIsRetrying(false); }
    };

    const ReviewSection = ({ title, children, onEditClick, icon: Icon }) => (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden mb-6">
            <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 bg-gray-50/30 dark:bg-transparent">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={18} className="text-brand-500" />}
                    <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        {title}
                    </h3>
                </div>
                <button
                    onClick={onEditClick}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 bg-white dark:bg-gray-800 px-3 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.03] transition-all shadow-theme-xs active:scale-95 shrink-0"
                >
                    <Edit2 size={11} className="text-gray-400 sm:w-3.5 sm:h-3.5" />
                    Edit
                </button>
            </div>
            <div className="px-5 py-6 sm:px-10 sm:py-8">
                {children}
            </div>
        </div>
    );

    const getPatientName = () => {
        if (formData.booked_for_first_name) {
            return `${formData.booked_for_last_name}, ${formData.booked_for_first_name} ${formData.booked_for_middle_name || ''} ${formData.booked_for_suffix_name || ''}`.replace(/\s+/g, ' ').trim();
        }
        return user?.first_name ? `${user.last_name}, ${user.first_name}` : user?.full_name || 'Patient';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-[60px] sm:pb-6">
            <div className='mb-8 sm:mb-10'>
                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Review Your Appointment Details
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Please double-check your appointment schedule and information before submitting your request for approval.
                </p>
            </div>

            {errorDetails && (
                <div className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-3xl mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden'>
                    <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-[14px] sm:text-lg font-bold text-red-600 dark:text-red-400">
                                {errorDetails.headline}
                            </h3>
                        </div>
                    </div>
                    
                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className="space-y-6">
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0 shadow-sm" />
                                    <p className="text-[13px] sm:text-[15px] text-gray-900 dark:text-white font-bold leading-snug">
                                        {errorDetails.message}
                                    </p>
                                </li>
                                {errorDetails.solution && (
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 opacity-40" />
                                        <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                            {errorDetails.solution}
                                        </p>
                                    </li>
                                )}
                            </ul>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleFinalSubmit}
                                    className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white dark:bg-red-900/10 px-4 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 shrink-0"
                                >
                                    <RefreshCw size={14} className={(isVerifying || submitting) ? 'animate-spin' : ''} />
                                    Retry
                                </button>
                                
                                {errorDetails.action && (
                                    <button
                                        type="button"
                                        onClick={errorDetails.action.onClick}
                                        className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-[10px] sm:text-sm font-bold transition-all shadow-theme-md active:scale-95 shrink-0"
                                    >
                                        {errorDetails.action.label}
                                        <ArrowRight size={14} className="opacity-80" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='w-full space-y-4 sm:space-y-6'>
                {/* 1. Service Selection */}
                <ReviewSection title="Service Selection" icon={ClipboardList} onEditClick={() => onEdit(0)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Selected Treatment
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                {formData.service_name || 'No service selected'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Duration
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.service_duration ? `${formData.service_duration} mins` : '-'}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 2. Date & Time */}
                <ReviewSection title="Schedule Details" icon={CalendarDays} onEditClick={() => onEdit(1)}>
                    <div className="grid grid-cols-1 gap-6 sm:gap-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-7">
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                    Appointment Date
                                </p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                    {formatDate(formData.date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                    Timeslot
                                </p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                    {formatTimeRange(formData.time, formData.service_duration)}
                                </p>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-50 dark:border-gray-800/50">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1.5 leading-none">
                                Selected Dentist
                            </p>
                            <div className="text-[14px] sm:text-base font-bold">
                                {!formData.dentist_id ? (
                                    <span className="text-gray-400 dark:text-gray-500 italic font-medium">
                                        Any Available Dentist
                                    </span>
                                ) : (
                                    <span className="text-brand-600 dark:text-brand-400">
                                        {formData.dentist_name || 'Selected Specialist'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </ReviewSection>

                {/* 3. Patient Details (Unified with Guest) */}
                <ReviewSection title="Patient Details" icon={UserCircle} onEditClick={() => onEdit(2)}>
                    <div className="space-y-4 sm:space-y-6">
                        {/* Names */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 sm:gap-12">
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Last Name</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white truncate">
                                    {formData.booked_for_last_name || user?.last_name || '—'}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">First Name</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white truncate">
                                    {formData.booked_for_first_name || user?.first_name || '—'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 sm:gap-12">
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Middle Name</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white truncate">
                                    {formData.booked_for_middle_name || user?.middle_name || '—'}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Suffix</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white truncate">
                                    {formData.booked_for_suffix_name || user?.suffix || '—'}
                                </p>
                            </div>
                        </div>

                        {/* DOB & Sex */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 sm:gap-12 pt-4 border-t border-gray-50 dark:border-gray-800/50 mt-2 sm:mt-0">
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Date of Birth</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                    {formData.booked_for_birthday ? formatDate(formData.booked_for_birthday) : (user?.date_of_birth ? formatDate(user.date_of_birth) : '—')}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Sex</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                    {(formData.booked_for_sex === 'M' || user?.sex === 'M') ? 'Male' : (formData.booked_for_sex === 'F' || user?.sex === 'F') ? 'Female' : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Relationship (ONLY if not Self) */}
                        {formData.booked_for_relationship && formData.booked_for_relationship !== 'Self' && (
                            <div className="pt-4 border-t border-gray-50 dark:border-gray-800/50 mt-2">
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Relationship to Account Holder</p>
                                <p className="text-[14px] sm:text-base font-bold text-brand-600 dark:text-brand-400">
                                    {formData.booked_for_relationship}
                                </p>
                            </div>
                        )}
                    </div>
                </ReviewSection>

                {/* 4. Contact Details */}
                <ReviewSection title="Contact Details" icon={Contact} onEditClick={() => onEdit(2)}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Account Email
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white break-all leading-tight">
                                {user?.email}
                            </p>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                                Phone Number
                            </p>
                            <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white">
                                {formData.booked_for_phone || user?.phone || '—'}
                            </p>
                        </div>
                    </div>
                </ReviewSection>

                {/* 5. Additional Notes */}
                <ReviewSection title="Additional Notes" icon={StickyNote} onEditClick={() => onEdit(2)}>
                    <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">
                            Note for the Clinic
                        </p>
                        <p className={`text-[14px] sm:text-base font-bold leading-relaxed break-words whitespace-pre-wrap ${formData.patient_note ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 italic font-medium'}`}>
                            {formData.patient_note || 'No additional notes provided'}
                        </p>
                    </div>
                </ReviewSection>

                {/* 6. Agreement & Privacy (1:1 with Guest) */}
                <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden mb-6'>
                    <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                        <CheckCircle2 size={18} className="text-brand-500" />
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">Agreement & Privacy</h3>
                    </div>

                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className='flex items-start gap-4'>
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    id="terms-review"
                                    checked={formData.agreed_to_terms || false}
                                    onChange={(e) => onUpdate({ agreed_to_terms: e.target.checked })}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer transition-all"
                                />
                            </div>
                            <label htmlFor="terms-review" className="text-[12px] sm:text-[14px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed cursor-pointer select-none">
                                I agree to the <a href="/terms-of-service" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Terms of Service</a> and <a href="/privacy-policy" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Privacy Policy</a>.
                                <span className="block mt-1.5 text-[10px] sm:text-[12px] text-gray-500 dark:text-gray-500 font-normal italic leading-snug">
                                    I understand my data will be handled securely per clinic policy.
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-10 sm:pt-6 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center gap-3 w-full sm:justify-between'>
                    <button 
                        onClick={onBack} 
                        disabled={submitting || isVerifying} 
                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[11px] sm:text-sm px-4 py-3.5 sm:px-8 transition-colors bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs disabled:opacity-30'
                    >
                        Back
                    </button>
                    <button 
                        type="button"
                        onClick={handleFinalSubmit} 
                        disabled={submitting || isVerifying || isEntryLocked} 
                        className='flex-[2] sm:flex-none sm:min-w-[240px] group bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black px-6 py-3.5 sm:px-10 sm:py-4.5 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-base'
                    >
                        { (submitting || isVerifying) ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>{isVerifying ? 'Verifying Eligibility...' : 'Confirming...'}</span>
                            </>
                        ) : (
                            <>
                                <span>Confirm Appointment</span>
                                <ShieldCheck size={14} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform hidden sm:block" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserReviewStep;
