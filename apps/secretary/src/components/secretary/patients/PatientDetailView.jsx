import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, History, ShieldAlert, CreditCard, User, History as HistoryIcon, Loader2 } from 'lucide-react';
import { Button, Modal, Input, Label, Switch } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const PatientDetailView = ({ patientId, onBack, activeTab }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingLink, setLoadingLink] = useState(false);
    const [linkStatus, setLinkStatus] = useState(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
    const [isRestricting, setIsRestricting] = useState(false);

    const [editFormData, setEditFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/admin/patients/${patientId}`, token);
                setPatient(data);
                setEditFormData({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                });
            } catch (err) {
                console.error('Failed to fetch patient:', err);
            } finally {
                setLoading(false);
            }
        };
        if (patientId && token) fetchPatient();
    }, [patientId, token]);

    const handleSaveProfile = async () => {
        try {
            const updated = await api.patch(`/admin/patients/${patientId}`, {
                full_name: editFormData.full_name
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

    const handleToggleRestriction = async () => {
        setIsRestricting(true);
        try {
            const updated = await api.patch(`/admin/patients/${patientId}/restriction`, {
                restricted: !patient.is_booking_restricted,
                reason: !patient.is_booking_restricted ? 'Restricted by staff' : null
            }, token);
            setPatient(prev => ({ ...prev, ...updated }));
        } catch (err) {
            alert(err.message);
        } finally {
            setIsRestricting(false);
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
        { id: 'records', label: 'Records' },
        { id: 'financial', label: 'Financial' },
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
                                Patient Registry
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
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
                    {/* Header Card */}
                    <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                        <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
                            <div className='flex flex-col items-center w-full gap-6 xl:flex-row xl:items-center'>
                                <div className='shrink-0'>
                                    <div className='w-20 h-20 overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-white/5'>
                                        {patient.avatar_url || patient.photo_url ? (
                                            <img src={patient.avatar_url || patient.photo_url} alt={patient.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className='text-gray-400' size={32} />
                                        )}
                                    </div>
                                </div>
                                <div className='text-center xl:text-left'>
                                    <h4 className='mb-1 text-[clamp(18px,2.2vw,22px)] font-bold text-gray-900 dark:text-white font-outfit'>
                                        {patient.full_name}
                                    </h4>
                                    <div className='flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:text-left'>
                                        <p className='text-[clamp(13px,1.2vw,14px)] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest'>
                                            {patient.status || (patient.is_registered ? 'Registered' : 'Walk-in')} Patient
                                        </p>
                                        <div className='hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block'></div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[clamp(11px,1vw,12px)] font-bold uppercase tracking-wider ${patient.is_registered ? 'bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                            {patient.is_registered ? 'Verified Account' : 'Stub Profile'}
                                        </span>
                                        {patient.is_booking_restricted && (
                                            <span className="px-2 py-0.5 rounded-lg text-[clamp(11px,1vw,12px)] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                                Restricted
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {(!activeTab || activeTab === 'profile') && (
                                <Button
                                    variant='outline'
                                    onClick={() => setIsEditModalOpen(true)}
                                    className='h-11 px-6 text-sm font-bold shadow-theme-sm'
                                >
                                    Edit Basic Information
                                </Button>
                            )}
                        </div>

                        {/* Contact Meta */}
                        <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div className='flex flex-wrap gap-6'>
                                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                                    <Mail size={16} className='text-gray-400' /> {patient.email || 'No email set'}
                                </div>
                                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                                    <Phone size={16} className='text-gray-400' /> {patient.phone || 'No phone set'}
                                </div>
                            </div>
                            <Button
                                variant='outline'
                                onClick={() => setIsEditContactModalOpen(true)}
                                className='h-11 px-6 text-sm font-bold shadow-theme-sm'
                            >
                                <Mail size={16} className='mr-2' /> Update Records
                            </Button>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className='min-h-120 md:min-h-140'>
                        {(!activeTab || activeTab === 'profile') && (
                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                                <div className='lg:col-span-2 space-y-6'>
                                    <div className='p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-brand-50/30 dark:bg-brand-500/5'>
                                        <h4 className='text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                                            <Calendar size={14} /> Upcoming Appointment
                                        </h4>
                                        <div className='flex items-center justify-between'>
                                            <p className='text-sm font-bold text-gray-900 dark:text-white'>{patient.next_appointment || 'No upcoming appointments'}</p>
                                            <Button variant='ghost' className='text-[10px] font-black uppercase text-brand-600'>View Details</Button>
                                        </div>
                                    </div>
                                    <div className='p-6 rounded-2xl border border-gray-100 dark:border-gray-800'>
                                        <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4'>Patient Summary</h4>
                                        <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>
                                            Patient has been active since {new Date(patient.created_at).toLocaleDateString()}. Total of {patient.total_visits || 0} visits recorded across all services.
                                        </p>
                                    </div>
                                </div>
                                <div className='space-y-6'>
                                    <div className='p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-[10px] font-bold text-gray-400 uppercase'>Outstanding</span>
                                            <span className='text-sm font-black text-gray-900 dark:text-white'>{patient.balance || '₱ 0.00'}</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-[10px] font-bold text-gray-400 uppercase'>Attendence</span>
                                            <span className='text-sm font-black text-success-600'>100%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'records' && (
                            <div className='space-y-4'>
                                <h4 className='text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                                    <HistoryIcon size={14} /> Medical & Treatment History
                                </h4>
                                <div className='p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center py-20'>
                                    <History size={40} className='mx-auto text-gray-300 dark:text-gray-700 mb-4' />
                                    <h4 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>No History Found</h4>
                                    <p className='text-xs text-gray-500 mt-2'>Treatment history will appear here once the patient completes their first visit.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financial' && (
                            <div className='p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center py-20'>
                                <CreditCard size={40} className='mx-auto text-gray-300 dark:text-gray-700 mb-4' />
                                <h4 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>Billing History</h4>
                                <p className='text-xs text-gray-500 mt-2'>No outstanding invoices for this patient.</p>
                            </div>
                        )}

                        {activeTab === 'security' && (
                             <div className='space-y-6'>
                                 {/* Account Portal Status */}
                                 <div className='p-6 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10'>
                                     <h4 className='text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                                         <User size={14} /> Portal Access
                                     </h4>
                                     <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                                         <div>
                                             <p className='text-sm font-bold text-gray-900 dark:text-white'>
                                                 {patient.is_registered ? 'Account Active' : 'Account Not Set Up'}
                                             </p>
                                             <p className='text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-sm font-medium'>
                                                 {patient.is_registered 
                                                     ? 'This patient has registered an account and can book appointments online.' 
                                                     : 'This is a stub profile. Send a setup link to allow the patient to access the portal.'}
                                             </p>
                                         </div>
                                         {!patient.is_registered && (
                                             <Button 
                                                 onClick={handleSendSetupLink}
                                                 disabled={loadingLink || !patient.email}
                                                 className='bg-brand-500 text-white font-bold h-11 px-6 text-xs uppercase shadow-theme-md'
                                             >
                                                 {loadingLink ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} className='mr-2' />}
                                                 Send Setup Link
                                             </Button>
                                         )}
                                     </div>
                                     {linkStatus && (
                                         <p className={`text-[10px] font-bold mt-3 uppercase tracking-wider ${linkStatus.type === 'success' ? 'text-success-600' : 'text-red-500'}`}>
                                             {linkStatus.message}
                                         </p>
                                     )}
                                     {!patient.email && !patient.is_registered && (
                                         <p className='text-[10px] text-red-500 font-bold mt-3 italic'>
                                             * Email address required to send setup link. Update contact info to proceed.
                                         </p>
                                     )}
                                 </div>

                                <div className='p-6 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10'>
                                     <h4 className='text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                                         <ShieldAlert size={14} /> Account Restrictions
                                     </h4>
                                     <p className='text-[11px] text-red-700 dark:text-red-400 font-medium leading-relaxed mb-4'>
                                         Setting a restriction will prevent this patient from booking appointments online.
                                     </p>
                                     <Button 
                                        variant='outline' 
                                        onClick={handleToggleRestriction}
                                        disabled={isRestricting}
                                        className={`h-11 border-red-200 text-red-600 text-xs font-black uppercase hover:bg-red-50 ${patient.is_booking_restricted ? 'bg-red-500 text-white hover:bg-red-600 border-none' : ''}`}
                                    >
                                        {isRestricting ? <Loader2 size={16} className="animate-spin" /> : patient.is_booking_restricted ? 'Lift Booking Restriction' : 'Restrict Online Booking'}
                                    </Button>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className='max-w-[450px] w-full m-auto'>
                <div className='p-8 bg-white dark:bg-gray-900 rounded-xl'>
                    <h4 className='text-lg font-black uppercase tracking-tight mb-6'>Edit Patient Data</h4>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Full Name</Label>
                            <Input 
                                value={editFormData.full_name} 
                                onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                className='h-11' 
                            />
                        </div>
                        <div className='flex justify-end gap-3 pt-6'>
                            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveProfile} className='bg-brand-500 text-white px-6 font-bold shadow-theme-sm'>Save Changes</Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isEditContactModalOpen} onClose={() => setIsEditContactModalOpen(false)} className='max-w-[450px] w-full m-auto'>
                <div className='p-8 bg-white dark:bg-gray-900 rounded-xl'>
                    <h4 className='text-lg font-black uppercase tracking-tight mb-6'>Contact Update</h4>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Email Address</Label>
                            <Input 
                                value={editFormData.email} 
                                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                className='h-11' 
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Phone Number</Label>
                            <Input 
                                value={editFormData.phone} 
                                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className='h-11' 
                            />
                        </div>
                        <div className='flex justify-end gap-3 pt-6'>
                            <Button variant='outline' onClick={() => setIsEditContactModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveContact} className='bg-brand-500 text-white px-6 font-bold shadow-theme-sm'>Update Contact</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PatientDetailView;
