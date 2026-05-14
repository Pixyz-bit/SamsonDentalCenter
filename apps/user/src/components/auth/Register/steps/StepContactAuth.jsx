import React from 'react';
import { Lock, ChevronRight, ChevronLeft, ShieldCheck, Mail, AlertCircle, Contact, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

const StepContactAuth = ({ data, errors, updateField, onNext, onBack, loading, serverError }) => {
    const labelClasses = "mb-2 block text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none";

    const getInputClasses = (fieldError) => {
        const base = "h-11 w-full rounded-xl border appearance-none px-4 py-2.5 text-[13px] sm:text-sm shadow-theme-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-4 transition-all bg-white dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-medium";
        if (fieldError) {
            return `${base} border-red-500 focus:border-red-300 focus:ring-red-500/20 dark:text-red-400 dark:border-red-500 dark:focus:border-red-800`;
        }
        return `${base} text-gray-800 border-gray-300 dark:border-gray-700 focus:border-brand-500/50 focus:ring-brand-500/15 hover:border-gray-400 dark:hover:border-gray-600 shadow-theme-xs hover:shadow-theme-sm`;
    };

    const handlePhoneChange = (value) => {
        let digits = value.replace(/\D/g, '');
        
        if (digits.length === 0) {
            updateField('phone', '');
            return;
        }

        // Auto-prefix 09
        if (digits.length === 1) {
            digits = (digits === '0' || digits === '9') ? '09' : '09' + digits;
        } else if (digits.length >= 2 && !digits.startsWith('09')) {
            digits = digits.startsWith('9') ? '0' + digits : '09' + digits;
        }

        // Limit to 11 digits
        digits = digits.substring(0, 11);

        // Apply formatting: 09X XXXX XXXX (Matching Guest Booking)
        let formatted = digits;
        if (digits.length > 7) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
        } else if (digits.length > 3) {
            formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }

        updateField('phone', formatted);
    };

    const hasValidationErrors = Object.keys(errors).length > 0;
    const hasError = hasValidationErrors || serverError;

    return (
        <div className='animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8 sm:pb-0'>
            {/* Page Title Section */}
            <div className='text-left mb-6 sm:mb-10'>
                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Contact & Security
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Provide your contact info and create a strong password to protect your account.
                </p>
            </div>

            {/* Error Banner */}
            {hasError && (
                <div 
                    className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden'
                >
                    <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-[15px] sm:text-lg font-bold text-red-600 dark:text-red-400">
                                {serverError ? 'Registration Failed' : 'Incomplete Information'}
                            </h3>
                        </div>
                    </div>
                    
                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0 shadow-sm" />
                            <p className="text-[13px] sm:text-[15px] text-gray-900 dark:text-white font-bold leading-snug">
                                {serverError ? serverError : 'Please review the fields marked in red before continuing.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Banner */}
            {loading && (
                <div className='bg-brand-50/50 dark:bg-brand-950/10 border border-brand-200 dark:border-brand-900/30 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 animate-in fade-in duration-500 shadow-theme-md overflow-hidden text-left'>
                    <div className="px-5 py-6 sm:px-10 sm:py-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 shadow-sm">
                            <div className="w-5 h-5 border-[3px] border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-[15px] sm:text-lg font-bold text-brand-600 dark:text-brand-400">
                                Initiating Verification
                            </h3>
                            <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-0.5">
                                Please wait while we prepare your registration and send your security code.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 1: Contact Details */}
            <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md mb-6 sm:mb-8 overflow-hidden'>
                <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                    <Contact size={20} className="text-brand-500" />
                    <h3 className="text-[15px] sm:text-lg font-bold text-gray-900 dark:text-white">Contact Details</h3>
                </div>

                <div className="px-5 py-6 sm:px-10 sm:py-8 space-y-4 sm:space-y-8">
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6'>
                        <div>
                            <label className={labelClasses}>Email Address <span className='text-brand-500'>*</span></label>
                            <input
                                type='email'
                                value={data.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className={getInputClasses(errors.email)}
                                placeholder='juan@email.com'
                            />
                            {errors.email && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.email}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>Phone Number <span className='text-brand-500'>*</span></label>
                            <div className="relative">
                                <input
                                    type='tel'
                                    value={data.phone}
                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                    className={cn(getInputClasses(errors.phone), 'pr-20')}
                                    placeholder='09XX XXXX XXXX'
                                    maxLength={13}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <span className="text-[10px] font-black text-gray-400">PH (+63)</span>
                                </div>
                            </div>
                            {errors.phone && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.phone}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Credentials */}
            <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md mb-6 sm:mb-8 overflow-hidden'>
                <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                    <ShieldCheck size={20} className="text-brand-500" />
                    <h3 className="text-[15px] sm:text-lg font-bold text-gray-900 dark:text-white">Credentials</h3>
                </div>

                <div className="px-5 py-6 sm:px-10 sm:py-8 space-y-4 sm:space-y-8">
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6'>
                        <div>
                            <label className={labelClasses}>Create Password <span className='text-brand-500'>*</span></label>
                            <div className="relative">
                                <input
                                    type='password'
                                    value={data.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    className={cn(getInputClasses(errors.password), 'pl-11')}
                                    placeholder='••••••••'
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                            </div>
                            {errors.password && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.password}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Confirm Password <span className='text-brand-500'>*</span></label>
                            <div className="relative">
                                <input
                                    type='password'
                                    value={data.confirmPassword}
                                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                                    className={cn(getInputClasses(errors.confirmPassword), 'pl-11')}
                                    placeholder='••••••••'
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={18} />
                                </div>
                            </div>
                            {errors.confirmPassword && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.confirmPassword}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Agreement & Privacy */}
            <div className={cn(
                'w-full bg-white dark:bg-white/[0.03] border rounded-2xl sm:rounded-3xl shadow-theme-md mb-6 sm:mb-8 overflow-hidden transition-all',
                errors.terms 
                    ? 'border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-900/5' 
                    : 'border-gray-200 dark:border-gray-800'
            )}>
                <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                    <CheckCircle2 size={18} className="text-brand-500" />
                    <h3 className="text-[15px] sm:text-lg font-bold text-gray-900 dark:text-white">Agreement & Privacy</h3>
                </div>

                <div className="px-5 py-6 sm:px-10 sm:py-8">
                    <div className='flex items-start gap-4'>
                        <div className="pt-0.5">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={data.agreed_to_terms || false}
                                onChange={(e) => updateField('agreed_to_terms', e.target.checked)}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer transition-all accent-brand-500"
                            />
                        </div>
                        <label htmlFor="terms" className="text-[12px] sm:text-[14px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed cursor-pointer select-none">
                            I agree to the <a href="/terms-of-service" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Terms of Service</a> and <a href="/privacy-policy" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Privacy Policy</a>.
                            <span className="block mt-1.5 text-[10px] sm:text-[12px] text-gray-500 dark:text-gray-500 font-normal italic leading-snug">
                                I understand my data will be handled securely per clinic policy.
                            </span>
                        </label>
                    </div>
                    {errors.terms && <p className='text-red-500 text-[10px] font-bold mt-4 ml-10'>{errors.terms}</p>}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-8 sm:pt-4 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center justify-between gap-4'>
                    <button
                        type="button"
                        onClick={onBack}
                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[11px] sm:text-sm px-2 py-3.5 sm:px-8 transition-colors bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl flex items-center justify-center gap-1.5'
                    >
                        <ChevronLeft size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                        Back to Identity
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={loading || !data.agreed_to_terms}
                        className={cn(
                            'flex-1 sm:flex-none sm:min-w-[240px] font-black px-2 py-3.5 sm:px-10 sm:py-4 rounded-2xl transition-all shadow-theme-md flex items-center justify-center gap-1 sm:gap-2.5 text-[11px] sm:text-base',
                            (loading || !data.agreed_to_terms)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' 
                                : 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white'
                        )}
                    >
                        {loading ? 'Processing...' : 'Continue to Verify'}
                        {!loading && <ChevronRight size={16} className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={3} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepContactAuth;
