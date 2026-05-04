import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, UserX, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../../ui/Modal';
import Button from '../../../../ui/Button';

const UpcomingActions = ({ onCheckIn, onNoShow, onCancel, onReschedule, onBack, actionLoading, filterMode }) => {
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });

    const openConfirm = (type) => setConfirmModal({ isOpen: true, type });
    const closeConfirm = () => setConfirmModal({ isOpen: false, type: null });

    const handleConfirm = () => {
        if (confirmModal.type === 'check-in') {
            onCheckIn();
        } else if (confirmModal.type === 'no-show') {
            onNoShow();
        } else if (confirmModal.type === 'cancel') {
            onCancel();
        }
        closeConfirm();
    };

    const footer = (
        <>
            <Button variant='outline' onClick={closeConfirm} disabled={actionLoading}>
                Go Back
            </Button>
            <Button 
                onClick={handleConfirm}
                disabled={actionLoading}
                className={`px-8 shadow-lg ${
                    confirmModal.type === 'check-in' ? 'bg-success-600 shadow-success-500/20' : 
                    confirmModal.type === 'cancel' ? 'bg-error-600 shadow-error-500/20' :
                    'bg-red-600 shadow-red-600/20'
                }`}
            >
                {actionLoading ? <Loader2 className='animate-spin' size={18} /> : 'Confirm Action'}
            </Button>
        </>
    );

    return (
        <div className='sm:pt-8 sm:border-t border-gray-100 dark:border-gray-800 flex items-center justify-between sm:relative fixed bottom-0 left-0 right-0 sm:bg-transparent bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sm:p-0 p-4 z-40 sm:border-t-0 border-t'>
            {/* Left Side: Return Action */}
            <button 
                onClick={onBack}
                className='h-10 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 active:scale-95 whitespace-nowrap'
            >
                Return
            </button>

            {/* Right Side: Primary Actions */}
            <div className='flex items-center gap-2 sm:gap-4'>
                {filterMode === 'upcoming' ? (
                    <>
                        <button 
                            onClick={() => openConfirm('cancel')}
                            className='h-10 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all active:scale-95 whitespace-nowrap'
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onReschedule}
                            className='h-10 sm:h-12 px-6 sm:px-12 rounded-xl sm:rounded-2xl bg-brand-500 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 active:scale-95 whitespace-nowrap'
                        >
                            Reschedule
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => openConfirm('no-show')}
                            className='h-10 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all active:scale-95 whitespace-nowrap'
                        >
                            No-Show
                        </button>
                        <button 
                            onClick={() => openConfirm('check-in')}
                            className='h-10 sm:h-12 px-6 sm:px-12 rounded-xl sm:rounded-2xl bg-success-600 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-success-700 transition-all shadow-xl shadow-success-600/20 active:scale-95 whitespace-nowrap'
                        >
                            Check-In
                        </button>
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && createPortal(
                <Modal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirm}
                    title={confirmModal.type === 'check-in' ? 'Patient Check-In' : confirmModal.type === 'cancel' ? 'Cancel Appointment' : 'Mark as No-Show'}
                    subtitle='Are you sure you want to perform this action? This will update the appointment status immediately.'
                    footer={footer}
                    className="max-w-xl"
                >
                    <div className='flex flex-col items-center justify-center py-6 text-center space-y-4'>
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                            confirmModal.type === 'check-in' ? 'bg-success-50 text-success-600' : 'bg-red-50 text-red-600'
                        }`}>
                            {confirmModal.type === 'check-in' ? <CheckCircle2 size={40} /> : confirmModal.type === 'cancel' ? <AlertCircle size={40} /> : <UserX size={40} />}
                        </div>
                        <div>
                            <p className='text-sm text-gray-600 dark:text-gray-400 font-medium'>
                                {confirmModal.type === 'check-in' 
                                    ? 'Checking in will notify the dentist that the patient has arrived.' 
                                    : confirmModal.type === 'cancel' 
                                        ? 'Cancelling this appointment will free up the schedule slot.'
                                        : 'This will flag the patient as a No-Show, affecting their credibility score.'}
                            </p>
                        </div>
                    </div>
                </Modal>,
                document.body
            )}
        </div>
    );
};

export default UpcomingActions;
