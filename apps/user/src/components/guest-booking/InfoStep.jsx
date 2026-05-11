import { useState } from 'react';
import { ArrowRight, UserCircle, Contact, Info, ChevronDown, X, Mail, Check, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const InfoStep = ({ formData, onUpdate, onNext, onBack }) => {
    const [errors, setErrors] = useState({});

    // Internal state synced with parent fields for the breakdown
    const [nameParts, setNameParts] = useState({
        first: formData.first_name || '',
        last: formData.last_name || '',
        middle: formData.middle_name || '',
        suffix: formData.suffix_name || ''
    });

    const [showCustomSuffix, setShowCustomSuffix] = useState(
        formData.suffix_name && !['Jr.', 'Sr.', 'II', 'III', 'IV'].includes(formData.suffix_name)
    );

    const commonSuffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateNames = (name) => {
        // Only allow letters, spaces, and hyphens
        return /^[a-zA-Z\s-]*$/.test(name);
    };

    const validate = () => {
        const newErrors = {};

        if (!nameParts.first.trim()) {
            newErrors.first = 'First name is required.';
        } else if (!validateNames(nameParts.first)) {
            newErrors.first = 'Numbers and special characters are not allowed.';
        }

        if (!nameParts.last.trim()) {
            newErrors.last = 'Last name is required.';
        } else if (!validateNames(nameParts.last)) {
            newErrors.last = 'Numbers and special characters are not allowed.';
        }

        if (nameParts.middle && !validateNames(nameParts.middle)) {
            newErrors.middle = 'Invalid characters in middle name.';
        }

        if (!formData.birthday) newErrors.birthday = 'Date of birth is required.';

        if (!formData.email?.trim()) {
            newErrors.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required.';
        } else {
            const sanitizedPhone = formData.phone.replace(/\D/g, '');
            const countryCode = formData.country_code || '+63';
            
            if (countryCode === '+63') {
                if (sanitizedPhone.length !== 10) {
                    newErrors.phone = 'PH numbers must be exactly 10 digits.';
                } else if (!sanitizedPhone.startsWith('9')) {
                    newErrors.phone = 'PH mobile numbers must start with 9.';
                }
            } else if (sanitizedPhone.length < 7) {
                newErrors.phone = 'Phone number is too short.';
            }
        }

        setErrors(newErrors);
        
        // Scroll to first error
        const firstError = Object.keys(newErrors)[0];
        if (firstError) {
            setTimeout(() => {
                const element = document.getElementById(`field-${firstError}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus({ preventScroll: true });
                }
            }, 100);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    const handleFieldChange = (field, value) => {
        // Sanitize name fields in real-time
        if (['first_name', 'last_name', 'middle_name'].includes(field)) {
            if (!validateNames(value)) return;
        }

        // Limit notes
        if (field === 'patient_note' && value.length > 100) return;

        // Phone specific logic: Limit to 10 digits for PH (+63)
        if (field === 'phone') {
            let sanitized = value.replace(/\D/g, '');
            const countryCode = formData.country_code || '+63';
            
            // Strictly enforce PH mobile format: starts with 9 and max 10 digits
            if (countryCode === '+63') {
                if (sanitized.length > 0 && sanitized[0] !== '9') {
                    // If they type 09..., strip the 0
                    if (sanitized[0] === '0') {
                        sanitized = sanitized.substring(1);
                    } else {
                        return; // Ignore other starts
                    }
                }
                if (sanitized.length > 10) return;
            }
            onUpdate(field, sanitized);
        } else {
            onUpdate(field, value);
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleNamePartChange = (part, value) => {
        if (!validateNames(value)) return;

        const updated = { ...nameParts, [part]: value };
        setNameParts(updated);
        onUpdate(part + '_name', value);

        if (errors[part]) {
            setErrors(prev => ({ ...prev, [part]: undefined }));
        }
    };

    const getInputClasses = (fieldError) => {
        const base = "h-11 w-full rounded-xl border appearance-none px-4 py-2.5 text-[13px] sm:text-sm shadow-theme-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-4 transition-all bg-white dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-medium";
        if (fieldError) {
            return `${base} border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
        }
        return `${base} text-gray-800 border-gray-300 dark:border-gray-700 focus:border-brand-300 focus:ring-brand-500/15 hover:border-gray-400 dark:hover:border-gray-600 dark:text-white/90 dark:focus:border-brand-800 shadow-theme-xs hover:shadow-theme-sm`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const [hours, minutes] = timeString.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const formattedHour = h % 12 || 12;
            return `${formattedHour}:${minutes} ${ampm}`;
        } catch (e) {
            return timeString;
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

    const labelClasses = "mb-1.5 block text-[11px] sm:text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest opacity-80 leading-none";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-6 sm:pb-4">
            {/* Header Section */}
            <div className='mb-6 sm:mb-8'>
                <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Patient Details
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Enter your details below to receive your appointment confirmation and status updates.
                </p>
            </div>



            {/* Premium Card - Full-width stretched container */}
            <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-theme-sm overflow-hidden'>

                {/* Section: Personal Details */}
                <section>
                    {/* Header with icon and title */}
                    <div className="px-5 pt-7 pb-4 sm:px-10 flex items-center gap-3">
                        <UserCircle size={18} className="text-brand-500" />
                        <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-widest">Personal Details</h3>
                    </div>

                    <div className="px-5 pb-6 sm:px-10 sm:pb-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Last Name */}
                            <div>
                                <label className={labelClasses}>Last Name <span className='text-brand-500'>*</span></label>
                                <input
                                    id="field-last"
                                    type='text'
                                    value={nameParts.last}
                                    onChange={(e) => handleNamePartChange('last', e.target.value)}
                                    placeholder='Dela Cruz'
                                    className={getInputClasses(errors.last)}
                                />
                                {errors.last && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.last}</p>}
                            </div>

                            {/* First Name */}
                            <div>
                                <label className={labelClasses}>First Name <span className='text-brand-500'>*</span></label>
                                <input
                                    id="field-first"
                                    type='text'
                                    value={nameParts.first}
                                    onChange={(e) => handleNamePartChange('first', e.target.value)}
                                    placeholder='Juan'
                                    className={getInputClasses(errors.first)}
                                />
                                {errors.first && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.first}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className={labelClasses}>Date of Birth <span className='text-brand-500'>*</span></label>
                                <input
                                    id="field-birthday"
                                    type='date'
                                    value={formData.birthday || ''}
                                    onChange={(e) => handleFieldChange('birthday', e.target.value)}
                                    className={getInputClasses(errors.birthday)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.birthday && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.birthday}</p>}
                            </div>

                            {/* Middle Name */}
                            <div>
                                <label className={labelClasses}>Middle Name <span className="opacity-40 font-normal italic">(optional)</span></label>
                                <input
                                    type='text'
                                    value={nameParts.middle}
                                    onChange={(e) => handleNamePartChange('middle', e.target.value)}
                                    placeholder='Santos'
                                    className={getInputClasses(errors.middle)}
                                />
                                {errors.middle && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.middle}</p>}
                            </div>

                            {/* Suffix */}                            <div>
                                <label className={labelClasses}>Suffix <span className="opacity-40 font-normal italic">(optional)</span></label>
                                {!showCustomSuffix ? (
                                    <div className="relative group/suffix">
                                        <select
                                            value={commonSuffixes.includes(nameParts.suffix) ? nameParts.suffix : ''}
                                            onChange={(e) => {
                                                if (e.target.value === 'Other') {
                                                    setShowCustomSuffix(true);
                                                    handleNamePartChange('suffix', '');
                                                } else {
                                                    handleNamePartChange('suffix', e.target.value);
                                                }
                                            }}
                                            className={`${getInputClasses()} cursor-pointer pr-10`}
                                        >
                                            <option value="">None</option>
                                            <option value="Jr.">Jr.</option>
                                            <option value="Sr.">Sr.</option>
                                            <option value="II">II</option>
                                            <option value="III">III</option>
                                            <option value="IV">IV</option>
                                            <option value="Other">Other...</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/suffix:text-brand-500 transition-colors">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative animate-in slide-in-from-left-2 duration-300">
                                        <input
                                            type='text'
                                            value={nameParts.suffix}
                                            onChange={(e) => handleNamePartChange('suffix', e.target.value)}
                                            placeholder='e.g. PhD, Ret.'
                                            autoFocus
                                            className={getInputClasses()}
                                        />
                                        <button
                                            onClick={() => { setShowCustomSuffix(false); handleNamePartChange('suffix', ''); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[10px] font-black text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors uppercase tracking-tight"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                )}
                            </div>v>
                        </div>
                    </div>
                </section>

                {/* Section: Contact Information */}
                <section className="border-t border-gray-100 dark:border-gray-800/50">
                    {/* Header with icon and title */}
                    <div className="px-5 pt-7 pb-4 sm:px-10 flex items-center gap-3">
                        <Contact size={18} className="text-brand-500" />
                        <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-widest">Contact Information</h3>
                    </div>

                    <div className="px-5 pb-6 sm:px-10 sm:pb-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Email Address */}
                            <div>
                                <label className={labelClasses}>Email address <span className='text-brand-500'>*</span></label>
                                <div className="relative">
                                    <input
                                        id="field-email"
                                        type='email'
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                        placeholder='juan@email.com'
                                        className={`${getInputClasses(errors.email)} ${formData.email ? (isValidEmail(formData.email) ? 'pr-10' : 'pr-10') : ''}`}
                                    />
                                    {formData.email && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                            {isValidEmail(formData.email) ? (
                                                <CheckCircle2 size={16} className="text-green-500 animate-in zoom-in duration-300" />
                                            ) : (
                                                <AlertCircle size={16} className="text-amber-500 animate-in zoom-in duration-300" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.email && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.email}</p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className={labelClasses}>Phone Number <span className='text-brand-500'>*</span></label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.country_code || '+63'}
                                        onChange={(e) => handleFieldChange('country_code', e.target.value)}
                                        className="h-10 w-24 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 px-2 text-[12px] font-bold focus:ring-3 focus:ring-brand-500/20 focus:border-brand-300 outline-hidden"
                                    >
                                        <option value="+63">PH (+63)</option>
                                        <option value="+1">US (+1)</option>
                                        <option value="+61">AU (+61)</option>
                                        <option value="+44">UK (+44)</option>
                                    </select>
                                    <input
                                        id="field-phone"
                                        type='tel'
                                        value={formData.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        placeholder={
                                            (formData.country_code || '+63') === '+63' ? '9171234567' :
                                                formData.country_code === '+1' ? '2025550123' :
                                                    formData.country_code === '+61' ? '0412345678' :
                                                        formData.country_code === '+44' ? '07700900123' : 'Phone number'
                                        }
                                        className={getInputClasses(errors.phone)}
                                    />
                                </div>
                                {errors.phone && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Section: Additional Notes */}
                        <div className="pt-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className={labelClasses}>Note for the clinic <span className="opacity-40 font-normal italic">(optional)</span></label>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${formData.patient_note?.length >= 100 ? 'text-error-500' : 'text-gray-400'}`}>
                                    {formData.patient_note?.length || 0} / 100
                                </span>
                            </div>
                            <textarea
                                value={formData.patient_note || ''}
                                onChange={(e) => handleFieldChange('patient_note', e.target.value)}
                                placeholder="Any special requests?"
                                maxLength={100}
                                className={`${getInputClasses()} min-h-[80px] py-2 resize-none`}
                            />
                        </div>
                        {/* Verification Email Highlight Banner */}
                        <div className='mt-6 bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 rounded-2xl p-5 sm:p-6 animate-in slide-in-from-bottom-4 duration-500'>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                                        <Mail size={20} />
                                    </div>
                                    <h4 className="text-[13px] sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                        Verify Your Email
                                    </h4>
                                </div>
                                <div className='text-[12px] sm:text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium'>
                                    <p>This email is our <strong className="text-brand-600 dark:text-brand-400">only way</strong> to send your confirmation and status updates.</p>
                                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                        Please double-check
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-black break-all transition-all ${formData.email ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20' : 'text-gray-400 italic'}`}>
                                            {formData.email || 'your email'}
                                        </span>
                                        before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Terms Checkbox - Now outside the fixed container to avoid crowding on mobile */}
                <div className='mx-5 sm:mx-10 mb-6 flex items-start gap-3 p-4 sm:p-5 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100/80 dark:border-gray-800/50 mt-3 sm:mt-4 animate-in slide-in-from-bottom-4 duration-700'>
                    <div className="pt-0.5">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={formData.agreed_to_terms || false}
                            onChange={(e) => onUpdate('agreed_to_terms', e.target.checked)}
                            className="w-4 h-4 sm:w-6 sm:h-6 rounded-lg border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer transition-all"
                        />
                    </div>
                    <label htmlFor="terms" className="text-[11px] sm:text-[14px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed cursor-pointer select-none">
                        I agree to the <a href="/terms-of-service" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Terms of Service</a> and <a href="/privacy-policy" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Privacy Policy</a>.
                        <span className="block mt-1 text-[10px] sm:text-[12px] opacity-60 font-normal italic leading-snug">
                            I understand my data will be handled securely per clinic policy.
                        </span>
                    </label>
                </div>
            </div>

            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-8 sm:pt-4 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex flex-col gap-4'>

                    <div className='flex items-center gap-2 w-full sm:justify-between'>
                        <button
                            onClick={onBack}
                            className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[9px] sm:text-sm px-2 py-3.5 sm:px-8 transition-colors uppercase tracking-widest bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs'
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!formData.agreed_to_terms}
                            className={`flex-1 sm:flex-none sm:min-w-[240px] font-black px-2 py-3.5 sm:px-10 sm:py-4 rounded-2xl transition-all shadow-theme-md flex items-center justify-center gap-1 sm:gap-2.5 text-[9px] sm:text-base uppercase tracking-widest ${formData.agreed_to_terms
                                ? 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed grayscale opacity-50'
                                }`}
                        >
                            Continue to Review
                            <ArrowRight size={16} className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoStep;
