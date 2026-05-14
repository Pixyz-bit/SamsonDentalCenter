const Button = ({
    children,
    size = 'md',
    variant = 'primary',
    startIcon,
    endIcon,
    onClick,
    className = '',
    disabled = false,
    type = 'button',
    form
}) => {
    // Size Classes
    const sizeClasses = {
        sm: 'px-4 py-3 text-sm',
        md: 'px-5 py-3.5 text-sm',
        lg: 'px-6 py-4 text-base',
    };

    // Variant Classes
    const variantClasses = {
        primary:
            'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
        outline:
            'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
        danger:
            'bg-red-600 text-white shadow-theme-xs hover:bg-red-700 disabled:bg-red-300',
        soft:
            'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20',
        ghost:
            'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5',
    };

    return (
        <button
            type={type}
            form={form}
            className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] ${className} ${
                sizeClasses[size]
            } ${variantClasses[variant] || variantClasses.primary} ${
                disabled ? 'cursor-not-allowed opacity-50 active:scale-100' : ''
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            {startIcon && <span className='flex items-center'>{startIcon}</span>}
            {children}
            {endIcon && <span className='flex items-center'>{endIcon}</span>}
        </button>
    );
};

export default Button;
