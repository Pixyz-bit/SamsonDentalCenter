import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
    isOpen,
    onClose,
    children,
    footer,
    className = '',
    showCloseButton = true,
    isFullscreen = false,
    disableInternalScroll = false,
    noPadding = false,
    ...props
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
        : `relative w-full sm:rounded-3xl rounded-t-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-lg min-h-[500px] max-h-[90vh] flex flex-col overflow-hidden ${className}`;

    return (
        <div className='fixed inset-0 flex sm:items-center items-end justify-center sm:p-4 p-0 modal z-[999999]'>
            {!isFullscreen && (
                <div
                    className='fixed inset-0 h-full w-full bg-black/70 backdrop-blur-md transition-all duration-300'
                    onClick={onClose}
                ></div>
            )}
            <div
                ref={modalRef}
                className={`${contentClasses} animate-in slide-in-from-bottom sm:slide-in-from-top duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Grab handle for mobile bottom sheet */}
                <div className='flex sm:hidden items-center justify-center pt-3 pb-1'>
                    <div className='w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full' />
                </div>

                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className='absolute right-5 top-5 z-[9999] flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100/80 text-gray-400 backdrop-blur-sm transition-all hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                )}

                {/* Header (Full Width, Fixed) */}
                {props.title && (
                    <div className='px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center bg-white dark:bg-gray-900 z-20 shrink-0'>
                        <div>
                            <h3 className='text-xl font-black text-gray-900 dark:text-white leading-none mb-2'>
                                {props.title}
                            </h3>
                            {props.subtitle && (
                                <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>
                                    {props.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Middle Container (Sidebar + Body) */}
                <div className='flex flex-1 overflow-hidden min-h-0 relative'>
                    {/* Glassmorphism Sidebar */}
                    {props.sidebar && (
                        <div className='hidden sm:flex w-20 flex-col items-center py-10 border-r border-gray-100 dark:border-gray-800/50 bg-gray-50/30 dark:bg-white/[0.02] backdrop-blur-xl shrink-0 z-10'>
                            <div className='flex flex-col items-center gap-8'>
                                {props.sidebar}
                            </div>
                        </div>
                    )}

                    {/* Scrollable Body (The only scrollable part) */}
                    <div 
                        id='modal-scroll-body' 
                        className={`flex-1 ${disableInternalScroll ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} ${noPadding ? 'p-0' : 'p-8'} bg-white dark:bg-gray-900`}
                    >
                        {children}
                    </div>
                </div>

                {/* Footer (Full Width, Fixed) */}
                {footer && (
                    <div className='px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-white/[0.02] flex items-center justify-end gap-4 shrink-0 z-20'>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};




