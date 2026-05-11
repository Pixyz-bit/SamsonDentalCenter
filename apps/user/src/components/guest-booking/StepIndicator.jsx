import { Check } from 'lucide-react';

/**
 * Redesigned StepIndicator:
 * - Compact horizontal layout for sticky header
 * - Uses brand-500 palette
 * - Mobile-responsive: Hide labels on small screens
 */
const StepIndicator = ({ currentStep, onStepClick, labels, isLocked = false }) => {
    const defaultLabels = ['Service', 'Schedule', 'Details', 'Review', 'Verify'];
    const stepLabels = labels || defaultLabels;

    return (
        <nav className='flex items-center justify-center gap-1.5 sm:gap-4 translate-y-[5px] sm:translate-y-0'>
            {stepLabels.map((label, index) => {
                const isCompleted = index + 1 < currentStep;
                const isActive = index + 1 === currentStep;
                const isDisabled = isLocked || index + 1 > currentStep;

                return (
                    <div key={label} className='flex items-center'>
                        <button
                            onClick={() => !isLocked && onStepClick(index)}
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
                                          ? (label === 'Success' ? 'bg-red-500 text-white ring-4 ring-red-500/10 shadow-theme-xs scale-105' : 'bg-brand-500 text-white ring-4 ring-brand-500/10 shadow-theme-xs scale-105')
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 shadow-theme-xs'
                                }`}
                            >
                                {isCompleted ? <Check size={12} strokeWidth={4} /> : index + 1}
                            </div>

                            {/* Label: Under on Mobile, Right on Desktop */}
                            <span
                                className={`text-[9px] sm:text-[14px] font-black tracking-tight whitespace-nowrap transition-colors text-center sm:text-left ${
                                    isActive
                                        ? (label === 'Success' ? 'text-red-500' : 'text-gray-900 dark:text-white')
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
                            } ${
                                '-mt-3 sm:mt-0'
                            }`} />
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default StepIndicator;
