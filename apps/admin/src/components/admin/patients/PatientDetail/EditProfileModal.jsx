import React from 'react';
import { User, Save, X } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui';

const EditProfileModal = ({ isOpen, onClose, formData, setFormData, onSave }) => {
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
            title="Edit Identity"
            subtitle="Update legal naming conventions."
            footer={footer}
            className="max-w-lg"
        >
            <div className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className='text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block'>First Name</label>
                        <input
                            type='text'
                            name='first_name'
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder='First name'
                            className='w-full h-10 px-4 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-[13px] text-gray-900 dark:text-white font-bold'
                        />
                    </div>
                    <div>
                        <label className='text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block'>Last Name</label>
                        <input
                            type='text'
                            name='last_name'
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder='Last name'
                            className='w-full h-10 px-4 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-[13px] text-gray-900 dark:text-white font-bold'
                        />
                    </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className='text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block'>Middle Name</label>
                        <input
                            type='text'
                            name='middle_name'
                            value={formData.middle_name}
                            onChange={handleInputChange}
                            placeholder='Optional'
                            className='w-full h-10 px-4 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-[13px] text-gray-900 dark:text-white font-bold'
                        />
                    </div>
                    <div>
                        <label className='text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block'>Suffix</label>
                        <input
                            type='text'
                            name='suffix'
                            value={formData.suffix}
                            onChange={handleInputChange}
                            placeholder='Jr., III'
                            className='w-full h-10 px-4 rounded-xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-[13px] text-gray-900 dark:text-white font-bold'
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditProfileModal;
