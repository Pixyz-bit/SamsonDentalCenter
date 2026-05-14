import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Check, Upload } from 'lucide-react';

const EditRegistryModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData || {
        first_name: 'SddADAADASDAS',
        last_name: 'Samson',
        middle_name: 'asd',
        suffix: '',
        license_number: 'LIC-002',
        status: 'Active',
        bio: 'as',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
    });

    const avatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = (avatar) => {
        setFormData(prev => ({ ...prev, avatar }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div id="modal-scroll-body" className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-gray-900">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-xl bg-white p-4 dark:bg-gray-900 sm:p-6 max-h-[90vh]">
                    <div className="mb-6">
                        <h4 className="text-base sm:text-xl font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight">
                            Profile Registry
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider font-bold">
                            Authorized Credential Updates
                        </p>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* Avatar Selection Column */}
                            <div className="lg:col-span-4 flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-brand-500/20 dark:border-brand-500/30 flex items-center justify-center bg-gray-50 dark:bg-white/[0.02] shadow-inner transition-transform group-hover:scale-[1.02]">
                                        <img alt="Profile" className="w-full h-full object-cover" src={formData.avatar} />
                                    </div>
                                </div>
                                
                                <div className="w-full">
                                    <label className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 block text-center">
                                        <span>Available Profiles</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3 px-1">
                                        {avatars.map((avatar, index) => (
                                            <button 
                                                key={index}
                                                type="button" 
                                                onClick={() => handleAvatarSelect(avatar)}
                                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all p-1 group active:scale-95 ${formData.avatar === avatar ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-200'}`}
                                            >
                                                <img alt={`Avatar ${index}`} className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-300" src={avatar} />
                                                {formData.avatar === avatar && (
                                                    <div className="absolute top-1 right-1 bg-brand-500 text-white rounded-full p-0.5 shadow-sm scale-75">
                                                        <Check size={12} strokeWidth={2.5} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                        <button type="button" className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-all group active:scale-95 p-1">
                                            <Upload size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[7px] font-bold uppercase">Custom</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields Column */}
                            <div className="lg:col-span-8 flex flex-col">
                                <div className="space-y-3.5 flex flex-col h-full">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-1">
                                            <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                                <span>Last Name</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="Last Name" 
                                                    className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-bold bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                                    required 
                                                    type="text" 
                                                    value={formData.last_name} 
                                                    name="last_name"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                                <span>First Name</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="First Name" 
                                                    className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-bold bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                                    required 
                                                    type="text" 
                                                    value={formData.first_name} 
                                                    name="first_name"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                                <span>Middle Name</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="Middle Name" 
                                                    className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-bold bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                                    type="text" 
                                                    value={formData.middle_name} 
                                                    name="middle_name"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                                <span>Suffix</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="Jr., III, etc." 
                                                    className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-bold bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                                    type="text" 
                                                    value={formData.suffix} 
                                                    name="suffix"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-0.5 items-end">
                                        <div className="col-span-1">
                                            <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                                <span>License Number</span>
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    placeholder="XXXX-XXXX" 
                                                    className="h-10 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-medium bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800" 
                                                    required 
                                                    type="text" 
                                                    value={formData.license_number} 
                                                    name="license_number"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                                <span>Doctor Status</span>
                                            </label>
                                            <div className="h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
                                                    {formData.status}
                                                </span>
                                                <label className="flex items-center cursor-pointer group">
                                                    <div className="relative">
                                                        <input 
                                                            className="sr-only" 
                                                            type="checkbox" 
                                                            checked={formData.status === 'Active'}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full transition-colors border ${formData.status === 'Active' ? 'bg-brand-500 border-brand-600' : 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${formData.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-grow">
                                        <label className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                                            <span>Professional Bio</span>
                                        </label>
                                        <textarea 
                                            name="bio" 
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="w-full flex-grow rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all no-scrollbar overflow-y-auto min-h-[80px]" 
                                            placeholder="Brief professional background..."
                                        />
                                    </div>
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

export default EditRegistryModal;
