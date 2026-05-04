import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    
    // Provide nice helpers
    return {
        ...context,
        success: (message, title) => context.showToast(message, 'success', title),
        error: (message, title) => context.showToast(message, 'error', title),
        info: (message, title) => context.showToast(message, 'info', title),
    };
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', title) => {
        const id = Math.random().toString(36).substr(2, 9);
        const defaultTitle = type === 'success' ? 'Success' : type === 'error' ? 'Attention Required' : 'Information';
        setToasts((prev) => [...prev, { id, message, type, title: title || defaultTitle }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - Positioned under the sticky header (approx 64px mobile, 76px desktop) */}
            <div className="fixed top-[4.5rem] sm:top-24 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-3 sm:p-5 flex gap-3 sm:gap-4 items-center ring-1 ring-black/5 pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-500"
                    >
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                            toast.type === 'success' ? 'bg-success-500 shadow-success-500/20' : 
                            toast.type === 'error' ? 'bg-red-500 shadow-red-500/20' : 
                            'bg-amber-500 shadow-amber-500/20'
                        } text-white`}>
                            {toast.type === 'success' ? <Check size={18} className="sm:w-6 sm:h-6" /> : 
                             toast.type === 'error' ? <AlertCircle size={18} className="sm:w-6 sm:h-6" /> : 
                             <Info size={18} className="sm:w-6 sm:h-6" />}
                        </div>
                        <div className="flex-grow min-w-0">
                            <h4 className="text-[9px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">
                                {toast.title || (toast.type === 'success' ? 'Success' : 'Attention Required')}
                            </h4>
                            <p className="text-[12px] sm:text-[14px] font-bold text-gray-900 dark:text-white leading-tight break-words">
                                {toast.message}
                            </p>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)} 
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
