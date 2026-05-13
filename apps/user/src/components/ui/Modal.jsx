import { useRef, useEffect } from 'react';

export const Modal = ({
    isOpen,
    onClose,
    children,
    className = '',
    showCloseButton = true,
    isFullscreen = false,
    closeOnOverlayClick = true,
    isBottomSheet = false,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const contentClasses = isFullscreen
        ? 'w-full h-full'
        : `relative w-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden ${
            isBottomSheet 
                ? 'rounded-t-[24px] sm:rounded-2xl max-h-[90dvh] animate-in slide-in-from-bottom-full duration-500 mb-0' 
                : 'rounded-2xl max-h-[90vh]'
        }`;

    return (
        <div className={`fixed top-0 left-0 right-0 h-[100dvh] flex overflow-hidden modal z-[999999] ${
            isBottomSheet ? 'flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4' : 'items-center justify-center p-4'
        }`}>
            {!isFullscreen && (
                <div
                    className='absolute inset-0 h-full w-full bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500'
                    onClick={closeOnOverlayClick ? onClose : undefined}
                ></div>
            )}
            <div
                ref={modalRef}
                className={`${contentClasses} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className='absolute right-3 top-3 z-[9999] flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11'
                    >
                        <svg
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z'
                                fill='currentColor'
                            />
                        </svg>
                    </button>
                )}
                <div className='flex-1 flex flex-col min-h-0'>{children}</div>
            </div>
        </div>
    );
};

export const ModalHeader = ({ title, description, onClose, className = '' }) => (
    <div className={`px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 shrink-0 ${className}`}>
        <div className='flex items-center justify-between gap-4'>
            <div>
                <h4 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight'>
                    {title}
                </h4>
                {description && (
                    <p className='mt-1 text-[12px] sm:text-sm text-gray-500 dark:text-gray-400 font-medium'>
                        {description}
                    </p>
                )}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white transition-colors'
                >
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        <line x1='18' y1='6' x2='6' y2='18'></line>
                        <line x1='6' y1='6' x2='18' y2='18'></line>
                    </svg>
                </button>
            )}
        </div>
    </div>
);

export const ModalBody = ({ children, className = '' }) => (
    <div className={`flex-1 overflow-y-auto p-5 sm:p-8 ${className}`}>
        {children}
    </div>
);

export const ModalFooter = ({ children, className = '' }) => (
    <div className={`px-5 py-4 sm:px-8 sm:py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.02] shrink-0 ${className}`}>
        <div className='flex items-center justify-end gap-3'>
            {children}
        </div>
    </div>
);
