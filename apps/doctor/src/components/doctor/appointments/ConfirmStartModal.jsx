import React from 'react';
import { Stethoscope } from 'lucide-react';
import { Modal, Button } from '../../ui';

/**
 * Confirmation modal for starting a dental treatment.
 * Design follows the premium clinician-facing high-fidelity system.
 */
const ConfirmStartModal = ({ isOpen, onClose, onConfirm, appointment }) => {
    if (!appointment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6 sm:p-8 space-y-6 relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 shadow-sm border border-brand-500/20">
                            <Stethoscope size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-outfit leading-tight">
                                Start Treatment
                            </h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                Ref: {appointment.id.substring(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 shadow-inner">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</span>
                                <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                    {appointment.patient?.name || 'Unknown Patient'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Time Slot</span>
                                <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                                    {appointment.start_time}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Clinical Procedure</span>
                            <span className="text-sm font-bold text-brand-500">
                                {appointment.service}
                            </span>
                        </div>
                    </div>

                    <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Confirming this will update the patient status to 
                        <span className="text-amber-500 font-bold mx-1">In Progress</span>. 
                        This action notifies the administrative desk that the clinical session has officially commenced.
                    </p>
                </div>

                <div className="flex gap-3 pt-2 relative z-10">
                    <Button variant="outline" onClick={onClose} className="flex-1 font-bold py-3 text-gray-500">
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => {
                            onConfirm(appointment.id);
                            onClose();
                        }} 
                        className="flex-1 font-bold py-3 bg-brand-500 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
                    >
                        Confirm Start
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmStartModal;
