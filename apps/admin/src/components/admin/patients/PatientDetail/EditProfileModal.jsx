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
            title="Edit Personal Identity"
            subtitle="Update the patient's legal name and suffixes."
            footer={footer}
            className="max-w-xl"
        >
            <div className='space-y-6'>
                <div className='space-y-4'>
                    <div>
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>First Name</label>
                        <input
                            type='text'
                            name='first_name'
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder='Enter first name'
                            className='w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                        />
                    </div>

                    <div>
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Middle Name (Optional)</label>
                        <input
                            type='text'
                            name='middle_name'
                            value={formData.middle_name}
                            onChange={handleInputChange}
                            placeholder='Enter middle name'
                            className='w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                        />
                    </div>

                    <div>
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Last Name</label>
                        <input
                            type='text'
                            name='last_name'
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder='Enter last name'
                            className='w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                        />
                    </div>

                    <div>
                        <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Suffix (Optional)</label>
                        <input
                            type='text'
                            name='suffix'
                            value={formData.suffix}
                            onChange={handleInputChange}
                            placeholder='e.g. Jr., III'
                            className='w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditProfileModal;
