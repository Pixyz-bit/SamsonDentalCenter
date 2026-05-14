import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, AlertCircle, LogIn, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../utils/api';
import { Modal } from '../../ui/Modal';
import Button from '../../ui/Button';
import RegisterStepIndicator from './steps/RegisterStepIndicator';
import StepPersonalDetails from './steps/StepPersonalDetails';
import StepContactAuth from './steps/StepContactAuth';
import StepOTPVerification from './steps/StepOTPVerification';

const STORAGE_KEY = 'user_registration_state';

const RegisterContainer = () => {
    const navigate = useNavigate();
    const { setIsDarkModeAllowed } = useTheme();
    const toast = useToast();

    // Force light mode
    useEffect(() => {
        setIsDarkModeAllowed(false);
        return () => setIsDarkModeAllowed(true);
    }, [setIsDarkModeAllowed]);



    // Multi-step State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveredStep, setRecoveredStep] = useState(1);
    const [recoveredName, setRecoveredName] = useState('');
    const hasHydratedRef = useRef(false);
    const [signupData, setSignupData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        sex: '',
        dob: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreed_to_terms: false,
    });
    const [signupErrors, setSignupErrors] = useState({});
    const [otp, setOtp] = useState('');

    // Security & Anti-abuse State
    const [failedOtpAttempts, setFailedOtpAttempts] = useState(0);
    const [otpResendCount, setOtpResendCount] = useState(0);

    // ✅ Hydration: Load state from localStorage on mount — show recovery modal if past Step 1
    useEffect(() => {
        if (hasHydratedRef.current) return;
        hasHydratedRef.current = true;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const savedStep = parsed.step || 1;
                const savedData = parsed.signupData || {};

                // Always restore the data so it's ready either way
                setSignupData(prev => ({ ...prev, ...savedData }));
                setFailedOtpAttempts(parsed.failedOtpAttempts || 0);
                setOtpResendCount(parsed.otpResendCount || 0);

                // Only show recovery modal if they were past Step 1
                if (savedStep > 1 && (savedData.firstName || savedData.email)) {
                    setRecoveredStep(savedStep);
                    setRecoveredName(savedData.firstName || savedData.email || '');
                    setShowRecoveryModal(true);
                    // Don't restore step yet — wait for user decision
                } else {
                    setStep(savedStep);
                }
            } catch (e) {
                console.error('Failed to hydrate registration state:', e);
            }
        }
    }, []);

    // ✅ Persistence: Save state to localStorage on change
    useEffect(() => {
        const stateToSave = {
            step,
            signupData,
            failedOtpAttempts,
            otpResendCount,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [step, signupData, failedOtpAttempts, otpResendCount]);

    // Scroll to top and clear errors on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        setError(null);
        setSignupErrors({});
    }, [step]);

    const updateField = (field, value) => {
        setSignupData(prev => ({ ...prev, [field]: value }));
        if (signupErrors[field]) {
            setSignupErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validateStep = (currentStep) => {
        const errors = {};
        const validateNames = (name) => /^[a-zA-Z\s-]*$/.test(name);

        if (currentStep === 1) {
            // Step 1: Identity
            if (!signupData.firstName.trim()) {
                errors.firstName = 'First name is required';
            } else if (!validateNames(signupData.firstName)) {
                errors.firstName = 'Numbers and special characters are not allowed';
            }

            if (!signupData.lastName.trim()) {
                errors.lastName = 'Last name is required';
            } else if (!validateNames(signupData.lastName)) {
                errors.lastName = 'Numbers and special characters are not allowed';
            }

            if (signupData.middleName && !validateNames(signupData.middleName)) {
                errors.middleName = 'Invalid characters in middle name';
            }

            if (!signupData.sex) errors.sex = 'Sex is required';
            if (!signupData.dob) {
                errors.dob = 'Date of birth is required';
            } else {
                const selectedDate = new Date(signupData.dob);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate > today) {
                    errors.dob = 'Date of birth cannot be in the future';
                }
            }
        } else if (currentStep === 2) {
            // Step 2: Contact & Security
            if (!signupData.email.trim()) {
                errors.email = 'Email address is required';
            } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
                errors.email = 'Please enter a valid email address';
            }

            if (!signupData.phone.trim()) {
                errors.phone = 'Phone number is required';
            } else {
                const sanitizedPhone = signupData.phone.replace(/\D/g, '');
                if (sanitizedPhone.length !== 11) {
                    errors.phone = 'Philippine mobile numbers must be exactly 11 digits';
                } else if (!sanitizedPhone.startsWith('09')) {
                    errors.phone = 'Philippine mobile numbers must start with 09';
                }
            }

            if (!signupData.password) {
                errors.password = 'Password is required';
            } else if (signupData.password.length < 8) {
                errors.password = 'Minimum 8 characters';
            }
            if (signupData.password !== signupData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }

            if (!signupData.agreed_to_terms) {
                errors.terms = 'You must agree to the terms and privacy policy';
            }
        }

        setSignupErrors(errors);

        if (Object.keys(errors).length > 0) {
            // No toast here as steps render their own error states/banners
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        return Object.keys(errors).length === 0;
    };

    const handleInitiateRegistration = async () => {
        if (!validateStep(2)) return;

        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register/initiate', {
                email: signupData.email,
                password: signupData.password,
                first_name: signupData.firstName,
                last_name: signupData.lastName,
                middle_name: signupData.middleName,
                suffix: signupData.suffix,
                sex: signupData.sex,
                date_of_birth: signupData.dob,
                phone: signupData.phone
            });
            
            // Increment resend count if we are already on the OTP step
            if (step === 3) {
                setOtpResendCount(prev => prev + 1);
            }
            
            setStep(3);
        } catch (err) {
            const msg = err.message || 'Failed to send verification code';
            setError(msg);
            // No toast here as StepContactAuth/StepOTPVerification renders an in-page banner
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (passedOtp) => {
        const otpToUse = passedOtp || otp;
        if (!otpToUse || otpToUse.length !== 6) return;

        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/register/verify', {
                email: signupData.email,
                otp_code: otpToUse
            });
            
            // Success: Clean up and navigate
            localStorage.removeItem(STORAGE_KEY);
            navigate('/login', {
                state: {
                    message: 'Account created! Please sign in with your new credentials.'
                }
            });
        } catch (err) {
            setFailedOtpAttempts(prev => prev + 1);
            const msg = err.message || 'Verification failed';
            setError(msg);
            // No toast here as StepOTPVerification renders an in-page banner
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep(1);
        setSignupData({
            firstName: '',
            middleName: '',
            lastName: '',
            suffix: '',
            sex: '',
            dob: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            agreed_to_terms: false,
        });
        setFailedOtpAttempts(0);
        setOtpResendCount(0);
        setOtp('');
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
        setShowExitModal(false);
    };

    const handleExit = () => {
        // If data is empty, just navigate
        const hasData = signupData.firstName || signupData.email;
        if (hasData && step < 3) {
            setShowExitModal(true);
        } else {
            navigate('/');
        }
    };

    const handleResumeSession = () => {
        setStep(recoveredStep);
        setShowRecoveryModal(false);
    };

    const handleDiscardSession = () => {
        handleReset();
        setShowRecoveryModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 selection:bg-brand-100 selection:text-brand-900">
            {/* Sticky Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-theme-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-center relative">
                    {/* Exit Button */}
                    <div className='absolute left-3 sm:left-4 top-1/2 -translate-y-1/2'>
                        <button
                            onClick={() => setShowExitModal(true)}
                            className='flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-base transition-colors p-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700'
                        >
                            <X size={18} />
                            <span className='hidden sm:inline'>Exit</span>
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <RegisterStepIndicator 
                        currentStep={step} 
                        labels={['Personal Info', 'Credentials', 'Verification']}
                        onStepClick={(s) => s < step && setStep(s)}
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-6 sm:px-8 py-10 md:py-16">
                <div className="w-full">
                    {step === 1 && (
                        <StepPersonalDetails
                            data={signupData}
                            errors={signupErrors}
                            updateField={updateField}
                            onNext={() => validateStep(1) && setStep(2)}
                        />
                    )}

                    {step === 2 && (
                        <StepContactAuth
                            data={signupData}
                            errors={signupErrors}
                            updateField={updateField}
                            onNext={handleInitiateRegistration}
                            onBack={() => setStep(1)}
                            loading={loading}
                            serverError={error}
                        />
                    )}

                    {step === 3 && (
                        <StepOTPVerification
                            email={signupData.email}
                            otp={otp}
                            updateOTP={setOtp}
                            onVerify={handleVerifyOTP}
                            onBack={() => setStep(2)}
                            onResend={handleInitiateRegistration}
                            loading={loading}
                            error={error}
                            failedAttempts={failedOtpAttempts}
                            resendCount={otpResendCount}
                            onReset={() => setShowExitModal(true)}
                        />
                    )}



                </div>
            </main>

            {/* ✅ Session Recovery Modal */}
            <Modal
                isOpen={showRecoveryModal}
                onClose={() => {}}
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md sm:max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                            <ClipboardList className="text-brand-600 dark:text-brand-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white">Resume Sign-Up?</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold">We found a saved registration session.</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 sm:py-6 flex-1 overflow-y-auto">
                        <div className="p-5 sm:p-6 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100/50 dark:border-brand-800/30 rounded-2xl sm:rounded-3xl flex flex-col items-center text-center gap-4 shadow-theme-xs">
                            <div className="space-y-1.5">
                                <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                                    Hi{recoveredName ? `, ${recoveredName}` : ''}!
                                </h4>
                                <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-snug">
                                    Your registration was saved. You were on
                                </p>
                            </div>

                            <div className="w-full py-3 px-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-brand-100 dark:border-brand-900/20 shadow-theme-xs">
                                <span className="text-[11px] sm:text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                    Step {recoveredStep} — {recoveredStep === 2 ? 'Contact & Security' : 'Verification'}
                                </span>
                            </div>

                            <p className="text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-snug">
                                Would you like to continue where you left off?
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={handleDiscardSession}
                            className="flex-1 h-11 sm:h-12 text-[11px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/10 transition-all duration-300 border border-transparent"
                        >
                            Start Fresh
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleResumeSession}
                            className="flex-[1.5] h-11 sm:h-12 text-[11px] sm:text-sm font-black shadow-lg shadow-primary-500/20"
                        >
                            Continue Sign-Up
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Exit/Reset Confirmation Modal */}
            <Modal
                isOpen={showExitModal}
                onClose={() => setShowExitModal(false)}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <LogOut className="text-amber-600 dark:text-amber-400 rotate-180" size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white">Discard Registration?</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold">Your progress will be lost</p>
                        </div>
                    </div>

                    <div className="px-6 py-8 flex-1 text-center">
                        <p className="text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold italic">
                            Are you sure you want to leave? All entered information will be cleared and your session will be reset.
                        </p>
                    </div>

                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => {
                                handleReset();
                                navigate('/');
                            }}
                            className="flex-1 h-11 text-[11px] sm:text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            Discard & Exit
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => setShowExitModal(false)}
                            className="flex-[1.5] h-11 text-[11px] sm:text-sm font-black shadow-lg shadow-primary-500/20"
                        >
                            Continue Sign-up
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ✅ Security Hard Block Modal */}
            <Modal
                isOpen={failedOtpAttempts >= 5}
                onClose={() => {}} // Mandatory action required
                showCloseButton={false}
                closeOnOverlayClick={false}
                className="max-w-md"
                isBottomSheet={true}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <AlertCircle className="text-red-600 dark:text-red-400" size={22} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white">Security Lock</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold">Access paused for your safety</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 sm:py-8 flex-1 overflow-y-auto text-center">
                        <div className="space-y-4">
                            <p className="text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                To protect your information, we've paused this registration session after <span className="text-red-500 font-bold">5 unsuccessful attempts</span>.
                            </p>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 leading-normal">
                                    Don't worry—you can try again in a new session or return home.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-row gap-3">
                        <Button 
                            variant="ghost" 
                            fullWidth 
                            onClick={() => {
                                handleReset();
                                navigate('/');
                            }}
                            className="flex-1 h-11 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-gray-900"
                        >
                            Go Home
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={handleReset}
                            className="flex-[1.5] h-11 text-[10px] sm:text-sm font-black bg-brand-500 hover:bg-brand-600 border-brand-500 shadow-lg shadow-brand-500/20"
                        >
                            Start Fresh
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RegisterContainer;
