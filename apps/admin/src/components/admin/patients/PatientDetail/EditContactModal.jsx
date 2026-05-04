import React from 'react';
import { Mail, Phone, Save } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui';

const EditContactModal = ({ isOpen, onClose, formData, setFormData, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const footer = (
        <>
            <Button variant='outline' onClick={onClose} className="h-9 sm:h-10 px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl">
                Cancel
            </Button>
            <Button onClick={onSave} className="h-9 sm:h-10 px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-500/20">
                <Save size={14} className="mr-2" />
                Save Changes
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Contact Details"
            subtitle="Update email and phone number."
            footer={footer}
            className="max-w-lg"
        >
            <div className='space-y-4'>
                <div className='space-y-3'>
                    <div>
                        <label className='text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block'>Email Address</label>
                        <div className='relative'>
                            <Mail size={14} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder='example@mail.com'
                                className='w-full h-10 pl-11 pr-4 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-[13px] text-gray-900 dark:text-white font-bold'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block'>Phone Number</label>
                        <div className='relative'>
                            <Phone size={14} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                            <input
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder='09XX XXX XXXX'
                                className='w-full h-10 pl-11 pr-4 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-[13px] text-gray-900 dark:text-white font-bold'
                            />
                        </div>
                    </div>
                </div>

                <div className='p-3 rounded-xl bg-brand-50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10'>
                    <p className='text-[9px] text-brand-700 dark:text-brand-400 font-bold uppercase tracking-widest leading-relaxed'>
                        Updating the email affects remiders and portal access.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default EditContactModal;
