import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import DoctorProfileDetail from './profile/DoctorProfileDetail';
import DoctorScheduleDetail from './schedule/DoctorScheduleDetail';
import DoctorHistoryDetail from './history/DoctorHistoryDetail';
import DoctorSecurityDetail from './DoctorSecurityDetail';
import DoctorServicesDetail from './profile/DoctorServicesDetail';
import { useSidebar } from '../../../context/SidebarContext';
import { Button, Modal, Input, Label, Switch } from '../../ui';
import { useToast } from '../../../context/ToastContext.jsx';
import { useNavigate } from 'react-router-dom';

const DoctorDetailView = ({
    doctor: initialDoctor,
    onBack,
    activeTab,
    updateDoctorProfile,
    updateDoctorContact,
    updateDoctorServices,
}) => {
    if (!initialDoctor) return null;

    const initialNames = {
        first: initialDoctor.first_name || '',
        last: initialDoctor.last_name || '',
        middle: initialDoctor.middle_name || '',
        suffix: initialDoctor.suffix || '',
    };

    const [doctor, setDoctor] = useState(initialDoctor);
    const [formNames, setFormNames] = useState(initialNames);

    // Sync state when props update (e.g. after a save operation fetches new data)
    React.useEffect(() => {
        if (!initialDoctor) return;
        setDoctor(initialDoctor);
        setFormNames({
            first: initialDoctor.first_name || '',
            last: initialDoctor.last_name || '',
            middle: initialDoctor.middle_name || '',
            suffix: initialDoctor.suffix || '',
        });
    }, [initialDoctor]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(doctor.photo_url);
    const [isActive, setIsActive] = useState(doctor.is_active);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);

    const { showToast } = useToast();
    const navigate = useNavigate();

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'services', label: 'Services' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'history', label: 'History' },
        { id: 'security', label: 'Security' },
    ];

    const AVATARS = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    ];

    if (!doctor) return null;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData(e.target);
        const fName = formData.get('first_name');
        const lName = formData.get('last_name');
        const mName = formData.get('middle_name');
        const suffix = formData.get('suffix');

        try {
            if (updateDoctorProfile) {
                const updatedDoctor = await updateDoctorProfile(doctor.id, {
                    first_name: fName,
                    last_name: lName,
                    middle_name: mName,
                    suffix: suffix,
                    license_number: formData.get('license_number'),
                    bio: formData.get('bio'),
                    photo_url: selectedAvatar,
                    is_active: isActive,
                });
                setDoctor(updatedDoctor);
            } else {
                // Fallback for mock environment
                const reconstructedFullName = `Dr. ${fName} ${mName ? mName + ' ' : ''}${lName}${suffix ? ' ' + suffix : ''}`;
                setDoctor((prev) => ({
                    ...prev,
                    full_name: reconstructedFullName,
                    license_number: formData.get('license_number'),
                    bio: formData.get('bio'),
                    photo_url: selectedAvatar,
                    is_active: isActive,
                }));
            }

            setFormNames({ first: fName, last: lName, middle: mName, suffix });
            showToast('Professional identity updated successfully!');
            setIsEditModalOpen(false);
        } catch (err) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveContact = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const phone = formData.get('phone');

        try {
            if (updateDoctorContact) {
                const updatedDoctor = await updateDoctorContact(doctor.id, { email, phone });
                setDoctor(updatedDoctor);
            } else {
                setDoctor((prev) => ({ ...prev, email, phone }));
            }
            showToast('Contact credentials updated successfully!');
            setIsEditContactModalOpen(false);
        } catch (err) {
            showToast('Failed to update contact.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const { isExpanded, isHovered } = useSidebar();
    const isSidebarOpen = isExpanded || isHovered;

    return (
        <div className='bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-300 dark:border-gray-800 transition-all duration-300 overflow-hidden'>
            {/* A. Identity Section — Now part of normal flow */}
            <div className='bg-white dark:bg-transparent border-b border-gray-300 dark:border-gray-800'>
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
                            <h3 className='text-[clamp(14px,1.5vw,18px)] font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit leading-tight'>
                                {doctor.full_name}
                            </h3>
                            <p className='text-[clamp(9px,1vw,10px)] font-black text-brand-500 dark:text-brand-400 uppercase tracking-[0.15em] mt-1'>
                                {(activeTab || 'profile')} Profile Registry
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* B. Navigation Tabs Section — Sticky with header offset to browser viewport */}
            <div className='sticky top-[68px] lg:top-[76px] z-30 bg-white dark:bg-[#1f2021] border-b border-gray-300 dark:border-gray-800 shadow-sm sm:shadow-none'>
                <div className='bg-white dark:bg-transparent px-4 sm:px-6 flex items-center gap-[clamp(20px,3vw,32px)] overflow-x-auto no-scrollbar'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/doctors/${t.id}/${doctor.id}`)}
                            className={`pt-4 pb-3 text-[clamp(9px,1.1vw,11px)] font-black uppercase tracking-[0.1em] transition-all relative whitespace-nowrap ${activeTab === t.id
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

            {/* C. Content Body */}
            <div className='p-4 sm:p-6 lg:p-10 space-y-8'>

                {/* A. Profile Header Card — only on Profile tab */}
                {(!activeTab || activeTab === 'profile') && (
                    <div className='p-6 sm:p-10 border border-gray-300 rounded-3xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                        <div className='flex flex-col gap-[clamp(16px,2vw,24px)] xl:flex-row xl:items-start xl:justify-between'>
                            <div className='flex flex-col items-center w-full gap-[clamp(16px,2vw,24px)] xl:flex-row xl:items-center'>
                                <div className='relative shrink-0'>
                                    <div className='w-20 h-20 sm:w-28 sm:h-28 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-2xl sm:text-3xl shadow-inner'>
                                        {doctor.photo_url ? (
                                            <img
                                                src={doctor.photo_url}
                                                alt={doctor.full_name}
                                                className='w-full h-full object-cover'
                                            />
                                        ) : (
                                            doctor.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                </div>
                                <div className='order-3 xl:order-2 text-center xl:text-left'>
                                    <h4 className='mb-1 text-xl sm:text-3xl font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                                        {doctor.full_name}
                                    </h4>
                                    <div className='flex flex-wrap items-center justify-center xl:justify-start gap-3'>
                                        <p className='text-[10px] sm:text-xs text-brand-600 dark:text-brand-400 font-black uppercase tracking-widest'>
                                            {doctor.tier === 'general' ? 'General Dentist' : 'Specialized Dentist'}
                                        </p>
                                        <div className='hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 sm:block'></div>
                                        <div className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2'>
                                            <span>
                                                License:{' '}
                                                <span className='text-gray-900 dark:text-white font-black'>
                                                    {doctor.license_number}
                                                </span>
                                            </span>
                                            <div className='h-3.5 w-px bg-gray-300 dark:bg-gray-700 mx-1'></div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${doctor.is_active ? 'bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-500'}`}>
                                                Status : {doctor.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-2xl font-medium leading-relaxed'>
                                        {doctor.bio}
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0'>
                                <Button
                                    variant='outline'
                                    onClick={() => { setSelectedAvatar(doctor.photo_url); setIsEditModalOpen(true); }}
                                    className='flex items-center justify-center gap-2 rounded-lg px-4 h-11 text-sm font-bold w-full sm:w-[160px] hover:border-brand-500 hover:text-brand-500 transition-all font-outfit shadow-sm'
                                >
                                    <svg className='fill-current' width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <path fillRule='evenodd' clipRule='evenodd' d='M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z' fill='currentColor' />
                                    </svg>
                                    Edit Profile
                                </Button>
                            </div>
                        </div>

                        {/* Contact footer */}
                        <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                            <div className='flex flex-wrap gap-8'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400'>
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Professional Email</p>
                                        <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>{doctor.email}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400'>
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Clinical Line</p>
                                        <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>{doctor.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant='outline'
                                onClick={() => setIsEditContactModalOpen(true)}
                                className='h-11 sm:h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-sm border-gray-200 dark:border-white/5 rounded-xl'
                            >
                                <Mail size={16} className='mr-2' /> Update Credentials
                            </Button>
                        </div>
                    </div>
                )}

                {/* B. Dynamic Tab Content */}
                <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
                    {activeTab === 'profile' || !activeTab ? (
                        <DoctorProfileDetail doctor={doctor} />
                    ) : activeTab === 'services' ? (
                        <DoctorServicesDetail doctor={doctor} updateDoctorServices={updateDoctorServices} />
                    ) : activeTab === 'schedule' ? (
                        <DoctorScheduleDetail doctor={doctor} />
                    ) : activeTab === 'history' ? (
                        <DoctorHistoryDetail doctor={doctor} />
                    ) : activeTab === 'security' ? (
                        <DoctorSecurityDetail doctor={doctor} />
                    ) : null}
                </div>
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                className='max-w-[850px] w-[95%] sm:w-full m-auto'
            >
                <div className='no-scrollbar relative w-full overflow-y-auto rounded-xl bg-white p-5 dark:bg-gray-900 sm:p-10 max-h-[90vh]'>
                    <div className='mb-6'>
                        <h4 className='text-[clamp(18px,2.5vw,22px)] font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                            Edit Doctor Profile
                        </h4>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                            Update professional details and clinical information.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSaveProfile}
                        className='flex flex-col gap-4'
                    >
                        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
                            {/* Left Side: Avatar Selection & Status */}
                            <div className='lg:col-span-4 flex flex-col items-center gap-6'>
                                <div className='relative group'>
                                    <div className='w-32 h-32 rounded-full overflow-hidden border-2 border-brand-500/20 dark:border-brand-500/30 flex items-center justify-center bg-gray-50 dark:bg-white/[0.02] shadow-inner transition-transform group-hover:scale-[1.02]'>
                                        {selectedAvatar ? (
                                            <img
                                                src={selectedAvatar}
                                                alt='Profile'
                                                className='w-full h-full object-cover'
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-3xl font-bold">
                                                {doctor.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <Label className='text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-3 block text-center'>
                                        Available Profiles
                                    </Label>
                                    <div className='grid grid-cols-3 gap-3 px-1'>
                                        {AVATARS.map((url, i) => (
                                            <button
                                                key={i}
                                                type='button'
                                                onClick={() => setSelectedAvatar(url)}
                                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all p-1 group active:scale-95 ${selectedAvatar === url ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-200'}`}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Avatar ${i}`}
                                                    className='w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-300'
                                                />
                                                {selectedAvatar === url && (
                                                    <div className='absolute top-1 right-1 bg-brand-500 text-white rounded-full p-0.5 shadow-sm scale-75'>
                                                        <svg
                                                            width='12'
                                                            height='12'
                                                            viewBox='0 0 12 12'
                                                            fill='none'
                                                        >
                                                            <path
                                                                d='M10 3L4.5 8.5L2 6'
                                                                stroke='currentColor'
                                                                strokeWidth='2.5'
                                                                strokeLinecap='round'
                                                                strokeLinejoin='round'
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                        <button
                                            type='button'
                                            className='aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-all group active:scale-95 p-1'
                                        >
                                            <svg
                                                width='14'
                                                height='14'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='2.5'
                                                className='group-hover:scale-110 transition-transform'
                                            >
                                                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' />
                                            </svg>
                                            <span className='text-[7px] font-bold uppercase'>
                                                Custom
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Details */}
                            <div className='lg:col-span-8 flex flex-col'>
                                <div className='space-y-3.5 flex flex-col h-full'>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div className='col-span-1'>
                                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                                Last Name
                                            </Label>
                                            <Input
                                                name='last_name'
                                                defaultValue={formNames.last}
                                                required
                                                placeholder='Last Name'
                                                className='font-bold h-10 rounded-lg text-sm'
                                            />
                                        </div>
                                        <div className='col-span-1'>
                                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                                First Name
                                            </Label>
                                            <Input
                                                name='first_name'
                                                defaultValue={formNames.first}
                                                required
                                                placeholder='First Name'
                                                className='font-bold h-10 rounded-lg text-sm'
                                            />
                                        </div>
                                        <div className='col-span-1'>
                                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                                Middle Name
                                            </Label>
                                            <Input
                                                name='middle_name'
                                                defaultValue={formNames.middle}
                                                placeholder='Middle Name'
                                                className='font-bold h-10 rounded-lg text-sm'
                                            />
                                        </div>
                                        <div className='col-span-1'>
                                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                                Suffix
                                            </Label>
                                            <Input
                                                name='suffix'
                                                defaultValue={formNames.suffix}
                                                placeholder='Jr., III, etc.'
                                                className='font-bold h-10 rounded-lg text-sm'
                                            />
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4 pb-0.5 items-end'>
                                        <div className='col-span-1'>
                                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                                License Number
                                            </Label>
                                            <Input
                                                name='license_number'
                                                defaultValue={doctor.license_number}
                                                required
                                                placeholder='XXXX-XXXX'
                                                className='font-medium h-10 rounded-lg text-sm'
                                            />
                                        </div>
                                        <div className='col-span-1'>
                                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                                Doctor Status
                                            </Label>
                                            <div className='h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between'>
                                                <span
                                                    className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-brand-500' : 'text-gray-400'}`}
                                                >
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <Switch
                                                    checked={isActive}
                                                    onChange={setIsActive}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col flex-grow'>
                                        <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                            Professional Bio
                                        </Label>
                                        <textarea
                                            name='bio'
                                            defaultValue={doctor.bio}
                                            className='w-full flex-grow rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all no-scrollbar overflow-y-auto'
                                            placeholder='Brief professional background...'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className='flex items-center gap-3 mt-2 pt-6 border-t border-gray-200 dark:border-gray-800 sm:justify-end'>
                            <Button
                                variant='outline'
                                type='button'
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    showToast(
                                        "Changes discarded. You've exited edit mode.",
                                        'info',
                                        'Notice',
                                    );
                                }}
                                disabled={isSaving}
                                className='flex-1 sm:flex-none px-6 py-3.5 h-11 rounded-lg text-[14px] font-black text-gray-600 dark:text-gray-400 active:scale-95 transition-all'
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='flex-1 sm:flex-none px-8 py-3.5 h-11 rounded-lg text-[14px] font-black bg-brand-500 text-white min-w-[140px] shadow-theme-xs hover:bg-brand-600 active:scale-95 transition-all'
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                isOpen={isEditContactModalOpen}
                onClose={() => setIsEditContactModalOpen(false)}
                className='max-w-[450px] w-[95%] sm:w-full m-auto'
            >
                <div className='no-scrollbar relative w-full overflow-y-auto rounded-xl bg-white p-5 dark:bg-gray-900 sm:p-8'>
                    <div className='mb-6'>
                        <h4 className='text-[clamp(18px,2.5vw,22px)] font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                            Edit Contact Information
                        </h4>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                            Update communication channels for this doctor.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSaveContact}
                        className='flex flex-col gap-4'
                    >
                        <div className='space-y-4'>
                            <div>
                                <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                    Email Address
                                </Label>
                                <Input
                                    name='email'
                                    type='email'
                                    defaultValue={doctor.email}
                                    required
                                    placeholder='doctor@primeradental.com'
                                    className='font-medium h-10 rounded-lg text-sm'
                                />
                            </div>
                            <div>
                                <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block'>
                                    Contact Number
                                </Label>
                                <Input
                                    name='phone'
                                    defaultValue={doctor.phone}
                                    required
                                    placeholder='+63 9XX'
                                    className='font-medium h-10 rounded-lg text-sm'
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className='flex items-center gap-3 mt-2 pt-6 border-t border-gray-200 dark:border-gray-800 sm:justify-end'>
                            <Button
                                variant='outline'
                                type='button'
                                onClick={() => {
                                    setIsEditContactModalOpen(false);
                                    showToast(
                                        "Changes discarded. You've exited edit mode.",
                                        'notice',
                                        'Notice',
                                    );
                                }}
                                disabled={isSaving}
                                className='flex-1 sm:flex-none px-6 py-3.5 h-11 rounded-lg text-[14px] font-black text-gray-600 dark:text-gray-400 active:scale-95 transition-all'
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                disabled={isSaving}
                                className='flex-1 sm:flex-none px-8 py-3.5 h-11 rounded-lg text-[14px] font-black bg-brand-500 text-white min-w-[140px] shadow-theme-xs hover:bg-brand-600 active:scale-95 transition-all'
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorDetailView;
