import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Activity, ShieldCheck, Key } from 'lucide-react';
import { Button, Modal, Input, Label } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';

const StaffDetailView = ({ staffMember: initialStaff, onBack, activeTab }) => {
    // If no staffMember is provided, use mock
    const person = initialStaff || {
        id: '1',
        full_name: 'Elena Rodriguez',
        email: 'elena.r@primeradental.com',
        role: 'Secretary',
        phone: '+63 921 123 4567',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
        is_active: true,
        join_date: 'Oct 2024'
    };

    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'activity', label: 'Activity' },
        { id: 'security', label: 'Security' },
    ];

    return (
        <div className='flex flex-col grow min-h-0 bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-300 dark:border-gray-800 transition-all duration-300 overflow-hidden no-scrollbar'>
            {/* ── A. Identity Header (Doctor Style) ── */}
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
                                {person.full_name}
                            </h3>
                            <p className='text-[clamp(9px,1vw,10px)] font-black text-brand-500 dark:text-brand-400 uppercase tracking-[0.15em] mt-1'>
                                Staff Directory <span className='mx-1 text-gray-300'>/</span> {tabs.find(t => t.id === activeTab)?.label} Profile
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── B. Navigation Tabs (Doctor Style) ── */}
            <div className='sticky top-0 z-30 bg-white dark:bg-[#1f2021] border-b border-gray-300 dark:border-gray-800 shadow-sm sm:shadow-none'>
                <div className='bg-white dark:bg-transparent px-4 sm:px-6 flex items-center gap-[clamp(20px,3vw,32px)] overflow-x-auto no-scrollbar'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/staff/${t.id}/${person.id}`)}
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

            <div className='grow overflow-y-auto no-scrollbar'>
                <div className='p-4 sm:p-6 lg:p-8 space-y-8'>
                    {/* Header Card */}
                    <div className='p-6 sm:p-10 border border-gray-300 rounded-3xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                        <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
                            <div className='flex flex-col items-center w-full gap-6 xl:flex-row xl:items-center'>
                                <div className='shrink-0'>
                                    <div className='w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-white/5'>
                                        {person.avatar_url ? (
                                            <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className='text-brand-500 font-bold text-xl'>
                                                {person.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className='text-center xl:text-left'>
                                    <h4 className='mb-1 text-[clamp(18px,2.2vw,22px)] font-bold text-gray-900 dark:text-white font-outfit'>
                                        {person.full_name}
                                    </h4>
                                    <div className='flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:text-left'>
                                        <p className='text-[clamp(13px,1.2vw,14px)] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest'>
                                            {person.role}
                                        </p>
                                        <div className='hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block'></div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[clamp(11px,1vw,12px)] font-bold uppercase tracking-wider ${
                                            person.is_active ? 'bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            Status : {person.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {(!activeTab || activeTab === 'profile') && (
                                <Button
                                    variant='outline'
                                    onClick={() => setIsEditModalOpen(true)}
                                    className='h-11 px-6 text-sm font-bold shadow-sm'
                                >
                                    Edit Professional Identity
                                </Button>
                            )}
                        </div>

                        {/* Contact Meta */}
                        <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                            <div className='flex flex-wrap gap-8'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400'>
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Business Email</p>
                                        <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>{person.email}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400'>
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Direct Line</p>
                                        <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>{person.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant='outline'
                                onClick={() => setIsEditContactModalOpen(true)}
                                className='h-11 sm:h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-sm border-gray-200 dark:border-white/5 rounded-xl'
                            >
                                <Mail size={16} className='mr-2' /> Update Channels
                            </Button>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className='min-h-120 md:min-h-140'>
                        {(!activeTab || activeTab === 'profile') && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='p-6 rounded-xl border border-gray-100 dark:border-gray-800'>
                                    <h5 className='text-xs font-black uppercase tracking-widest text-gray-400 mb-4'>Employment Info</h5>
                                    <div className='space-y-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs font-bold text-gray-500'>Joined Date</span>
                                            <span className='text-xs font-black text-gray-900 dark:text-white uppercase'>{person.join_date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'activity' && (
                            <div className='space-y-4'>
                                <h4 className='text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                                    <Activity size={14} /> System Interaction Log
                                </h4>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className='p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.01] flex items-start gap-4'>
                                        <div className='w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400'>
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className='text-sm font-bold text-gray-900 dark:text-white'>System Login</p>
                                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Successful authentication from Admin Portal</p>
                                            <p className='text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest'>2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'security' && (
                             <div className='max-w-2xl'>
                                <div className='p-6 rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/20'>
                                    <h4 className='text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2'>
                                        <ShieldCheck size={16} /> Security Control
                                    </h4>
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-[10px] font-bold uppercase opacity-80'>Account Health</span>
                                            <span className='text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded'>Secured</span>
                                        </div>
                                        <Button variant='secondary' className='w-full mt-2 h-11 text-xs font-black uppercase tracking-widest bg-white text-brand-600 hover:bg-white/90'>
                                            <Key size={14} className='mr-2' /> Force Credential Reset
                                        </Button>
                                    </div>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals Skeletons */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className='max-w-[450px] w-full m-auto'>
                <div className='p-8 bg-white dark:bg-gray-900 rounded-xl'>
                    <h4 className='text-lg font-black uppercase tracking-tight mb-6'>Edit Staff Identity</h4>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Full Name</Label>
                            <Input defaultValue={person.full_name} className='h-11' />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Role</Label>
                            <Input defaultValue={person.role} className='h-11' />
                        </div>
                        <div className='flex justify-end gap-3 pt-6'>
                            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button className='bg-brand-500 text-white px-6'>Save Changes</Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isEditContactModalOpen} onClose={() => setIsEditContactModalOpen(false)} className='max-w-[450px] w-full m-auto'>
                <div className='p-8 bg-white dark:bg-gray-900 rounded-xl'>
                    <h4 className='text-lg font-black uppercase tracking-tight mb-6'>Update Contact Details</h4>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Email</Label>
                            <Input defaultValue={person.email} className='h-11' />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Phone</Label>
                            <Input defaultValue={person.phone} className='h-11' />
                        </div>
                        <div className='flex justify-end gap-3 pt-6'>
                            <Button variant='outline' onClick={() => setIsEditContactModalOpen(false)}>Cancel</Button>
                            <Button className='bg-brand-500 text-white px-6'>Update Contact</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StaffDetailView;
