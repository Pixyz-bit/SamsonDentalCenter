import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';

const UpdateLineModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData || {
        email: 'dentist2@example.com',
        phone: '09465672101'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div id="modal-scroll-body" className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-gray-900">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-xl bg-white p-4 dark:bg-gray-900 sm:p-6">
                    <div className="mb-6">
                        <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight">
                            Communication Registry
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider font-bold">
                            Authorized Channel Updates
                        </p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="mb-1.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                                    <span>Work Email Address</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        placeholder="doctor@primeradental.com" 
                                        className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-bold bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                        required 
                                        type="email" 
                                        value={formData.email} 
                                        name="email"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-1.5 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                                    <span>Primary Contact Number</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        placeholder="+63 9XX" 
                                        className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-bold bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                        required 
                                        type="text" 
                                        value={formData.phone} 
                                        name="phone"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-4 pt-6 border-t border-gray-200 dark:border-gray-800 sm:justify-end">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center gap-2 transition flex-1 sm:flex-none px-6 h-9 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 transition flex-1 sm:flex-none px-8 h-9 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:bg-brand-300"
                            >
                                Save Registry
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default UpdateLineModal;
