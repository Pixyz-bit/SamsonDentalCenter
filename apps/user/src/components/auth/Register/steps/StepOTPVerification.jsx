import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, AlertCircle, RotateCw, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '../../../../context/ToastContext';

const StepOTPVerification = ({ email, otp, updateOTP, onVerify, onBack, onResend, loading, error, failedAttempts = 0, resendCount = 0, onReset }) => {
    const [otpArray, setOtpArray] = useState(
        (otp || '').padEnd(6, ' ').split('').slice(0, 6).map(c => c === ' ' ? '' : c)
    );
    
    // Cooldown sequence: 30s, 60s, 60s, 120s, 180s, 300s...
    const getCooldown = (count) => {
        const sequence = [30, 60, 60, 120, 180, 300];
        return sequence[Math.min(count, sequence.length - 1)];
    };

    const [timer, setTimer] = useState(getCooldown(resendCount));
    const [canResend, setCanResend] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    const toast = useToast();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Update timer if resendCount changes
    useEffect(() => {
        if (resendCount > 0) {
            setTimer(getCooldown(resendCount));
            setCanResend(false);
        }
    }, [resendCount]);

    useEffect(() => {
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }
    }, []);

    useEffect(() => {
        updateOTP(otpArray.join(''));
    }, [otpArray, updateOTP]);

    useEffect(() => {
        if (error) {
            setOtpArray(['', '', '', '', '', '']);
            if (inputRefs[0].current) {
                inputRefs[0].current.focus();
            }

            // Match Guest Booking: toast popup + in-page banner
            const attemptsLeft = 5 - failedAttempts;
            if (attemptsLeft > 0) {
                toast.error(`${error}. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`);
            } else {
                toast.error('Session locked due to too many failed attempts.');
            }
        }
    }, [error]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpArray];
        newOtp[index] = value.slice(-1);
        setOtpArray(newOtp);

        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }

        // Auto-verify if all filled
        if (newOtp.every(digit => digit !== '') && value) {
            onVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pasteData.every(char => /^\d$/.test(char))) {
            const newOtp = [...otpArray];
            pasteData.forEach((char, i) => {
                newOtp[i] = char;
            });
            setOtpArray(newOtp);
            if (pasteData.length === 6) {
                onVerify(newOtp.join(''));
            } else {
                inputRefs[pasteData.length].current.focus();
            }
        }
    };

    const handleResendClick = () => {
        if (canResend) {
            setOtpArray(['', '', '', '', '', '']);
            onResend();
            if (inputRefs[0].current) inputRefs[0].current.focus();
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 pb-8 sm:pb-0">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-theme-sm border border-brand-100 dark:border-brand-500/20">
                        <Mail size={24} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <h2 className="text-lg sm:text-[22px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Verify Your Email</h2>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[320px] mx-auto">
                        We sent a 6-digit code to <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-md font-bold break-all">{email}</span>. Please enter it below to finalize your registration.
                    </p>
                </div>



                {loading && (
                    <div className='bg-brand-50/50 dark:bg-brand-950/10 border border-brand-200 dark:border-brand-900/30 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 animate-in fade-in duration-500 shadow-theme-md overflow-hidden text-left'>
                        <div className="px-5 py-6 sm:px-10 sm:py-8 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 shadow-sm">
                                <div className="w-5 h-5 border-[3px] border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-[15px] sm:text-lg font-bold text-brand-600 dark:text-brand-400">
                                    Finalizing Registration
                                </h3>
                                <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-0.5">
                                    Please wait while we verify your credentials and secure your account.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div 
                        className='bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 animate-in shake duration-500 shadow-theme-md overflow-hidden text-left'
                    >
                        <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-red-200/50 dark:border-red-900/30 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="text-[15px] sm:text-lg font-bold text-red-600 dark:text-red-400">
                                    Verification Failed
                                </h3>
                            </div>
                        </div>
                        
                        <div className="px-5 py-6 sm:px-10 sm:py-8">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0 shadow-sm" />
                                <div>
                                    <p className="text-[13px] sm:text-[15px] text-gray-900 dark:text-white font-bold leading-snug">
                                        {error}
                                    </p>
                                    <p className="text-[11px] text-red-500 font-bold mt-1">
                                        {5 - failedAttempts} attempts remaining
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 opacity-40" />
                                <p className="text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                                    Double-check the 6-digit code sent to your email. If you haven't received it, you can request a new one below.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between gap-1.5 sm:gap-3 mb-6">
                    {otpArray.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={loading}
                            className={`w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl border-2 transition-all outline-none 
                                ${digit 
                                    ? 'border-brand-500 bg-brand-50/30 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' 
                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
                                }`}
                        />
                    ))}
                </div>

                <div className="text-center mb-6">
                    <button
                        onClick={handleResendClick}
                        disabled={!canResend || loading}
                        className={`text-[12px] font-bold flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl border transition-all
                            ${canResend 
                                ? 'text-brand-600 border-brand-200 bg-brand-50/50 hover:bg-brand-100 dark:text-brand-400 dark:border-brand-500/30 dark:bg-brand-500/10 dark:hover:bg-brand-500/20' 
                                : 'text-gray-400 border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 cursor-not-allowed'
                            }`}
                    >
                        <RotateCw size={14} className={!canResend ? '' : 'animate-hover'} />
                        {canResend ? 'Resend verification code' : `Resend available in ${timer}s`}
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onVerify(otpArray.join(''))}
                        disabled={loading || otpArray.some(d => d === '')}
                        className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[11px] sm:text-sm"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-[2.5px] border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Complete Registration
                                <ShieldCheck size={18} />
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-12 p-6 bg-gray-100/50 dark:bg-gray-800/30 rounded-3xl border border-gray-200 dark:border-gray-700 text-left">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />
                        Account Security Active
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        To protect your account and personal health information, we require you to verify your email address before finalizing registration. Your data is handled per our clinic's security policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StepOTPVerification;
