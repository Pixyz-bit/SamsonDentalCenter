import React, { useState } from 'react';
import DecisionModals from './DecisionModals';

const DecisionActions = ({ onApprove, onReject, onCancel, actionLoading }) => {
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });

    const openModal = (type) => setModalConfig({ isOpen: true, type });
    const closeModal = () => setModalConfig({ isOpen: false, type: null });

    const handleConfirm = (data) => {
        if (modalConfig.type === 'approve') {
            onApprove(data);
        } else {
            onReject(data);
        }
    };

    return (
        <div className='sm:pt-8 sm:border-t border-gray-100 dark:border-gray-800 flex items-center justify-between sm:relative fixed bottom-0 left-0 right-0 sm:bg-transparent bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sm:p-0 p-4 z-40 sm:border-t-0 border-t'>
            {/* Left Side: Return Action */}
            <button 
                onClick={onCancel}
                className='h-10 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 active:scale-95 whitespace-nowrap'
            >
                Return
            </button>

            {/* Right Side: Primary Actions */}
            <div className='flex items-center gap-2 sm:gap-4'>
                <button 
                    onClick={() => openModal('reject')}
                    className='h-10 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all active:scale-95 whitespace-nowrap'
                >
                    Reject
                </button>
                <button 
                    onClick={() => openModal('approve')}
                    className='h-10 sm:h-12 px-6 sm:px-12 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 active:scale-95 whitespace-nowrap'
                >
                    Approve
                </button>
            </div>

            {/* Popups */}
            <DecisionModals 
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                onClose={closeModal}
                onConfirm={handleConfirm}
                actionLoading={actionLoading}
            />
        </div>
    );
};

export default DecisionActions;
