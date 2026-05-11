import { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const OTPStep = ({ email, onVerify, onResend, isVerifying, error, onReset, resendCount = 0, failedAttempts = 0 }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    
    // Cooldown sequence: 30s, 60s, 60s, 120s, 180s, 300s...
    const getCooldown = (count) => {
        const sequence = [30, 60, 60, 120, 180, 300];
        return sequence[Math.min(count, sequence.length - 1)];
    };

    const [timer, setTimer] = useState(getCooldown(resendCount));
    const [canResend, setCanResend] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Update timer if resendCount changes (when onResend is called)
    useEffect(() => {
        if (resendCount > 0) {
            setTimer(getCooldown(resendCount));
            setCanResend(false);
        }
    }, [resendCount]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }
    }, []);

    const toast = useToast();

    // ✅ Clear OTP inputs on error + Show toast
    useEffect(() => {
        if (error) {
            setOtp(['', '', '', '', '', '']);
            if (inputRefs[0].current) {
                inputRefs[0].current.focus();
            }
            
            const attemptsLeft = 5 - failedAttempts;
            if (attemptsLeft > 0) {
                toast.error(`${error}. You have ${attemptsLeft} attempts left.`);
            } else {
                toast.error('Session locked due to too many failed attempts.');
            }
        }
    }, [error]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }

        // If all filled, verify
        if (newOtp.every(digit => digit !== '') && value) {
            onVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pasteData.every(char => /^\d$/.test(char))) {
            const newOtp = [...otp];
            pasteData.forEach((char, i) => {
                newOtp[i] = char;
            });
            setOtp(newOtp);
            if (pasteData.length === 6) {
                onVerify(newOtp.join(''));
            } else {
                inputRefs[pasteData.length].current.focus();
            }
        }
    };

    const handleResend = () => {
        if (canResend) {
            setOtp(['', '', '', '', '', '']);
            onResend();
            inputRefs[0].current.focus();
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-theme-sm border border-brand-100 dark:border-brand-500/20">
                        <Mail size={24} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <h2 className="text-[19px] sm:text-[22px] font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Verify Your Email</h2>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[320px] mx-auto">
                        We sent a 6-digit code to <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-md font-bold break-all">{email}</span>. Please enter it below to finalize your booking.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl text-[12px] font-bold mb-6 flex gap-3 items-center animate-in shake duration-500">
                        <AlertCircle size={16} className="shrink-0" />
                        <div>
                            <p>{error}</p>
                            <p className="text-[10px] opacity-70 mt-0.5">
                                {5 - failedAttempts} attempts remaining
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between gap-1.5 sm:gap-3 mb-6">
                    {otp.map((digit, index) => (
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
                            disabled={isVerifying}
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
                        onClick={handleResend}
                        disabled={!canResend || isVerifying}
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
                        onClick={() => onVerify(otp.join(''))}
                        disabled={isVerifying || otp.some(d => d === '')}
                        className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[11px] sm:text-sm"
                    >
                        {isVerifying ? (
                            <>
                                <div className="w-4 h-4 border-[2.5px] border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Finalize & Confirm Booking
                                <ShieldCheck size={18} />
                            </>
                        )}
                    </button>

                    <button 
                        onClick={onReset}
                        disabled={isVerifying}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 font-bold text-[11px] py-3 rounded-2xl border border-red-100 dark:border-red-900/20 transition-colors disabled:opacity-30"
                    >
                        Start Over (Release Slot Hold)
                    </button>
                </div>

                <div className="mt-12 p-6 bg-gray-100/50 dark:bg-gray-800/30 rounded-3xl border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />
                        Bot protection active
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        To protect our clinic from spam, we require guests to verify their email address before finalizing a booking. Thank you for your understanding.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPStep;
