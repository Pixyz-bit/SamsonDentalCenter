import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import EditRegistryModal from '../../components/doctor/profile/EditRegistryModal';
import UpdateLineModal from '../../components/doctor/profile/UpdateLineModal';

const ProfilePage = () => {
    // State for user data
    const [userData, setUserData] = useState({
        name: 'Dr. Samson',
        first_name: 'SddADAADASDAS',
        last_name: 'Samson',
        middle_name: 'asd',
        suffix: '',
        role: 'Specialized Dentist',
        license_number: 'LIC-002',
        status: 'Active',
        bio: 'Dedicated dental specialist with over 10 years of experience in restorative and cosmetic dentistry. Committed to providing the highest quality of patient care.',
        email: 'dentist2@example.com',
        phone: '09465672101',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdateLineModalOpen, setIsUpdateLineModalOpen] = useState(false);

    const handleSaveRegistry = (newData) => {
        setUserData(prev => ({
            ...prev,
            ...newData,
            fullName: `${newData.first_name} ${newData.middle_name ? newData.middle_name + ' ' : ''}${newData.last_name}${newData.suffix ? ' ' + newData.suffix : ''}`
        }));
        setIsEditModalOpen(false);
    };

    const handleUpdateLine = (newData) => {
        setUserData(prev => ({ ...prev, ...newData }));
        setIsUpdateLineModalOpen(false);
    };

    const fullName = `${userData.first_name} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name}${userData.suffix ? ' ' + userData.suffix : ''}`;

    return (
        <div className="flex flex-col h-full">
            <PageBreadcrumb pageTitle="My Profile" />

            {/* ── Profile Header Card ── */}
            <div className="p-4 sm:p-6 border border-gray-300 rounded-3xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-5 xl:flex-row xl:items-center">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xl sm:text-2xl shadow-inner">
                                <img 
                                    alt={fullName} 
                                    className="w-full h-full object-cover" 
                                    src={userData.avatar} 
                                />
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="order-3 xl:order-2 text-center xl:text-left">
                            <h4 className="mb-1 text-lg sm:text-2xl font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight">
                                {fullName}
                            </h4>
                            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2.5">
                                <p className="text-[9px] sm:text-[11px] text-brand-600 dark:text-brand-400 font-black uppercase tracking-widest">
                                    {userData.role}
                                </p>
                                <div className="hidden h-3 w-px bg-gray-300 dark:bg-gray-700 sm:block"></div>
                                <div className="text-[9px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2">
                                    <span>License: <span className="text-gray-900 dark:text-white font-black">{userData.license_number}</span></span>
                                    <div className="h-3 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                                        Status : {userData.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-3 max-w-2xl font-medium leading-relaxed">
                                {userData.bio}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 h-9 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest w-full sm:w-[160px] hover:border-brand-500 hover:text-brand-500 transition-all font-outfit shadow-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                        >
                            Edit Registry
                        </button>
                    </div>
                </div>

                {/* ── Contact Info Footer ── */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-8">
                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                <Mail size={14} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Clinical Email</p>
                                <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{userData.email}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                <Phone size={14} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Emergency Line</p>
                                <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{userData.phone}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsUpdateLineModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg transition h-9 sm:h-10 px-5 text-[10px] font-black uppercase tracking-widest shadow-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                    >
                        Update Line
                    </button>
                </div>
            </div>

            {/* ── Modals ── */}
            <EditRegistryModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={userData}
                onSave={handleSaveRegistry}
            />
            <UpdateLineModal 
                isOpen={isUpdateLineModalOpen}
                onClose={() => setIsUpdateLineModalOpen(false)}
                initialData={{ email: userData.email, phone: userData.phone }}
                onSave={handleUpdateLine}
            />
        </div>
    );
};

export default ProfilePage;
