import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, User, FileText, History } from 'lucide-react';
import PatientProfileDetail from './profile/PatientProfileDetail';
import AppointmentDetailView from '../approval_details';
import HistoryDetailView from './history/HistoryDetailView';
import CheckoutView from './appointments/CheckoutView';

const PatientDetailView = ({ patient, onBack }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedApt, setSelectedApt] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState(null);

    if (!patient) return null;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'history', label: 'Medical History', icon: History },
    ];

    return (
        <div className='flex flex-col grow min-h-0 bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 overflow-hidden no-scrollbar'>
            {/* Top Navigation - Hidden when viewing details to prevent double headers */}
            {!selectedApt && !selectedHistory && (
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
                                Patient File
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                <div className='px-4 sm:px-6 flex items-center gap-6'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                                activeTab === t.id 
                                    ? 'text-brand-500' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        >
                            <t.icon size={14} />
                            {t.label}
                            {activeTab === t.id && (
                                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full' />
                            )}
                        </button>
                    ))}
                    </div>
                </div>
            )}

            {selectedApt ? (
                selectedApt.status === 'In Progress' ? (
                    <CheckoutView 
                        appointment={selectedApt} 
                        patient={patient} 
                        onBack={() => setSelectedApt(null)} 
                        onConfirm={() => {
                            console.log('Confirmed Check Out', selectedApt.id);
                            setSelectedApt(null);
                        }}
                    />
                ) : (
                    <AppointmentDetailView 
                        request={{
                            id: selectedApt.id,
                            patient: {
                                name: patient.full_name,
                                phone: patient.phone,
                                email: patient.email,
                                source: selectedApt.source === 'Guest' ? 'GUEST_BOOKING' : 'ACCOUNT_BOOKING',
                                noShowCount: patient.no_show_count || 0,
                                cancellationCount: patient.cancellation_count || 0,
                            },
                            service: selectedApt.service,
                            requestedDate: selectedApt.dateLabel || 'N/A',
                            requestedTime: selectedApt.startTime,
                            dentist: selectedApt.doctor,
                            serviceTier: selectedApt.type,
                            dentistPhone: selectedApt.phone,
                            dentistEmail: 'clinician@samson.com',
                            createdAt: new Date().toISOString()
                        }}
                        onBack={() => setSelectedApt(null)}
                        onApprove={() => {
                            console.log('Approved Schedule', selectedApt.id);
                            setSelectedApt(null);
                        }}
                        onReject={(reason) => {
                            console.log('Rejected Schedule', selectedApt.id, reason);
                            setSelectedApt(null);
                        }}
                        isBookingMode={true}
                        busySlots={[15, 30, 55]} // Match snippet
                        slotPosition={10} // Match snippet
                        timeStr={selectedApt.startTime}
                        completedCount={patient.completed_count || 0}
                        breadcrumbItems={[
                            { label: 'Home', href: '/secretary' },
                            { label: 'Patients', href: '/secretary/patients' },
                            { label: 'Request Details' }
                        ]}
                    />
                )
            ) : selectedHistory ? (
                <HistoryDetailView 
                    historyItem={selectedHistory} 
                    patient={patient} 
                    onBack={() => setSelectedHistory(null)} 
                />
            ) : (
                <div className='grow overflow-y-auto no-scrollbar'>
                    <div className='p-4 sm:p-6 lg:p-8 space-y-6'>
                        {/* Header / Profile Section */}
                        <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                            <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
                                <div className='flex flex-col items-center w-full gap-6 xl:flex-row xl:items-center'>
                                    <div className='relative shrink-0'>
                                        <div className='w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-2xl shadow-inner'>
                                            {patient.photo_url ? (
                                                <img src={patient.photo_url} alt={patient.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                (patient.full_name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                    </div>
                                    <div className='order-3 xl:order-2 text-center xl:text-left'>
                                        <h4 className='mb-1 text-[clamp(18px,2.2vw,22px)] font-bold text-gray-900 dark:text-white font-outfit'>
                                            {patient.full_name}
                                        </h4>
                                        <div className='flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:text-left'>
                                            <p className='text-[clamp(13px,1.2vw,14px)] text-brand-600 dark:text-brand-400 font-bold'>
                                                ID: {patient.patient_id}
                                            </p>
                                            <div className='hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block'></div>
                                            <div className='text-[clamp(13px,1.2vw,14px)] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2'>
                                                <span>Last Visit: <span className='text-gray-900 dark:text-white font-black'>{patient.last_visit || 'N/A'}</span></span>
                                                <div className='h-3.5 w-px bg-gray-300 dark:bg-gray-700 mx-1'></div>
                                                <span className={`px-2 py-0.5 rounded-lg text-[clamp(11px,1vw,12px)] font-bold uppercase tracking-wider ${
                                                    patient.is_active ? 'bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    Status : {patient.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        {activeTab === 'profile' && (
                                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-2xl font-medium leading-relaxed'>
                                                {patient.notes || 'No additional notes for this patient.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact info in Header Card */}
                            {activeTab === 'profile' && (
                                <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                    <div className='flex flex-wrap gap-6'>
                                        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                                            <Mail size={16} className='text-gray-400' /> {patient.email || 'No email provided'}
                                        </div>
                                        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                                            <Phone size={16} className='text-gray-400' /> {patient.phone || 'No phone provided'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dynamic Child Content */}
                        <div className='min-h-120 md:min-h-140'>
                            {activeTab === 'profile' && <PatientProfileDetail patient={patient} />}
                            {activeTab === 'appointments' && (
                                <div className="space-y-8">
                                    {[
                                        {
                                            dateLabel: 'May 10, 2026',
                                            appointments: [
                                                { id: 1, startTime: '09:00 AM', endTime: '10:00 AM', service: 'Routine Cleaning', type: 'General', doctor: 'Dr. James Thompson', phone: '+63 917 123 4567', source: 'Account', status: 'In Progress' },
                                                { id: 5, startTime: '02:00 PM', endTime: '03:00 PM', service: 'Checkup', type: 'General', doctor: 'Dr. James Thompson', phone: '+63 917 123 4567', source: 'Walk-in', status: 'Scheduled' },
                                            ]
                                        },
                                    ].map((group, gIdx) => (
                                        <div key={gIdx} className="space-y-4">
                                            {/* Date Indicator */}
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-outfit whitespace-nowrap tracking-tight">
                                                    {group.dateLabel}
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white shrink-0" />
                                                <div className="h-px bg-gray-200 dark:border-gray-800 flex-1 opacity-60" />
                                            </div>

                                            <div className="space-y-4">
                                                {group.appointments.map((apt) => (
                                                    <div 
                                                        key={apt.id} 
                                                        onClick={() => setSelectedApt({ ...apt, dateLabel: group.dateLabel })}
                                                        className="flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
                                                    >
                                                        {/* Time Sidebar */}
                                                        <div className="flex flex-row sm:flex-col w-full sm:w-[120px] bg-gray-50/50 dark:bg-gray-800/20 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0">
                                                            <div className="flex-1 flex flex-col justify-center px-4 py-2 sm:py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800">
                                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Start Time</span>
                                                                <span className="text-sm sm:text-base font-semibold text-[#0B1120] dark:text-white font-outfit truncate">{apt.startTime}</span>
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-center px-4 py-2 sm:py-3">
                                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">End Time</span>
                                                                <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 font-outfit truncate">{apt.endTime}</span>
                                                            </div>
                                                        </div>

                                                        {/* Main Content */}
                                                        <div className="flex-1 flex flex-col lg:flex-row lg:items-center p-4 sm:p-5 gap-4 lg:gap-6 xl:gap-8 min-w-0 w-full">
                                                            <div className="flex items-center gap-3 w-full lg:w-[220px] xl:w-[260px] shrink-0">
                                                                <div className="relative shrink-0">
                                                                    <img 
                                                                        alt={patient.full_name} 
                                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover" 
                                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.full_name)}&background=random`}
                                                                    />
                                                                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#111827] rounded-full ${apt.status === 'In Progress' ? 'bg-amber-500 animate-pulse' : apt.id === 1 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-semibold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit group-hover:text-brand-500 transition-colors truncate">
                                                                        {patient.full_name}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Patient Record</span>
                                                                        {apt.status === 'In Progress' && (
                                                                            <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-tighter bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md mt-0.5">In Progress</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-1 gap-y-4 gap-x-4 lg:gap-6 min-w-0 w-full">
                                                                <div className="flex flex-col min-w-0 lg:w-[30%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-gray-400">{apt.type} Service</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-[#0B1120] dark:text-white truncate" title={apt.service}>{apt.service}</span>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 lg:w-[25%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Doctor</span>
                                                                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={apt.doctor}>{apt.doctor}</span>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 lg:w-[25%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Contact</span>
                                                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                                                                        <Phone size={14} className="text-emerald-500 shrink-0" />
                                                                        <span className="truncate" title={apt.phone}>{apt.phone}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 lg:w-[20%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Source</span>
                                                                    <div className="truncate">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter inline-block truncate max-w-full ${
                                                                            apt.source === 'Walk-in' 
                                                                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' 
                                                                                : 'text-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                                                        }`} title={apt.source}>
                                                                            {apt.source}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'history' && (
                                <div className="space-y-8">
                                    {[
                                        {
                                            dateLabel: 'Apr 20, 2026',
                                            appointments: [
                                                { id: 2, startTime: '01:30 PM', endTime: '02:30 PM', service: 'Tooth Extraction', type: 'Specialized', doctor: 'Dr. Emily Chen', phone: '+63 945 987 6543', source: 'Walk-in' },
                                            ]
                                        },
                                        {
                                            dateLabel: 'Mar 15, 2026',
                                            appointments: [
                                                { id: 3, startTime: '10:00 AM', endTime: '11:00 AM', service: 'Checkup', type: 'General', doctor: 'Dr. James Thompson', phone: '+63 917 123 4567', source: 'Account' },
                                            ]
                                        },
                                        {
                                            dateLabel: 'Jan 05, 2026',
                                            appointments: [
                                                { id: 4, startTime: '03:00 PM', endTime: '04:00 PM', service: 'Consultation', type: 'General', doctor: 'Dr. Sarah Smith', phone: '+63 928 345 6789', source: 'Guest' },
                                            ]
                                        },
                                    ].map((group, gIdx) => (
                                        <div key={gIdx} className="space-y-4">
                                            {/* Date Indicator */}
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white font-outfit whitespace-nowrap tracking-tight">
                                                    {group.dateLabel}
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white shrink-0" />
                                                <div className="h-px bg-gray-200 dark:border-gray-800 flex-1 opacity-60" />
                                            </div>

                                            <div className="space-y-4">
                                                {group.appointments.map((apt) => (
                                                    <div 
                                                        key={apt.id} 
                                                        onClick={() => setSelectedHistory({ ...apt, date: group.dateLabel })}
                                                        className="flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
                                                    >
                                                        {/* Time Sidebar */}
                                                        <div className="flex flex-row sm:flex-col w-full sm:w-[120px] bg-gray-50/50 dark:bg-gray-800/20 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0">
                                                            <div className="flex-1 flex flex-col justify-center px-4 py-2 sm:py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800">
                                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Start Time</span>
                                                                <span className="text-sm sm:text-base font-semibold text-[#0B1120] dark:text-white font-outfit truncate">{apt.startTime}</span>
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-center px-4 py-2 sm:py-3">
                                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">End Time</span>
                                                                <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 font-outfit truncate">{apt.endTime}</span>
                                                            </div>
                                                        </div>

                                                        {/* Main Content */}
                                                        <div className="flex-1 flex flex-col lg:flex-row lg:items-center p-4 sm:p-5 gap-4 lg:gap-6 xl:gap-8 min-w-0 w-full">
                                                            <div className="flex items-center gap-3 w-full lg:w-[220px] xl:w-[260px] shrink-0">
                                                                <div className="relative shrink-0">
                                                                    <img 
                                                                        alt={patient.full_name} 
                                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover" 
                                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.full_name)}&background=random`}
                                                                    />
                                                                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#111827] rounded-full bg-gray-300`}></div>
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-semibold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit group-hover:text-brand-500 transition-colors truncate">
                                                                        {patient.full_name}
                                                                    </span>
                                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Clinical History</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-1 gap-y-4 gap-x-4 lg:gap-6 min-w-0 w-full">
                                                                <div className="flex flex-col min-w-0 lg:w-[30%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-gray-400">{apt.type} Service</span>
                                                                    <span className="text-xs sm:text-sm font-semibold text-[#0B1120] dark:text-white truncate" title={apt.service}>{apt.service}</span>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 lg:w-[25%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Doctor</span>
                                                                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={apt.doctor}>{apt.doctor}</span>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 lg:w-[25%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Contact</span>
                                                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                                                                        <Phone size={14} className="text-emerald-500 shrink-0" />
                                                                        <span className="truncate" title={apt.phone}>{apt.phone}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col min-w-0 lg:w-[20%]">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Source</span>
                                                                    <div className="truncate">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter inline-block truncate max-w-full ${
                                                                            apt.source === 'Walk-in' 
                                                                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' 
                                                                                : 'text-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                                                        }`} title={apt.source}>
                                                                            {apt.source}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetailView;
