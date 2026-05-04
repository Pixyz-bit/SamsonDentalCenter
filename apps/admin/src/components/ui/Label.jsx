const Label = ({ htmlFor, children, className = '', optional = false }) => {
    return (
        <label
            htmlFor={htmlFor}
            className={`mb-1.5 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-400 ${className}`}
        >
            <span>{children}</span>
            {optional && (
                <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded'>
                    Optional
                </span>
            )}
        </label>
    );
};

export default Label;




