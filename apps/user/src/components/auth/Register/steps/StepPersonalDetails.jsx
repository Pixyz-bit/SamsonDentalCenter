import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, ChevronRight, Mars, Venus, UserCircle, ChevronDown, Contact, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

const StepPersonalDetails = ({ data, errors, updateField, onNext }) => {
    const navigate = useNavigate();
    const bannerRef = useRef(null);
    const labelClasses = "mb-2 block text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none";

    const getInputClasses = (fieldError) => {
        const base = "h-11 w-full rounded-xl border appearance-none px-4 py-2.5 text-[13px] sm:text-sm shadow-theme-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-4 transition-all bg-white dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-medium";
        if (fieldError) {
            return `${base} border-red-500 focus:border-red-300 focus:ring-red-500/20 dark:text-red-400 dark:border-red-500 dark:focus:border-red-800`;
        }
        return `${base} text-gray-800 border-gray-300 dark:border-gray-700 focus:border-brand-500/50 focus:ring-brand-500/15 hover:border-gray-400 dark:hover:border-gray-600 shadow-theme-xs hover:shadow-theme-sm`;
    };

    const handleFieldChange = (field, value) => {
        // Sanitize name fields: letters and spaces only
        if (['firstName', 'lastName', 'middleName'].includes(field)) {
            if (value !== '' && !/^[a-zA-Z\s-]*$/.test(value)) return;
            updateField(field, value);
            return;
        }

        // Phone specific logic: Strictly enforce 09XX XXXX XXXX format
        if (field === 'phone') {
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
            return;
        }

        updateField(field, value);
    };

    return (
        <div className='animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8 sm:pb-0'>
            {/* Page Title Section */}
            <div className='text-left mb-6 sm:mb-10'>
                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Identity & Contact
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Provide your legal identity and primary contact information to set up your patient account.
                </p>
            </div>

            {/* Error Banner (Matches Guest Booking ConfirmStep Style) */}
            {Object.keys(errors).length > 0 && (
                <div 
                    ref={bannerRef}
                    className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-3xl mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden'
                >
                    <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertCircle size={20} />
                            </div>
                            <h3 className="text-[15px] sm:text-lg font-bold text-red-600 dark:text-red-400">
                                Incomplete Information
                            </h3>
                        </div>
                    </div>
                    
                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0 shadow-sm" />
                            <p className="text-[13px] sm:text-[15px] text-gray-900 dark:text-white font-bold leading-snug">
                                Please review the fields marked in red before continuing.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 1: Personal Details */}
            <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md mb-6 sm:mb-8 overflow-hidden'>
                <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                    <UserCircle size={20} className="text-brand-500" />
                    <h3 className="text-[15px] sm:text-lg font-bold text-gray-900 dark:text-white">Personal Details</h3>
                </div>

                <div className="px-5 py-6 sm:px-10 sm:py-8 space-y-4 sm:space-y-8">
                    {/* Row 1: Last Name & First Name */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6'>
                        <div>
                            <label className={labelClasses}>Last Name <span className='text-brand-500'>*</span></label>
                            <input
                                type='text'
                                value={data.lastName}
                                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                className={getInputClasses(errors.lastName)}
                                placeholder='e.g. Dela Cruz'
                            />
                            {errors.lastName && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.lastName}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>First Name <span className='text-brand-500'>*</span></label>
                            <input
                                type='text'
                                value={data.firstName}
                                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                className={getInputClasses(errors.firstName)}
                                placeholder='e.g. Juan'
                            />
                            {errors.firstName && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.firstName}</p>}
                        </div>
                    </div>

                    {/* Row 2: Middle Name & Suffix */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6'>
                        <div>
                            <label className={labelClasses}>Middle Name <span className="opacity-40 font-normal italic">(optional)</span></label>
                            <input
                                type='text'
                                value={data.middleName}
                                onChange={(e) => handleFieldChange('middleName', e.target.value)}
                                className={getInputClasses(errors.middleName)}
                                placeholder='e.g. Santos'
                            />
                            {errors.middleName && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.middleName}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>Suffix <span className="opacity-40 font-normal italic">(optional)</span></label>
                            <div className="relative">
                                <select
                                    value={data.suffix}
                                    onChange={(e) => updateField('suffix', e.target.value)}
                                    className={`${getInputClasses(errors.suffix)} cursor-pointer pr-10`}
                                >
                                    <option value=''>None</option>
                                    <option value='Jr.'>Jr.</option>
                                    <option value='Sr.'>Sr.</option>
                                    <option value='II'>II</option>
                                    <option value='III'>III</option>
                                    <option value='IV'>IV</option>
                                </select>
                                <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            {errors.suffix && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.suffix}</p>}
                        </div>
                    </div>

                    {/* Row 3: Birthday & Sex */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6 pt-4 border-t border-gray-50 dark:border-gray-800/50'>
                        <div>
                            <label className={labelClasses}>Date of Birth <span className='text-brand-500'>*</span></label>
                            <input
                                type='date'
                                value={data.dob}
                                onChange={(e) => updateField('dob', e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                max={new Date().toISOString().split('T')[0]}
                                className={cn(getInputClasses(errors.dob), "cursor-pointer")}
                            />
                            {errors.dob && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.dob}</p>}
                        </div>

                        <div>
                            <label className={labelClasses}>Biological Sex <span className='text-brand-500'>*</span></label>
                            <div className='grid grid-cols-2 gap-3'>
                                {['Male', 'Female'].map((s) => (
                                    <button
                                        key={s}
                                        type='button'
                                        onClick={() => updateField('sex', s)}
                                        className={cn(
                                            'py-3 px-4 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2',
                                            data.sex === s
                                                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm'
                                                : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 dark:border-gray-800 dark:bg-transparent dark:text-gray-400'
                                        )}
                                    >
                                        {s === 'Male' ? <Mars size={14} strokeWidth={3} /> : <Venus size={14} strokeWidth={3} />}
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {errors.sex && <p className='text-red-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.sex}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-8 sm:pt-4 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center justify-between gap-4'>
                    {/* Already have an account? Sign In (Left Side) */}
                    <button
                        onClick={() => navigate('/auth/login')}
                        className='flex flex-col items-start transition-opacity hover:opacity-70'
                    >
                        <p className='text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1'>Already have an account?</p>
                        <div className='flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold text-[11px] sm:text-[15px]'>
                            <LogIn size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                            <span>Sign In instead</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={onNext}
                        className={cn(
                            'flex-1 sm:flex-none sm:min-w-[240px] font-black px-2 py-3.5 sm:px-10 sm:py-4 rounded-2xl transition-all shadow-theme-md flex items-center justify-center gap-1 sm:gap-2.5 text-[11px] sm:text-base bg-brand-500 hover:bg-brand-600 active:scale-95 text-white'
                        )}
                    >
                        Continue to Security
                        <ChevronRight size={16} className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepPersonalDetails;
