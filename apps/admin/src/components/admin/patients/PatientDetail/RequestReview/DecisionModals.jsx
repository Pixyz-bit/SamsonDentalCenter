import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../../ui/Modal';
import Button from '../../../../ui/Button';

const DecisionModals = ({ 
    isOpen, 
    type, 
    onClose, 
    onConfirm, 
    actionLoading 
}) => {
    const [note, setNote] = useState('');
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    const rejectionReasons = [
        "Doctor Unavailable / Schedule Conflict",
        "Requested Service Not Available for Selected Slot",
        "Patient Needs Preliminary Check-up First",
        "Clinic Holiday or Maintenance",
        "Other"
    ];

    if (!isOpen) return null;

    const isApprove = type === 'approve';
    const finalReason = reason === 'Other' ? otherReason : reason;

    const footer = (
        <>
            <Button variant='outline' onClick={onClose} disabled={actionLoading}>
                Go Back
            </Button>
            <Button 
                onClick={() => onConfirm(isApprove ? note : finalReason)}
                disabled={actionLoading || (!isApprove && !finalReason)}
                className={`px-8 shadow-lg ${
                    isApprove ? 'bg-brand-500 shadow-brand-500/20' : 'bg-red-600 shadow-red-600/20'
                }`}
            >
                {actionLoading ? <Loader2 className='animate-spin' size={18} /> : isApprove ? 'Approve Appointment' : 'Confirm Rejection'}
            </Button>
        </>
    );

    const sidebar = (
        <div className='flex flex-col items-center gap-6'>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isApprove ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600'
            }`}>
                {isApprove ? <Check size={24} /> : <AlertCircle size={24} />}
            </div>
        </div>
    );

    const modalContent = (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isApprove ? 'Approve Request' : 'Reject Request'}
            subtitle={isApprove ? 'Finalize this booking and notify the patient.' : 'Provide a reason for the rejection.'}
            footer={footer}
            className="max-w-2xl"
        >
            <div className='space-y-6'>
                {isApprove ? (
                    <div className='space-y-4'>
                        <div className='p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10'>
                            <p className='text-sm text-brand-700 dark:text-brand-300 font-medium leading-relaxed'>
                                You are about to confirm this appointment. The patient will receive a notification with the approval and any notes you provide below.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Approval Notes (Optional)</label>
                            <textarea
                                placeholder='Type any instructions or special notes for the patient...'
                                className='w-full h-40 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all'
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        <div className='p-4 rounded-2xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10'>
                            <p className='text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed'>
                                Rejecting this request will remove it from the pending list. Please specify the reason so the patient understands the decision.
                            </p>
                        </div>
                        <div className='grid grid-cols-1 gap-3'>
                            {rejectionReasons.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`p-4 rounded-2xl border text-sm font-bold text-left transition-all ${
                                        reason === r 
                                            ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' 
                                            : 'bg-white dark:bg-white/5 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-red-200'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        {reason === 'Other' && (
                            <div className='space-y-2 animate-in slide-in-from-top-2'>
                                <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Specific Reason</label>
                                <textarea
                                    placeholder='Specify the exact reason for rejection...'
                                    className='w-full h-32 p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none'
                                    onChange={(e) => setOtherReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );

    return createPortal(modalContent, document.body);
};

export default DecisionModals;
