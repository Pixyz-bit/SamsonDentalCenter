import { Check } from 'lucide-react';

/**
 * RegisterStepIndicator:
 * - Specifically for the 3-step registration wizard
 * - Mobile-responsive: Labels hide on small screens
 */
const RegisterStepIndicator = ({ currentStep, labels, onStepClick, isLocked = false }) => {
    const defaultLabels = ['Identity', 'Account', 'Verify'];
    const stepLabels = labels || defaultLabels;

    return (
        <nav className='flex items-center justify-center gap-1.5 sm:gap-4'>
            {stepLabels.map((label, index) => {
                const isCompleted = index + 1 < currentStep;
                const isActive = index + 1 === currentStep;
                const isDisabled = isLocked || index + 1 > currentStep;

                return (
                    <div key={label} className='flex items-center'>
                        <button
                            onClick={() => !isDisabled && onStepClick && onStepClick(index + 1)}
                            disabled={isDisabled}
                            className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 group transition-all ${
                                !isDisabled ? 'cursor-pointer' : 'cursor-default opacity-50'
                            }`}
                        >
                            {/* Circle */}
                            <div
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[12px] font-bold transition-all duration-300 ${
                                    isCompleted
                                        ? 'bg-brand-500 text-white shadow-theme-xs'
                                        : isActive
                                          ? 'bg-brand-500 text-white ring-4 ring-brand-500/10 shadow-theme-xs scale-105'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 shadow-theme-xs'
                                }`}
                            >
                                {isCompleted ? <Check size={12} strokeWidth={4} /> : index + 1}
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[10px] sm:text-[14px] font-black tracking-tight whitespace-nowrap transition-colors text-center sm:text-left ${
                                    isActive
                                        ? 'text-gray-900 dark:text-white'
                                        : isCompleted
                                          ? 'text-brand-600 dark:text-brand-400'
                                          : 'text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                {label}
                            </span>
                        </button>

                        {/* Connector line */}
                        {index < stepLabels.length - 1 && (
                            <div className={`w-1.5 sm:w-4 h-[1.5px] mx-1 sm:mx-3 ${
                                index + 1 < currentStep ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'
                            }`} />
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default RegisterStepIndicator;
