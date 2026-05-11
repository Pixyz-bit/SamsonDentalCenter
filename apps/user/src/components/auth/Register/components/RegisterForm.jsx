import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '../../../../context/ThemeContext';
import { Button } from '@/components/ui';

const InputGroup = ({ label, icon: Icon, error, children }) => (
    <div className='space-y-1.5 group text-left'>
        <label
            className={cn(
                'block text-[11px] font-bold uppercase tracking-[0.05em] transition-colors',
                error ? 'text-red-500' : 'text-slate-500 group-focus-within:text-red-600',
            )}
        >
            {label}
        </label>
        <div className='relative'>
            <div
                className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300',
                    error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-red-600',
                )}
            >
                <Icon size={18} strokeWidth={2.5} />
            </div>
            {children}
        </div>
        {error && (
            <p className='text-red-500 text-xs font-medium text-right animate-in slide-in-from-top-1'>
                {error}
            </p>
        )}
    </div>
);

const inputClassName = (error, value) =>
    cn(
        'w-full rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all duration-300',
        error
            ? 'bg-red-50/30 border border-red-300 text-red-900 placeholder:text-red-300 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
            : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/15 hover:border-slate-300',
        value && !error && 'bg-white border-green-500/50 focus:border-green-500 focus:ring-4 focus:ring-green-500/15',
    );

const RegisterForm = ({ onSubmit, loading = false, error = null }) => {
    const { setIsDarkModeAllowed } = useTheme();

    // Force light mode on register
    useEffect(() => {
        setIsDarkModeAllowed(false);
    }, [setIsDarkModeAllowed]);

    const [signupData, setSignupData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        dob: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [signupErrors, setSignupErrors] = useState({});

    const navigate = useNavigate();

    const updateField = (field, value) => {
        setSignupData({ ...signupData, [field]: value });
        if (signupErrors[field]) {
            const newErrors = { ...signupErrors };
            delete newErrors[field];
            setSignupErrors(newErrors);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validation Logic
        const errors = {};
        if (!signupData.firstName.trim()) errors.firstName = 'First name is required';
        if (!signupData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!signupData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
            errors.email = 'Email is invalid';
        }
        if (!signupData.phone.trim()) errors.phone = 'Phone is required';
        if (!signupData.password) {
            errors.password = 'Password is required';
        } else if (signupData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        if (signupData.password !== signupData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!signupData.dob) errors.dob = 'Birthday is required';

        if (Object.keys(errors).length > 0) {
            setSignupErrors(errors);
            return;
        }

        onSubmit(signupData);
    };


    return (
        <div className='flex flex-col h-full'>
            <div className='mb-6 text-center flex-shrink-0'>
                <h2 className='text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight'>
                    Patient Registration
                </h2>
                <p className='text-slate-500 text-sm font-medium'>Register your account for a premium experience</p>
            </div>

            <div className='flex-grow'>
                <form
                    id='register-form'
                    onSubmit={handleFormSubmit}
                    className='space-y-8 pb-4'
                >
                    {/* Personal Identity */}
                    <div className='space-y-5'>
                        <div className='flex items-center gap-3 opacity-60'>
                            <div className='h-px flex-1 bg-slate-200'></div>
                            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                                Personal Information
                            </span>
                            <div className='h-px flex-1 bg-slate-200'></div>
                        </div>

                        <div className='space-y-4'>
                            <InputGroup
                                label='First Name'
                                icon={User}
                                error={signupErrors.firstName}
                            >
                                <input
                                    type='text'
                                    value={signupData.firstName}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                    className={inputClassName(
                                        signupErrors.firstName,
                                        signupData.firstName,
                                    )}
                                    placeholder='Enter your first name'
                                />
                            </InputGroup>
                            <InputGroup
                                label='Middle Name'
                                icon={User}
                                error={signupErrors.middleName}
                            >
                                <input
                                    type='text'
                                    value={signupData.middleName}
                                    onChange={(e) => updateField('middleName', e.target.value)}
                                    className={inputClassName(
                                        signupErrors.middleName,
                                        signupData.middleName,
                                    )}
                                    placeholder='Enter middle name (optional)'
                                />
                            </InputGroup>
                            <InputGroup
                                label='Last Name'
                                icon={User}
                                error={signupErrors.lastName}
                            >
                                <input
                                    type='text'
                                    value={signupData.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                    className={inputClassName(
                                        signupErrors.lastName,
                                        signupData.lastName,
                                    )}
                                    placeholder='Enter your last name'
                                />
                            </InputGroup>
                            <InputGroup
                                label='Suffix'
                                icon={User}
                                error={signupErrors.suffix}
                            >
                                <select
                                    value={signupData.suffix}
                                    onChange={(e) => updateField('suffix', e.target.value)}
                                    className={cn(
                                        inputClassName(signupErrors.suffix, signupData.suffix),
                                        'appearance-none cursor-pointer',
                                    )}
                                >
                                    <option value=''>None</option>
                                    <option value='Jr.'>Jr.</option>
                                    <option value='Sr.'>Sr.</option>
                                    <option value='II'>II</option>
                                    <option value='III'>III</option>
                                    <option value='IV'>IV</option>
                                </select>
                                <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'>
                                    <ChevronRight
                                        className='rotate-90'
                                        size={16}
                                    />
                                </div>
                            </InputGroup>

                            <InputGroup
                                label='Birthday'
                                icon={Calendar}
                                error={signupErrors.dob}
                            >
                                <input
                                    type='date'
                                    value={signupData.dob}
                                    onChange={(e) => updateField('dob', e.target.value)}
                                    className={inputClassName(signupErrors.dob, signupData.dob)}
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className='space-y-5'>
                        <div className='flex items-center gap-3 opacity-60'>
                            <div className='h-px flex-1 bg-slate-200'></div>
                            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                                Contact Information
                            </span>
                            <div className='h-px flex-1 bg-slate-200'></div>
                        </div>

                        <div className='space-y-4'>
                            <InputGroup
                                label='Email'
                                icon={Mail}
                                error={signupErrors.email}
                            >
                                <input
                                    type='email'
                                    value={signupData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className={inputClassName(signupErrors.email, signupData.email)}
                                    placeholder='Enter your email address'
                                />
                            </InputGroup>
                            <InputGroup
                                label='Phone'
                                icon={Phone}
                                error={signupErrors.phone}
                            >
                                <input
                                    type='tel'
                                    value={signupData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className={inputClassName(signupErrors.phone, signupData.phone)}
                                    placeholder='Enter your phone number'
                                />
                            </InputGroup>
                        </div>
                    </div>

                    {/* Security */}
                    <div className='space-y-5'>
                        <div className='flex items-center gap-3 opacity-60'>
                            <div className='h-px flex-1 bg-slate-200'></div>
                            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                                Password Setup
                            </span>
                            <div className='h-px flex-1 bg-slate-200'></div>
                        </div>

                        <div className='space-y-4'>
                            <InputGroup
                                label='Password'
                                icon={Lock}
                                error={signupErrors.password}
                            >
                                <input
                                    type='password'
                                    value={signupData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    className={inputClassName(
                                        signupErrors.password,
                                        signupData.password,
                                    )}
                                    placeholder='Enter your password'
                                />
                            </InputGroup>
                            <InputGroup
                                label='Confirm'
                                icon={Lock}
                                error={signupErrors.confirmPassword}
                            >
                                <input
                                    type='password'
                                    value={signupData.confirmPassword}
                                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                                    className={inputClassName(
                                        signupErrors.confirmPassword,
                                        signupData.confirmPassword,
                                    )}
                                    placeholder='Confirm your password'
                                />
                            </InputGroup>
                        </div>
                    </div>
                </form>
            </div>

            <div className='flex-shrink-0 pt-6 border-t border-slate-100 text-center mt-2'>
                {error && (
                    <div className='mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-right'>
                        {error}
                    </div>
                )}

                <div className='pt-3'>
                    <Button
                        form='register-form'
                        type='submit'
                        disabled={loading}
                        className='w-full !bg-red-600 hover:!bg-red-700 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 border-0 font-bold rounded-xl py-3.5'
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ChevronRight className='ml-2 h-4 w-4' strokeWidth={3} />}
                    </Button>
                </div>

                <p className='text-slate-500 text-sm mt-4 font-medium'>
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className='text-red-600 font-bold hover:text-red-700 hover:underline transition-colors'
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
