import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import ClinicRulesSettings from '../../components/admin/settings/ClinicRulesSettings';
import ClinicWebsiteSettings from '../../components/admin/settings/ClinicWebsiteSettings';
import ClinicNotificationsSettings from '../../components/admin/settings/ClinicNotificationsSettings';
import ClinicLegalSettings from '../../components/admin/settings/ClinicLegalSettings';
import ClinicHolidaysSettings from '../../components/admin/settings/ClinicHolidaysSettings';
import SystemHealthSettings from '../../components/admin/settings/SystemHealthSettings';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const activeTab = tab || 'website';

    const tabs = [
        { id: 'website', label: 'Website Configuration', allowedRoles: ['admin', 'secretary'] },
        { id: 'rules', label: 'Global Rules', allowedRoles: ['admin'] },
        { id: 'notifications', label: 'Automated Notifications', allowedRoles: ['admin'] },
        { id: 'legal', label: 'Legal & Policy', allowedRoles: ['admin'] },
        { id: 'holidays', label: 'Clinic Holidays', allowedRoles: ['admin', 'secretary'] },
        { id: 'health', label: 'System Health', allowedRoles: ['admin'] }
    ].filter(t => t.allowedRoles.includes(user?.role));

    return (
        <div className='flex flex-col h-full'>
            <PageBreadcrumb pageTitle="Clinic Settings" className='mb-4' />

            <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden'>
                {/* ── A. Identity Header (Doctor Style) ── */}
                <div className='bg-white dark:bg-transparent border-b border-gray-200 dark:border-gray-700'>
                    <div className='px-4 sm:px-6 py-4 sm:py-7 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='bg-gray-100 dark:bg-white/5 p-1.5 rounded-xl'>
                                <button
                                    onClick={() => navigate('/')}
                                    className='p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all active:scale-95 shadow-sm sm:shadow-none'
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            </div>
                            <div>
                                <h3 className='text-[clamp(14px,1.5vw,18px)] font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit leading-tight'>
                                    Clinic Settings
                                </h3>
                                <p className='text-[clamp(9px,1vw,10px)] font-black text-brand-500 dark:text-brand-400 uppercase tracking-[0.15em] mt-1'>
                                    {tabs.find(t => t.id === activeTab)?.label} Configuration Registry
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── B. Navigation Tabs (Doctor Style) ── */}
                <div className='sticky top-0 z-30 bg-white dark:bg-[#1f2021] border-b border-gray-200 dark:border-gray-700 shadow-sm sm:shadow-none'>
                    <div className='bg-white dark:bg-transparent px-4 sm:px-6 flex items-center gap-[clamp(20px,3vw,32px)] overflow-x-auto no-scrollbar'>
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => navigate(`/settings/${t.id}`)}
                                className={`pt-4 pb-3 text-[clamp(9px,1.1vw,11px)] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap ${
                                    activeTab === t.id
                                        ? 'text-brand-500'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            >
                                {t.label}
                                {activeTab === t.id && (
                                    <div className='absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full' />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── C. Content Area ── */}
                <div className='flex-grow overflow-y-auto no-scrollbar'>
                    <div className='p-4 sm:p-6 lg:p-8 w-full'>
                        {activeTab === 'website' && <ClinicWebsiteSettings />}
                        {activeTab === 'rules' && <ClinicRulesSettings />}
                        {activeTab === 'notifications' && <ClinicNotificationsSettings />}
                        {activeTab === 'legal' && <ClinicLegalSettings />}
                        {activeTab === 'holidays' && <ClinicHolidaysSettings />}
                        {activeTab === 'health' && <SystemHealthSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
