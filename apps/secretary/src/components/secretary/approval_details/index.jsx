import React, { useState } from 'react';
import { Calendar, Clock, User, Timer, Check, Phone, Mail, X, ChevronLeft, Shield, CircleDot, OctagonAlert, CalendarX, ClipboardList, StickyNote } from 'lucide-react';
import PenaltyBadges from '../approvals/PenaltyBadges';
import { formatTime } from '../../../hooks/useAppointments';

const AppointmentDetailView = ({ 
    request, 
    onApprove, 
    onReject, 
    onBack,
    busySlots = [],
    slotPosition,
    timeStr: initialTimeStr,
    completedCount = 0,
    history = [],
    isBookingMode = false,
    breadcrumbItems = [
        { label: 'Home', href: '/secretary' },
        { label: 'Approvals', href: '/secretary/approvals' },
        { label: 'Request Details' }
    ]
}) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Internal Notes State (Optimistic)
    const [internalNote, setInternalNote] = useState(request.internalNotes || '');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSaveNote = () => {
        if (!internalNote.trim()) return;
        setIsSavingNote(true);
        setSaveSuccess(false);
        // Optimistic UI update: Wait briefly to show 'Saving...' then 'Saved'
        setTimeout(() => {
            setIsSavingNote(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }, 600);
    };

    if (!request) return null;

    const { patient, service, requestedDate, requestedTime, dentist, serviceTier, dentistPhone, dentistEmail, createdAt } = request;
    const timeStr = initialTimeStr || requestedTime.split(' ')[0];
    const isGuest = patient.source === 'GUEST_BOOKING';
    const isConflict = busySlots.some(pos => Math.abs(pos - slotPosition) < 8);

    // Calculate End Time (Mocking 1 hour duration for UI)
    const calculateEndTime = (startStr) => {
        if (!startStr) return "N/A";
        const [time, period] = startStr.split(' ');
        const [h, m] = time.split(':').map(Number);
        let endH = h + 1;
        let endPeriod = period;
        if (endH === 12) endPeriod = period === 'AM' ? 'PM' : 'AM';
        if (endH > 12) endH = 1;
        return `${endH}:${m.toString().padStart(2, '0')} ${endPeriod}`;
    };

    const endTime = calculateEndTime(requestedTime);

    // Format History Items
    const formattedHistory = history
        .filter(apt => apt.id !== request.id) 
        .sort((a, b) => new Date(b.appointment_date + ' ' + b.start_time) - new Date(a.appointment_date + ' ' + a.start_time))
        .slice(0, 15) 
        .map(apt => ({
            id: apt.id,
            startTime: formatTime(apt.start_time),
            endTime: formatTime(apt.end_time),
            date: apt.appointment_date,
            service: apt.service?.name || "Service",
            type: apt.service_tier || "General",
            doctor: apt.dentist?.profile?.last_name ? `Dr. ${apt.dentist.profile.last_name}` : "Clinician",
            source: apt.source || "Account",
            status: apt.status
        }));

    const fillerItems = [
        { id: 'f1', startTime: '9:00 AM', endTime: '10:00 AM', date: 'Apr 12, 2026', service: 'Routine Cleaning', type: 'General', doctor: 'Dr. James Thompson', source: 'Walk-in' },
        { id: 'f2', startTime: '11:00 AM', endTime: '12:00 PM', date: 'Mar 28, 2026', service: 'Tooth Extraction', type: 'General', doctor: 'Dr. Emily Chen', source: 'Account' },
        { id: 'f3', startTime: '2:30 PM', endTime: '3:30 PM', date: 'Mar 15, 2026', service: 'Root Canal', type: 'Specialized', doctor: 'Dr. Sarah Smith', source: 'Guest' },
        { id: 'f4', startTime: '10:00 AM', endTime: '11:00 AM', date: 'Feb 20, 2026', service: 'Checkup', type: 'General', doctor: 'Dr. James Thompson', source: 'Walk-in' },
        { id: 'f5', startTime: '1:00 PM', endTime: '2:00 PM', date: 'Jan 15, 2026', service: 'Braces Adjust', type: 'Specialized', doctor: 'Dr. Mark Wilson', source: 'Account' },
        { id: 'f6', startTime: '4:00 PM', endTime: '5:00 PM', date: 'Dec 05, 2025', service: 'Teeth Whitening', type: 'General', doctor: 'Dr. Lisa Ray', source: 'Guest' },
    ];

    const displayHistory = formattedHistory.length > 0 ? formattedHistory : fillerItems;

    // Timeline Steps
    const steps = [
        { 
            id: 'requested', 
            title: 'Requested', 
            desc: 'User initiated', 
            time: createdAt ? new Date(createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'Apr 17, 2:31 AM',
            status: 'completed' 
        },
        { 
            id: 'review', 
            title: 'Under Review', 
            desc: 'Awaiting clinical', 
            status: 'active' 
        },
        { 
            id: 'visit', 
            title: 'Scheduled', 
            desc: 'Visit phase', 
            status: 'pending' 
        }
    ];

    const getStepIcon = (status) => {
        if (status === 'completed') return <Check size={16} strokeWidth={3} />;
        if (status === 'active') return <CircleDot size={16} strokeWidth={3} />;
        return <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-500">
            <div className="flex-1 min-h-0 flex flex-col sm:mb-6">
                <div className="flex-grow flex flex-col bg-white dark:bg-gray-900 sm:rounded-3xl border-t sm:border border-gray-100 dark:border-gray-800 sm:shadow-theme-sm overflow-hidden h-full relative font-outfit transition-all duration-300">
                    
                    {/* Action Bar */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 shrink-0 relative">
                        <button 
                            onClick={onBack}
                            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-theme-sm hover:shadow-theme-md active:scale-95 z-10"
                        >
                            <ChevronLeft size={18} className="text-gray-400 dark:text-gray-500 group-hover:-translate-x-0.5 transition-transform duration-300" />
                            <span className="text-xs sm:text-sm font-bold">Back</span>
                        </button>
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Request Details</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 p-4 sm:p-6 lg:p-8 space-y-6">
                        <div className="max-w-7xl mx-auto space-y-6">
                            
                            {/* 1 - Status Timeline */}
                            <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shrink-0">
                                <div className="flex items-start justify-center overflow-x-auto no-scrollbar py-2">
                                    <div className="flex items-start justify-between w-full max-w-4xl min-w-[400px] px-4">
                                        {steps.map((step, index) => {
                                            const isLast = index === steps.length - 1;
                                            const isCompleted = step.status === 'completed';
                                            const isActive = step.status === 'active';
                                            
                                            return (
                                                <div key={step.id} className="relative flex flex-col items-center text-center flex-1">
                                                    {!isLast && (
                                                        <div className="absolute top-5 sm:top-6 left-1/2 w-full h-[2px] bg-gray-200 dark:bg-white/5">
                                                            <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-brand-500 w-full' : 'w-0'}`} />
                                                        </div>
                                                    )}
                                                    <div className="relative z-10 mb-4 sm:mb-6">
                                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                                                            isCompleted 
                                                                ? 'bg-brand-500 text-white scale-110' 
                                                                : isActive
                                                                    ? 'bg-white dark:bg-gray-800 border-2 border-brand-500 text-brand-500 animate-pulse'
                                                                    : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 text-gray-300'
                                                        }`}>
                                                            {getStepIcon(step.status)}
                                                        </div>
                                                    </div>
                                                    <div className="px-1 sm:px-2">
                                                        <h4 className="text-[11px] sm:text-[13px] font-black text-gray-900 dark:text-white mb-0.5 sm:mb-1 tracking-tight">
                                                            {step.title}
                                                        </h4>
                                                        <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-tight max-w-[120px] mx-auto opacity-80">
                                                            {step.desc}
                                                        </p>
                                                        {step.time && (
                                                            <div className="mt-1 sm:mt-2 text-[8px] sm:text-[9px] font-bold text-brand-500/60 uppercase tracking-widest font-mono">
                                                                {step.time}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                {/* Primary Details */}
                                <div className="lg:col-span-7 space-y-6">
                                    {/* Patient Profile */}
                                    <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 relative overflow-hidden group hover:shadow-theme-sm transition-all duration-500">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-brand-500 opacity-80 transition-all duration-500 group-hover:w-2"></div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg shrink-0 transition-transform duration-500 group-hover:scale-105">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-lg uppercase tracking-wider ${
                                                        isGuest ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-brand-100 text-brand-700 border border-brand-200'
                                                    }`}>
                                                        {isGuest ? 'Guest Booking' : 'Registered Patient'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate mb-3 sm:mb-4">
                                                    {patient.name}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 sm:gap-x-5">
                                                    <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        <Phone className="size-3.5 sm:size-4 text-emerald-500 shrink-0" />
                                                        <span className="font-semibold tabular-nums truncate">{patient.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        <Mail className="size-3.5 sm:size-4 text-blue-500 shrink-0" />
                                                        <span className="truncate font-medium">{patient.email}</span>
                                                    </div>
                                                </div>

                                                {/* Patient Statistics */}
                                                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Completed</span>
                                                        <span className="text-sm font-black text-success-600 dark:text-success-400">{completedCount}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-gray-100 dark:bg-gray-800" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">No-Shows</span>
                                                        <span className="text-sm font-black text-error-600 dark:text-error-400">{patient.noShowCount || 0}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-gray-100 dark:bg-gray-800" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Cancelled</span>
                                                        <span className="text-sm font-black text-gray-600 dark:text-gray-400">{patient.cancellationCount || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Blocks */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Doctor */}
                                        <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/20">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Assigned Doctor</span>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 sm:p-3 bg-brand-50 dark:bg-brand-900/30 rounded-xl shrink-0">
                                                    <User className="size-5 sm:size-6 text-brand-500" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{dentist}</span>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-gray-500 font-medium">
                                                            <Phone className="size-2.5 sm:size-3 text-emerald-500 shrink-0" />
                                                            <span className="tabular-nums truncate">{dentistPhone || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-gray-500 font-medium">
                                                            <Mail className="size-2.5 sm:size-3 text-blue-500 shrink-0" />
                                                            <span className="truncate">{dentistEmail || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Info */}
                                        <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/20">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Appointment Info</span>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                        <div className="p-2 sm:p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0"><Timer className="size-3.5 sm:size-4 text-gray-500" /></div>
                                                        <div className="flex flex-col gap-0.5 min-w-0">
                                                            <span className="text-[7px] sm:text-[8px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 tracking-widest w-fit">
                                                                {serviceTier || 'General'}
                                                            </span>
                                                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">{service}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Duration</span>
                                                        <span className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-white">60m</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</span>
                                                            <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 tabular-nums truncate">{requestedDate}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 sm:gap-4 text-right shrink-0">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start</span>
                                                                <span className="text-[10px] sm:text-xs font-black text-brand-600 dark:text-brand-400 tabular-nums">{requestedTime}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">End</span>
                                                                <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400 tabular-nums">{endTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* History Section */}
                                <div className="lg:col-span-5 flex flex-col min-h-[400px] lg:min-h-0 relative">
                                    <div className="lg:absolute lg:inset-0 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 flex flex-col h-full overflow-hidden">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">Recent Appointments</h3>
                                                {formattedHistory.length === 0 && (
                                                    <span className="text-[7px] sm:text-[8px] text-amber-500 font-bold uppercase tracking-tighter">Displaying Sample Data</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div title={`${completedCount} Completed`} className="p-1.5 rounded-lg bg-success-50 text-success-600 border border-success-100 opacity-30">
                                                    <Shield size={12} />
                                                </div>
                                                <div title={`${patient.noShowCount || 0} No-Shows`} className="p-1.5 rounded-lg bg-error-50 text-error-600 border border-error-100">
                                                    <OctagonAlert size={12} />
                                                </div>
                                                <div title={`${patient.cancellationCount || 0} Cancellations`} className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
                                                    <CalendarX size={12} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                            {displayHistory.map((apt, idx) => {
                                                const isFiller = apt.id.toString().startsWith('f');
                                                return (
                                                    <div key={apt.id} className={`flex flex-col bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden shrink-0 transition-all duration-500 ${isFiller ? 'opacity-40 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'opacity-100'}`} style={{ transitionDelay: `${idx * 50}ms` }}>
                                                        <div className="flex flex-row h-full">
                                                            <div className="flex flex-col w-[60px] sm:w-[70px] bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-100 dark:border-gray-800 shrink-0">
                                                                <div className="flex-1 flex flex-col justify-center px-1 sm:px-2 py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-800 text-center">
                                                                    <span className="text-[6px] sm:text-[7px] font-bold uppercase text-gray-400">Start</span>
                                                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-900 dark:text-white tabular-nums">{apt.startTime}</span>
                                                                </div>
                                                                <div className="flex-1 flex flex-col justify-center px-1 sm:px-2 py-1.5 sm:py-2 text-center">
                                                                    <span className="text-[6px] sm:text-[7px] font-bold uppercase text-gray-400">End</span>
                                                                    <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 tabular-nums">{apt.endTime}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 p-2 sm:p-3 min-w-0">
                                                                <div className="flex items-center justify-between mb-1 gap-2">
                                                                    <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest tabular-nums truncate">{apt.date}</span>
                                                                    <span className={`px-1 py-0.5 rounded-[4px] text-[6px] sm:text-[7px] font-bold uppercase shrink-0 ${apt.source === 'Walk-in' ? 'text-amber-500 bg-amber-50' : 'text-brand-500 bg-brand-50'}`}>{apt.source}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-900 dark:text-white truncate">{apt.service}</span>
                                                                    <span className="text-[6px] sm:text-[7px] font-black uppercase text-brand-500 tracking-tighter shrink-0 border border-brand-100 dark:border-brand-500/20 px-1 rounded-sm">{apt.type}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-500 truncate">
                                                                    <User size={8} className="text-brand-500 shrink-0" />
                                                                    <span className="truncate">{apt.doctor}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scheduling Verification */}
                            <div className="shrink-0 space-y-4 pt-2">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Scheduling Verification</span>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 opacity-60">Visualizing 8:00 AM - 5:00 PM clinical shift</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-500 ${isConflict ? 'bg-error-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${isConflict ? 'text-error-500' : 'text-success-500'}`}>
                                            {isConflict ? 'Schedule Conflict' : 'Clear Availability'}
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center justify-center gap-3 p-4 border rounded-2xl transition-all duration-500 ${
                                    isConflict 
                                        ? 'bg-error-50 dark:bg-error-500/10 border-error-100 dark:border-error-500/20 shadow-sm animate-in zoom-in-95' 
                                        : 'bg-success-50 dark:bg-success-500/10 border-success-100 dark:border-success-500/20'
                                }`}>
                                    {isConflict ? (
                                        <>
                                            <X className="size-4 sm:size-5 text-error-600 shrink-0" />
                                            <span className="text-xs sm:text-sm font-bold text-error-700 dark:text-error-400">Conflict detected! Dentist has an existing commitment at this time.</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="size-4 sm:size-5 text-success-600 shrink-0" />
                                            <span className="text-xs sm:text-sm font-bold text-success-700 dark:text-success-400">No scheduling conflict detected. Ready for administrative approval.</span>
                                        </>
                                    )}
                                </div>

                                {/* Interactive Schedule Bar */}
                                <div className="relative h-12 sm:h-14 bg-white dark:bg-gray-950 rounded-2xl flex items-center overflow-visible border border-gray-200 dark:border-gray-700 shadow-inner px-4 sm:px-6 mt-2">
                                    {busySlots.map((pos, idx) => {
                                        const isSlotConflict = Math.abs(pos - slotPosition) < 8;
                                        return (
                                            <div 
                                                key={`busy-${idx}`}
                                                className={`absolute h-full top-0 w-[6%] sm:w-[8%] border-x flex items-center justify-center transition-colors ${
                                                    isSlotConflict 
                                                        ? 'bg-error-500/20 dark:bg-error-500/30 border-error-500/50 z-10 animate-pulse' 
                                                        : 'bg-gray-100/60 dark:bg-gray-800/40 border-white/5 dark:border-gray-700/10 grayscale hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                                }`}
                                                style={{ left: `${pos}%` }}
                                            >
                                                <span className={`text-[5px] sm:text-[6px] font-black uppercase tracking-tighter hidden sm:block ${isSlotConflict ? 'text-error-600 dark:text-error-400' : 'text-gray-300'}`}>
                                                    {isSlotConflict ? 'Conflict' : 'Busy'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {slotPosition >= 0 && slotPosition <= 95 && (
                                        <div 
                                            className={`absolute h-[110%] sm:h-[120%] top-[-5%] sm:top-[-10%] w-[10%] sm:w-[12%] rounded-xl flex flex-col items-center justify-center shadow-theme-lg z-20 border-2 border-white dark:border-gray-900 transition-all duration-500 ${
                                                isConflict 
                                                    ? 'bg-error-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                                    : 'bg-brand-500 text-white'
                                            }`}
                                            style={{ left: `${slotPosition}%` }}
                                        >
                                            <span className="text-[7px] sm:text-[8px] font-black tabular-nums tracking-tighter leading-none">{timeStr}</span>
                                            <span className="text-[5px] sm:text-[6px] font-black uppercase opacity-60 mt-0.5 hidden sm:block">Req</span>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-4 sm:-bottom-5 left-0 w-full flex justify-between px-2 sm:px-4">
                                        {[9,11,1,3,5].map(h => (
                                            <span key={h} className="text-[7px] sm:text-[8px] font-bold text-gray-300 tracking-tighter tabular-nums uppercase">
                                                {h}{h > 8 && h < 12 ? 'am' : 'pm'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Internal Notes (Optimistic) */}
                            <div className="shrink-0 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between px-2 mb-3">
                                    <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <StickyNote size={12} className="text-amber-500" /> Internal Notes
                                    </h3>
                                    <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300 ${isSavingNote ? 'text-brand-500 opacity-100' : saveSuccess ? 'text-success-500 opacity-100' : 'opacity-0'}`}>
                                        {isSavingNote ? 'Saving...' : 'Saved'}
                                    </span>
                                </div>
                                <div className="relative group">
                                    <textarea 
                                        value={internalNote}
                                        onChange={(e) => setInternalNote(e.target.value)}
                                        onBlur={handleSaveNote}
                                        placeholder="Add private staff notes here (e.g. Patient prefers morning slots)..."
                                        className="w-full h-24 sm:h-28 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all resize-none shadow-theme-sm group-hover:shadow-theme-md"
                                    />
                                    <div className="absolute bottom-3 right-3 transition-opacity">
                                        <button 
                                            onClick={handleSaveNote}
                                            className="px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/20 active:scale-95 transition-all shadow-theme-sm border border-brand-100 dark:border-brand-500/20"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pb-12 shrink-0">
                                <button 
                                    onClick={() => setIsRejecting(true)} 
                                    className="order-2 sm:order-1 px-8 py-4 sm:py-3 bg-gray-50 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 font-bold text-sm rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95"
                                >
                                    {isBookingMode ? 'Cancel' : 'Reject Request'}
                                </button>
                                <button 
                                    onClick={onApprove} 
                                    className="order-1 sm:order-2 px-12 py-4 sm:py-3 bg-success-500 text-white font-bold text-sm rounded-2xl shadow-theme-lg active:scale-95 hover:bg-success-600 transition-all"
                                >
                                    {isBookingMode ? 'Reschedule' : 'Approve Schedule'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal Overlay */}
            {isRejecting && (
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-3xl p-6 sm:p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{isBookingMode ? 'Cancel Appointment' : 'Reject Request'}</h3>
                            <button 
                                onClick={() => setIsRejecting(false)} 
                                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 font-bold uppercase tracking-widest leading-relaxed">
                            Please provide a reason for declining this appointment request. This will be sent to the patient.
                        </p>
                        <textarea 
                            value={rejectionReason} 
                            onChange={(e) => setRejectionReason(e.target.value)} 
                            placeholder="e.g., Dentist is unavailable, slot already booked..." 
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm h-32 resize-none shadow-sm mb-6 focus:ring-2 focus:ring-error-500/20 focus:border-error-500 transition-all outline-none" 
                        />
                        <button 
                            onClick={() => onReject(rejectionReason)} 
                            disabled={!rejectionReason.trim()} 
                            className="w-full bg-error-500 text-white font-bold py-4 text-sm rounded-2xl shadow-theme-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentDetailView;
