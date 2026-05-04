import React from 'react';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import { Button, Modal } from '../ui';

const SessionExpiredModal = ({ isOpen, onClose }) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            className="max-w-md"
        >
            <div className="flex flex-col items-center text-center p-2">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-6 relative">
                    <ShieldAlert size={40} />
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md border border-red-100 dark:border-red-900/30">
                        <Lock size={16} className="text-red-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                    Session Expired
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                    Your session has expired due to inactivity or security verification. Please log in again to continue managing the clinic.
                </p>

                <div className="w-full">
                    <Button 
                        onClick={onClose}
                        className="w-full h-14 rounded-2xl bg-brand-500 text-white font-black hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                    >
                        <LogIn size={18} />
                        Go to Login
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SessionExpiredModal;
