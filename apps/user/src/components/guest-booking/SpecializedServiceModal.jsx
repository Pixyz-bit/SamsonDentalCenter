import { Lock, ArrowRight, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Modal that appears when a guest tries to book a specialized service.
 * Requires authentication with options to login or register.
 */
const SpecializedServiceModal = ({ service, onClose }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate(`/login?redirect=/patient/book?service=${service.id}`);
        onClose();
    };

    const handleRegister = () => {
        navigate(`/register?redirect=/patient/book?service=${service.id}`);
        onClose();
    };

    return (
        <div
            className='fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6'
            onClick={onClose}
        >
            <div
                className='bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-5 sm:p-7 relative shadow-2xl animate-in fade-in zoom-in duration-300'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'
                    aria-label='Close'
                >
                    <X size={18} />
                </button>

                <div className='text-center'>
                    {/* Lock Icon */}
                    <div className='bg-brand-50 dark:bg-brand-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 rotate-3 shadow-theme-sm'>
                        <Lock
                            size={24}
                            className='text-brand-600 dark:text-brand-400 -rotate-3'
                        />
                    </div>

                    {/* Title */}
                    <h3 className='text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight uppercase'>
                        Account Required
                    </h3>

                    {/* Service name + explanation */}
                    <p className='text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 mb-5 sm:mb-6 leading-relaxed font-medium px-1'>
                        <span className='text-brand-600 dark:text-brand-400 font-bold'>
                            {service.name}
                        </span> is a specialized service that requires an account.
                    </p>

                    {/* Benefits list */}
                    <div className='bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-7 border border-gray-100 dark:border-gray-700/50'>
                        <p className='text-[9px] sm:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-left'>
                            Why create an account?
                        </p>
                        <ul className='space-y-2.5 sm:space-y-3'>
                            {[
                                'Keep your medical history secure & private',
                                'Send personalized prep instructions',
                                'Manage appointments in one dashboard',
                            ].map((benefit) => (
                                <li key={benefit} className='flex items-start gap-3 text-left group'>
                                    <div className='bg-brand-500/10 dark:bg-brand-500/20 w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-500 transition-colors'>
                                        <Check size={10} className='text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors' strokeWidth={4} />
                                    </div>
                                    <span className='text-[12px] sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 leading-snug'>
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action buttons */}
                    <div className='flex flex-col gap-2 sm:gap-2.5'>
                        <button
                            onClick={handleLogin}
                            className='w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98]
                                       text-white font-black py-3 sm:py-3.5 px-6 rounded-xl
                                       transition-all flex items-center justify-center gap-2
                                       shadow-lg shadow-brand-500/20 text-[11px] sm:text-sm'
                        >
                            Login to Your Account
                            <ArrowRight size={16} />
                        </button>

                        <button
                            onClick={handleRegister}
                            className='w-full border-2 border-brand-200 dark:border-gray-700 hover:border-brand-500 
                                       text-gray-900 dark:text-white font-black py-3 sm:py-3.5 px-6 rounded-xl
                                       transition-all hover:bg-brand-50 dark:hover:bg-brand-500/10 text-[11px] sm:text-sm'
                        >
                            Create New Account
                        </button>

                        <button
                            onClick={onClose}
                            className='text-gray-400 hover:text-gray-900 dark:hover:text-white
                                       text-[11px] sm:text-xs font-bold py-1.5 transition-colors mt-1.5'
                        >
                            Continue browsing other services
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecializedServiceModal;
