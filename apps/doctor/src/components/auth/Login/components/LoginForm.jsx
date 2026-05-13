import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
        value && !error && 'bg-white border-slate-200',
    );

const LoginForm = ({ onSubmit, loading = false, error = null, showSignUpLink = true, showGuestLink = true }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passError, setPassError] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        let hasError = false;
        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        }
        if (!pass) {
            setPassError('Password is required');
            hasError = true;
        }

        if (!hasError) {
            onSubmit(email, pass);
        }
    };


    return (
        <div className='flex flex-col h-full'>
            <div className='mb-8 text-center flex-shrink-0'>
                {/* Mobile Logo - Only visible when Carousel is hidden */}
                <div className='flex items-center justify-center gap-3 mb-6 md:hidden'>
                    <div className='w-8 flex-shrink-0 flex items-center justify-center transition-all duration-500'>
                        <img
                            src='/images/logo/samson-logo.png'
                            alt='Samson Dental Logo'
                            className='w-full h-auto'
                        />
                    </div>
                    <div className='flex flex-col items-start justify-center'>
                        <span className='font-black text-[20px] tracking-[-0.04em] leading-none text-slate-900 whitespace-nowrap uppercase'>
                            SAMSON
                        </span>
                        <span className='text-[9px] uppercase tracking-[0.28em] font-bold mt-[1px] text-red-600 whitespace-nowrap'>
                            Dental Center
                        </span>
                    </div>
                </div>

                <h2 className='text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight'>
                    Welcome Back!
                </h2>
                <p className='text-slate-500 text-sm font-medium'>Sign in to your account to continue.</p>
            </div>

            <form
                onSubmit={handleFormSubmit}
                className='space-y-5'
            >
                <InputGroup
                    label='Email Address'
                    icon={Mail}
                    error={emailError}
                >
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                        }}
                        className={inputClassName(emailError, email)}
                        placeholder='Enter your email address'
                    />
                </InputGroup>

                <InputGroup
                    label='Password'
                    icon={Lock}
                    error={passError}
                >
                    <input
                        type='password'
                        value={pass}
                        onChange={(e) => {
                            setPass(e.target.value);
                            if (passError) setPassError('');
                        }}
                        className={inputClassName(passError, pass)}
                        placeholder='Enter your password'
                    />
                </InputGroup>

                {error && (
                    <div className='p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center justify-between shadow-sm'>
                        <span>{error}</span>
                        <AlertCircle size={14} />
                    </div>
                )}

                <div className='pt-3'>
                    <Button
                        type='submit'
                        disabled={loading}
                        className='w-full !bg-red-600 hover:!bg-red-700 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 border-0 font-bold rounded-xl py-3.5'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ChevronRight className='ml-2 h-4 w-4' strokeWidth={3} />}
                    </Button>
                </div>
            </form>

            {(showSignUpLink || showGuestLink) && (
                <div className='flex-shrink-0 pt-8 border-t border-slate-100 text-center mt-8'>
                    {showSignUpLink && (
                        <p className='text-slate-500 text-sm font-medium'>
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className='text-red-600 font-bold hover:text-red-700 hover:underline transition-colors'
                            >
                                Create Account
                            </button>
                        </p>
                    )}
                    {showGuestLink && (
                        <div className='mt-5'>
                            <button
                                onClick={() => navigate('/book')}
                                className='w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 transition-all duration-300 active:scale-[0.98]'
                            >
                                Continue as Guest
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoginForm;
