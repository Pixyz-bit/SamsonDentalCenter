import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            <div className='sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6'>
                <div className='py-4'>
                    <PageBreadcrumb pageTitle={`Settings: ${tabs.find(t => t.id === activeTab)?.label || 'Clinic'}`} />
                </div>
                
                {/* Internal Sub-tabs */}
                <div className='flex items-center gap-6 overflow-x-auto no-scrollbar'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/settings/${t.id}`)}
                            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                                activeTab === t.id 
                                    ? 'text-brand-500' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        >
                            {t.label}
                            {activeTab === t.id && (
                                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full' />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className='flex-grow no-scrollbar'>
                <div className='w-full'>
                    {activeTab === 'website' && <ClinicWebsiteSettings />}
                    {activeTab === 'rules' && <ClinicRulesSettings />}
                    {activeTab === 'notifications' && <ClinicNotificationsSettings />}
                    {activeTab === 'legal' && <ClinicLegalSettings />}
                    {activeTab === 'holidays' && <ClinicHolidaysSettings />}
                    {activeTab === 'health' && <SystemHealthSettings />}
                </div>
            </div>
        </div>
    );
};

export default Settings;
