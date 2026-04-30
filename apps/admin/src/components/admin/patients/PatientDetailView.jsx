import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, User, Loader2, Camera } from 'lucide-react';
import { Button } from '../../ui';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

// Modular Components
import ProfileTab from './PatientDetail/ProfileTab';
import RecordsTab from './PatientDetail/RecordsTab';
import AppointmentsTab from './PatientDetail/AppointmentsTab';
import FinancialTab from './PatientDetail/FinancialTab';
import FamilyTab from './PatientDetail/FamilyTab';
import SecurityTab from './PatientDetail/SecurityTab';

// Modals
import EditProfileModal from './PatientDetail/EditProfileModal';
import EditContactModal from './PatientDetail/EditContactModal';
import AddDependencyModal from './PatientDetail/AddDependencyModal';
import EditAvatarModal from './PatientDetail/EditAvatarModal';
import AddPatientModal from './AddPatientModal';

const PatientDetailView = ({ patientId, onBack, activeTab }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    // Core State
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dependents, setDependents] = useState([]);
    
    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
    const [isAddDependencyModalOpen, setIsAddDependencyModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    
    // Action States
    const [loadingLink, setLoadingLink] = useState(false);
    const [linkStatus, setLinkStatus] = useState(null);
    const [isRestricting, setIsRestricting] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const [editFormData, setEditFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        phone: '',
    });

    const fetchPatient = async () => {
        try {
            const data = await api.get(`/admin/patients/${patientId}`, token);
            setPatient(data);
            setEditFormData({
                first_name: data.first_name || '',
                middle_name: data.middle_name || '',
                last_name: data.last_name || '',
                suffix: data.suffix || '',
                email: data.email || '',
                phone: data.phone || '',
            });
            
            // Fetch dependents
            const allPatients = await api.get('/admin/patients', token);
            const filtered = allPatients.patients.filter(p => p.primary_profile_id === patientId);
            setDependents(filtered);
            
        } catch (err) {
            console.error('Failed to fetch patient:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) fetchPatient();
    }, [patientId, token]);

    const handleSaveProfile = async () => {
        try {
            const updated = await api.patch(`/admin/patients/${patientId}`, {
                first_name: editFormData.first_name,
                middle_name: editFormData.middle_name,
                last_name: editFormData.last_name,
                suffix: editFormData.suffix
            }, token);
            setPatient(prev => ({ ...prev, ...updated.patient }));
            setIsEditModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSaveContact = async () => {
        try {
            const updated = await api.patch(`/admin/patients/${patientId}`, {
                email: editFormData.email,
                phone: editFormData.phone
            }, token);
            setPatient(prev => ({ ...prev, ...updated.patient }));
            setIsEditContactModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSaveAvatar = async (avatarUrl) => {
        try {
            const updated = await api.patch(`/admin/patients/${patientId}`, {
                avatar_url: avatarUrl
            }, token);
            setPatient(prev => ({ ...prev, avatar_url: updated.patient.avatar_url }));
        } catch (err) {
            alert(err.message);
            throw err;
        }
    };

    const handleToggleRestriction = async () => {
        setIsRestricting(true);
        try {
            const updated = await api.patch(`/admin/patients/${patientId}/restriction`, {
                restricted: !patient.is_booking_restricted,
                reason: !patient.is_booking_restricted ? 'Restricted by administrator' : null
            }, token);
            setPatient(prev => ({ ...prev, ...updated }));
        } catch (err) {
            alert(err.message);
        } finally {
            setIsRestricting(false);
        }
    };

    const handleDeactivateAccount = async () => {
        const isActive = patient.is_active !== false;
        if (!confirm(`Are you sure you want to ${isActive ? 'DEACTIVATE' : 'REACTIVATE'} this account?`)) return;
        
        setIsDeactivating(true);
        try {
            const response = await api.patch(`/admin/users/${patientId}/deactivate`, {
                active: !isActive
            }, token);
            setPatient(prev => ({ ...prev, is_active: response.is_active }));
        } catch (err) {
            alert(err.message);
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleSendSetupLink = async () => {
        setLoadingLink(true);
        setLinkStatus(null);
        try {
            await api.post(`/admin/patients/${patientId}/send-setup-link`, {}, token);
            setLinkStatus({ type: 'success', message: 'Setup link sent!' });
        } catch (err) {
            setLinkStatus({ type: 'error', message: err.message });
        } finally {
            setLoadingLink(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'appointments', label: 'Appointments' },
        { id: 'records', label: 'Records' },
        { id: 'financial', label: 'Financial' },
        { id: 'family', label: 'Family' },
        { id: 'security', label: 'Security' },
    ];

    if (loading) {
        return (
            <div className='flex items-center justify-center grow bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800'>
                <Loader2 className='animate-spin text-brand-500' size={40} />
            </div>
        );
    }

    if (!patient) return null;

    return (
        <div className='flex flex-col grow min-h-0 bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 overflow-hidden no-scrollbar'>
            {/* Top Navigation */}
            <div className='sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800'>
                <div className='px-4 sm:px-6 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={onBack}
                            className='p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors'
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h3 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight font-outfit'>
                                {patient.full_name}
                            </h3>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1'>
                                Patient Directory
                            </p>
                        </div>
                    </div>
                </div>

                <div className='px-4 sm:px-6 flex items-center gap-6'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/patients/${t.id}/${patient.id}`)}
                            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative ${
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

            <div className='grow overflow-y-auto no-scrollbar'>
                <div className='p-4 sm:p-6 lg:p-8 space-y-6'>
                    {/* Tab Content Router */}
                    <div className='min-h-120 md:min-h-140'>
                        {(!activeTab || activeTab === 'profile') && (
                            <ProfileTab 
                                patient={patient} 
                                onEditAvatar={() => setIsAvatarModalOpen(true)}
                                onEditProfile={() => setIsEditModalOpen(true)}
                                onEditContact={() => setIsEditContactModalOpen(true)}
                            />
                        )}
                        {activeTab === 'appointments' && <AppointmentsTab patient={patient} token={token} />}
                        {activeTab === 'records' && <RecordsTab />}
                        {activeTab === 'financial' && <FinancialTab patient={patient} />}
                        {activeTab === 'family' && (
                            <FamilyTab 
                                patient={patient} 
                                dependents={dependents} 
                                navigate={navigate} 
                                onAddDependent={() => setIsAddDependencyModalOpen(true)}
                            />
                        )}
                        {activeTab === 'security' && (
                            <SecurityTab 
                                patient={patient}
                                loadingLink={loadingLink}
                                linkStatus={linkStatus}
                                isRestricting={isRestricting}
                                isDeactivating={isDeactivating}
                                handleSendSetupLink={handleSendSetupLink}
                                handleToggleRestriction={handleToggleRestriction}
                                handleDeactivateAccount={handleDeactivateAccount}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                formData={editFormData}
                setFormData={setEditFormData}
                onSave={handleSaveProfile}
            />

            <EditContactModal 
                isOpen={isEditContactModalOpen}
                onClose={() => setIsEditContactModalOpen(false)}
                formData={editFormData}
                setFormData={setEditFormData}
                onSave={handleSaveContact}
            />

            <AddDependencyModal 
                isOpen={isAddDependencyModalOpen}
                onClose={() => setIsAddDependencyModalOpen(false)}
                primaryPatient={patient}
                token={token}
                onSuccess={fetchPatient}
            />

            <EditAvatarModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatar={patient.avatar_url}
                onSave={handleSaveAvatar}
            />
        </div>
    );
};

export default PatientDetailView;
