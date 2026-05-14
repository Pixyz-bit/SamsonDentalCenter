import React from 'react';
import { Phone, Mail, Clock, AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal';
import Button from '../../ui/Button';

const ReschedulePolicyModal = ({ show, onClose, onConfirm, mode = 'warning' }) => {
    const isWarning = mode === 'warning';

    const title = isWarning ? 'Reschedule Policy' : 'Already Rescheduled';
    const description = isWarning 
        ? "You can only reschedule this appointment once through the portal."
        : "This appointment has already been rescheduled once.";

    return (
        <Modal 
            isOpen={show} 
            onClose={onClose} 
            isBottomSheet={true} 
            className='sm:max-w-[480px] w-full' 
            showCloseButton={false}
        >
            <ModalHeader 
                title={title}
                description={description}
            />

            <ModalBody>
                <div className='space-y-6'>
                    {/* Visual Status Box */}
                    <div className={`p-4 rounded-xl border flex gap-4 ${
                        isWarning 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' 
                            : 'bg-brand-50 dark:bg-brand-500/10 border-brand-100 dark:border-brand-500/20'
                    }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isWarning 
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' 
                                : 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                        }`}>
                            {isWarning ? <AlertTriangle size={20} /> : <Clock size={20} />}
                        </div>
                        <p className='text-[13px] sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-relaxed'>
                            {isWarning 
                                ? "For everyone's convenience, further changes after this reschedule will require contacting our clinic directly."
                                : "For further adjustments, please reach out to our medical team through the contact details provided below."
                            }
                        </p>
                    </div>

                    {/* Contact Information Card */}
                    {!isWarning && (
                        <div className='space-y-4'>
                            <label className='text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1'>
                                Direct Contact
                            </label>
                            <div className='bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden'>
                                <a 
                                    href='tel:09123456789'
                                    className='flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors group'
                                >
                                    <div className='w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors shadow-sm'>
                                        <Phone size={16} />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>Call Us</span>
                                        <span className='text-sm sm:text-base font-bold text-gray-900 dark:text-white'>09123456789</span>
                                    </div>
                                </a>
                                <a 
                                    href='mailto:samsondentalcenter@gmail.com'
                                    className='flex items-center gap-4 p-4 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors group'
                                >
                                    <div className='w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-brand-500 transition-colors shadow-sm'>
                                        <Mail size={16} />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>Email Us</span>
                                        <span className='text-sm sm:text-base font-bold text-gray-900 dark:text-white'>samsondentalcenter@gmail.com</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button 
                    variant='outline' 
                    onClick={onClose}
                    className='flex-1 h-12 rounded-xl font-bold text-[14px] sm:text-base'
                >
                    {isWarning ? 'Go Back' : 'Close'}
                </Button>
                {isWarning && (
                    <Button 
                        onClick={onConfirm}
                        className='flex-1 h-12 rounded-xl bg-brand-500 text-white font-bold text-[14px] sm:text-base shadow-lg shadow-brand-500/20'
                    >
                        Continue
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default ReschedulePolicyModal;
