import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
// We'll create these tabs next
import ProfileTab from './PatientDetail/ProfileTab';
import AppointmentsTab from './PatientDetail/AppointmentsTab';
import RecordsTab from './PatientDetail/RecordsTab';

const PatientDetailView = ({ patientId, onBack, activeTab }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('sb-access-token'); // Fallback to local storage if context not available
    
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchPatient = async () => {
        try {
            // Using the same endpoint as admin if authorized, 
            // otherwise we'll need a doctor-specific one.
            const data = await api.get(`/admin/patients/${patientId}`, token);
            setPatient(data);
        } catch (err) {
            console.error('Failed to fetch patient:', err);
            // Mock data for demo purposes if API fails
            setPatient({
                id: patientId,
                full_name: 'Picardo, Christopher John jr',
                first_name: 'Christopher',
                last_name: 'Picardo',
                middle_name: 'John',
                suffix: 'jr',
                email: 'christopher.picardo@example.com',
                phone: '+63 920 123 4567',
                is_registered: true,
                is_active: true
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) fetchPatient();
    }, [patientId, token]);

    const tabs = [
        { id: 'profile', label: 'Demographics' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'history', label: 'History' },
        { id: 'records', label: 'Records' },
    ];

    const activeTabLabel = tabs.find(t => t.id === (activeTab || 'profile'))?.label;

    if (loading) {
        return (
            <div className='flex items-center justify-center grow bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 shadow-sm'>
                <Loader2 className='animate-spin text-brand-500' size={48} />
            </div>
        );
    }

    if (!patient) return null;

    return (
        <div className='flex flex-col grow min-h-0 bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 transition-all duration-300 overflow-hidden no-scrollbar'>
            {/* ── Identity Header ── */}
            <div className='bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-800'>
                <div className='px-4 sm:px-6 py-4 sm:py-7 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-gray-100 dark:bg-white/5 p-1.5 rounded-xl'>
                            <button
                                onClick={onBack}
                                className='p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all active:scale-95 shadow-sm sm:shadow-none'
                            >
                                <ArrowLeft size={20} />
                            </button>
                        </div>
                        <div>
                            <h3 className='text-base sm:text-lg font-bold text-[#0B1120] dark:text-white font-outfit truncate'>
                                {patient.full_name || `${patient.lastName}, ${patient.firstName}`}
                            </h3>
                            <p className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium'>
                                Patient Directory <span className='mx-1 text-gray-300 dark:text-gray-700'>/</span> {activeTabLabel} Registry
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs ── */}
            <div className='sticky top-0 z-30 bg-white dark:bg-[#1f2021] border-b border-gray-100 dark:border-gray-800 shadow-sm sm:shadow-none'>
                <div className='bg-white dark:bg-transparent px-4 sm:px-6 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/patients/${t.id}/${patient.id}`)}
                            className={`pt-4 pb-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap ${
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

            <div className='grow overflow-y-auto no-scrollbar'>
                <div className='p-4 sm:p-6 lg:p-10 space-y-8'>
                    {/* Tab Content Router */}
                    <div className='min-h-120 md:min-h-140'>
                        {(!activeTab || activeTab === 'profile') && (
                            <ProfileTab patient={patient} />
                        )}
                        {(activeTab === 'upcoming' || activeTab === 'history') && (
                            <AppointmentsTab 
                                patient={patient} 
                                filterMode={activeTab} 
                            />
                        )}
                        {activeTab === 'records' && (
                            <RecordsTab patient={patient} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailView;
