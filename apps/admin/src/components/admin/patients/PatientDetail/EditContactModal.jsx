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
            <Button variant='outline' onClick={onClose} className="px-8">
                Cancel
            </Button>
            <Button onClick={onSave} className="px-8 shadow-lg shadow-brand-500/20">
                <Save size={18} className="mr-2" />
                Save Changes
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Contact Details"
            subtitle="Update the patient's email and primary phone number."
            footer={footer}
            className="max-w-xl"
        >
            <div className='space-y-6'>
                <div className='space-y-4'>
                    <div>
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Email Address</label>
                        <div className='relative'>
                            <Mail size={18} className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400' />
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder='example@mail.com'
                                className='w-full h-14 pl-14 pr-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Phone Number</label>
                        <div className='relative'>
                            <Phone size={18} className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400' />
                            <input
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder='09XX XXX XXXX'
                                className='w-full h-14 pl-14 pr-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                            />
                        </div>
                    </div>
                </div>

                <div className='p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10'>
                    <p className='text-[10px] text-brand-700 dark:text-brand-400 font-black uppercase tracking-widest leading-relaxed'>
                        Important: Updating the email will affect where the patient receives appointment reminders and portal access links.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default EditContactModal;
