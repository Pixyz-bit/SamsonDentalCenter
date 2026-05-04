import { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';

const OTPStep = ({ email, onVerify, onResend, isVerifying, error, onReset }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
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

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }
    }, []);

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
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            onResend();
            inputRefs[0].current.focus();
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-theme-sm border border-brand-100 dark:border-brand-500/20">
                        <Mail size={36} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Check your email</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        We sent a 6-digit verification code to <br />
                        <span className="text-gray-900 dark:text-white font-bold break-all">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400 px-4 py-3.5 rounded-2xl text-sm font-bold mb-8 flex gap-3 items-center animate-in shake duration-500">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex justify-between gap-2 sm:gap-4 mb-8">
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
                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none 
                                ${digit 
                                    ? 'border-brand-500 bg-brand-50/30 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' 
                                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
                                }`}
                        />
                    ))}
                </div>

                <div className="text-center mb-10">
                    <button
                        onClick={handleResend}
                        disabled={!canResend || isVerifying}
                        className={`text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors
                            ${canResend 
                                ? 'text-brand-600 dark:text-brand-400 hover:text-brand-700' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <RotateCw size={16} className={!canResend ? '' : 'animate-hover'} />
                        {canResend ? 'Resend verification code' : `Resend in ${timer}s`}
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onVerify(otp.join(''))}
                        disabled={isVerifying || otp.some(d => d === '')}
                        className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black py-4.5 rounded-2xl transition-all shadow-theme-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                        {isVerifying ? (
                            <>
                                <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & Confirm Booking
                                <ShieldCheck size={20} />
                            </>
                        )}
                    </button>
                    


                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                    <button 
                        onClick={onReset}
                        disabled={isVerifying}
                        className="w-full text-red-500/70 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 font-bold text-[11px] py-2 transition-colors disabled:opacity-30 uppercase tracking-widest"
                    >
                        Start Over (Release Hold)
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
