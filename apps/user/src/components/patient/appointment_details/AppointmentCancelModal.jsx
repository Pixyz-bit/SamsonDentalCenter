import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal';
import Button from '../../ui/Button';
import { AlertCircle, MessageSquare } from 'lucide-react';

const CANCEL_REASONS = [
    "Schedule conflict",
    "Feeling unwell",
    "Personal emergency",
    "Transportation issues",
    "Other"
];

const AppointmentCancelModal = ({ show, onClose, cancelReason, setCancelReason, rawId, cancelling, handleCancel, isPending, isLate, serviceName }) => {
    const [reasonType, setReasonType] = useState("");
    const [showOthers, setShowOthers] = useState(false);

    useEffect(() => {
        if (show) {
            setReasonType("");
            setShowOthers(false);
            setCancelReason("");
        }
    }, [show, setCancelReason]);

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setReasonType(val);
        if (val === "Other") {
            setShowOthers(true);
            setCancelReason("");
        } else {
            setShowOthers(false);
            setCancelReason(val);
        }
    };

    const isReady = reasonType !== "" && (!showOthers || (showOthers && cancelReason.trim().length > 0));

    // Conditional Content
    const title = isPending ? "Withdraw Booking Request?" : "Cancel Approved Appointment?";
    const description = isPending 
        ? `Are you sure you want to cancel your pending request for ${serviceName}? This will remove your submission from our verification queue.`
        : `Are you sure you want to cancel your upcoming ${serviceName}?`;
    
    const confirmLabel = isPending ? "Confirm Withdrawal" : "Confirm Cancellation";
    const cancelLabel = isPending ? "Keep Request" : "Keep Appointment";

    return (
        <Modal isOpen={show} onClose={onClose} isBottomSheet={true} className='sm:max-w-[500px] w-full' showCloseButton={false}>
            <ModalHeader 
                title={title}
                description={description}
                onClose={onClose}
                icon={
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isPending 
                            ? 'bg-warning-50 dark:bg-warning-500/10 text-warning-500' 
                            : isLate
                                ? 'bg-error-50 dark:bg-error-500/10 text-error-500'
                                : 'bg-info-50 dark:bg-info-500/10 text-info-500'
                    }`}>
                        <AlertCircle size={24} />
                    </div>
                }
            />

            <ModalBody>
                <div className='space-y-6'>
                    {/* Policy Notice Box */}
                    {isPending ? (
                        <div className='bg-warning-50 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-500/20 rounded-xl p-4 space-y-2'>
                            <div className='flex items-center gap-2 text-warning-700 dark:text-warning-400 font-black text-[11px] uppercase tracking-wider'>
                                <AlertCircle size={14} />
                                Fair Use Notice
                            </div>
                            <p className='text-[12px] font-semibold text-warning-600 dark:text-warning-300 leading-relaxed'>
                                Repeatedly creating and withdrawing requests holds up slots for other patients. Frequent withdrawals will restrict your online booking access, forcing manual phone verification for future appointments.
                            </p>
                        </div>
                    ) : isLate ? (
                        <div className='bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20 rounded-xl p-4 space-y-2'>
                            <div className='flex items-center gap-2 text-error-700 dark:text-error-400 font-black text-[11px] uppercase tracking-wider'>
                                <AlertCircle size={14} />
                                Late Cancellation Policy
                            </div>
                            <p className='text-[12px] font-semibold text-error-600 dark:text-error-300 leading-relaxed'>
                                This slot was locked exclusively for you. To maintain fair scheduling, canceling approved sessions on short notice will restrict your account from booking online, requiring you to visit or call the clinic manually.
                            </p>
                        </div>
                    ) : (
                        <div className='bg-info-50 dark:bg-info-500/10 border border-info-100 dark:border-info-500/20 rounded-xl p-4 space-y-2'>
                            <div className='flex items-center gap-2 text-info-700 dark:text-info-400 font-black text-[11px] uppercase tracking-wider'>
                                <AlertCircle size={14} />
                                Advance Notice
                            </div>
                            <p className='text-[12px] font-semibold text-info-600 dark:text-info-300 leading-relaxed'>
                                Thank you for notifying us in advance. Canceling your appointment now allows other patients to use this slot. We hope to see you again soon!
                            </p>
                        </div>
                    )}

                    {/* Reason Selection */}
                    <div className='space-y-3'>
                        <label className='text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block px-1'>
                            Reason for Cancellation
                        </label>
                        
                        <div className='relative group'>
                            <select
                                value={reasonType}
                                onChange={handleTypeChange}
                                disabled={cancelling}
                                className={`w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent text-gray-900 dark:text-white px-4 py-3.5 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-500 transition-all appearance-none outline-none shadow-theme-sm ${
                                    !reasonType ? 'text-gray-400 dark:text-gray-600' : ''
                                }`}
                            >
                                <option value="" disabled>Choose a reason...</option>
                                {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>
                        </div>

                        {showOthers && (
                            <div className='space-y-2 animate-[fadeIn_0.2s_ease-out] mt-4'>
                                <div className='flex items-center justify-between px-1'>
                                    <label className='flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>
                                        <MessageSquare size={14} />
                                        Please specify
                                    </label>
                                    <span className='text-[10px] text-gray-400 font-bold'>{cancelReason.length}/300</span>
                                </div>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    disabled={cancelling}
                                    placeholder='Briefly tell us why...'
                                    rows={3}
                                    maxLength={300}
                                    className='w-full px-5 py-3 border border-gray-100 dark:border-gray-800 rounded-xl text-[14px] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-all shadow-theme-sm'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="flex w-full gap-3 px-6 pb-6">
                <Button 
                    variant='outline' 
                    onClick={onClose} 
                    disabled={cancelling}
                    className="flex-1 h-12 rounded-xl font-black text-[11px] sm:text-sm"
                >
                    {cancelLabel}
                </Button>
                <Button 
                    onClick={handleCancel}
                    disabled={cancelling || !isReady || (showOthers && cancelReason.trim().length < 2)}
                    className={`flex-1 h-12 text-white rounded-xl font-black text-[11px] sm:text-sm shadow-lg transition-all ${
                        isPending 
                            ? 'bg-warning-500 hover:bg-warning-600 shadow-warning-500/20' 
                            : isLate
                                ? 'bg-error-500 hover:bg-error-600 shadow-error-500/20'
                                : 'bg-info-500 hover:bg-info-600 shadow-info-500/20'
                    }`}
                >
                    {cancelling ? (
                        <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    ) : (
                        confirmLabel
                    )}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AppointmentCancelModal;
