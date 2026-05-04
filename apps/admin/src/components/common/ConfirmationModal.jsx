import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Are you sure?', 
    message = 'This action cannot be undone.', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    variant = 'danger', // danger, warning, info
    isLoading = false
}) => {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
            button: 'bg-red-600 hover:bg-red-700 text-white',
            bg: 'bg-red-50 dark:bg-red-900/20'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        }
    };

    const currentVariant = variants[variant] || variants.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${currentVariant.bg}`}>
                            {currentVariant.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${currentVariant.button} disabled:opacity-50 flex items-center`}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Processing...
                            </>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
