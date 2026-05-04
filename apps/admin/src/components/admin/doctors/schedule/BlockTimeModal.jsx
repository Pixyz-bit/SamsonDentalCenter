import React, { useState } from 'react';
import { Clock, Calendar as CalendarIcon, CheckSquare, AlertCircle, X, ChevronLeft, ChevronRight, Trash2, Info, Phone } from 'lucide-react';
import { Modal, Button, Input, Badge } from '../../../ui';
import { format, addMinutes, isSameDay } from 'date-fns';
import { useDoctors } from '../../../../hooks/useDoctors';

const BlockTimeModal = ({ isOpen, onClose, events = [], doctor, timeBounds = { minStart: 8, maxEnd: 18 }, onSave }) => {
    const { addDoctorBlock, deleteDoctorBlock } = useDoctors(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [slotGap, setSlotGap] = useState(30); // 30 or 60
    const [blockModalMode, setBlockModalMode] = useState('view'); // 'view', 'block' or 'unblock'
    const [draftBlockedSlots, setDraftBlockedSlots] = useState(new Set());
    const [draftUnblockedSlots, setDraftUnblockedSlots] = useState(new Set());
    const [blockReason, setBlockReason] = useState('leave');
    const [otherReason, setOtherReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Conflict modal states
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictingAppointments, setConflictingAppointments] = useState([]);
    const [pendingGroups, setPendingGroups] = useState([]);
    const [isForcedSaving, setIsForcedSaving] = useState(false);

    // Generate Dynamic Times based on bounds
    const TIMES = [];
    for (let h = timeBounds.minStart; h < timeBounds.maxEnd; h++) {
        const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const ampm = h >= 12 ? 'PM' : 'AM';
        
        TIMES.push(`${hour}:00 ${ampm}`);
        if (slotGap === 30) {
            TIMES.push(`${hour}:30 ${ampm}`);
        }
    }

    React.useEffect(() => {
        if (isOpen) {
            setBlockModalMode('view');
            setDraftBlockedSlots(new Set());
            setDraftUnblockedSlots(new Set());
            setBlockReason('leave');
            setOtherReason('');
        }
    }, [isOpen]);

    const toggleSlot = (time) => {
        const rawTime = convertTo24h(time);
        if (blockModalMode === 'block') {
            const occupiedEvent = isSlotOccupied(rawTime);
            if (occupiedEvent && occupiedEvent.type === 'blocked') return;
            const newSlots = new Set(draftBlockedSlots);
            if (newSlots.has(time)) newSlots.delete(time);
            else newSlots.add(time);
            setDraftBlockedSlots(newSlots);
        } else {
            if (!isSlotOccupied(rawTime)) return;
            const newSlots = new Set(draftUnblockedSlots);
            if (newSlots.has(time)) newSlots.delete(time);
            else newSlots.add(time);
            setDraftUnblockedSlots(newSlots);
        }
    };

    const convertTo24h = (timeStr) => {
        const [time, ampm] = timeStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const isSlotOccupied = (time24h) => {
        return events.find(event => {
            if (event.date !== selectedDate) return false;
            const [eh, em] = event.start.split(':').map(Number);
            const eventStart = eh * 60 + em;
            const eventEnd = eventStart + event.duration;
            const [th, tm] = time24h.split(':').map(Number);
            const slotStart = th * 60 + tm;
            const slotEnd = slotStart + slotGap;
            const isOverlap = slotStart < eventEnd && eventStart < slotEnd;
            return isOverlap;
        });
    };

    const handleSave = async (force = false) => {
        if (!doctor?.id) return;
        setIsSaving(true);
        try {
            const reasonText = blockReason === 'other' ? otherReason : 
                             blockReason === 'leave' ? 'Vacation / Leave' :
                             blockReason === 'emergency' ? 'Emergency Closure' :
                             'Personal Reasons';

            if (blockModalMode === 'block') {
                // Group contiguous slots
                const sortedSlots = Array.from(draftBlockedSlots).sort((a, b) => {
                    return convertTo24h(a).localeCompare(convertTo24h(b));
                });

                const groups = [];
                if (sortedSlots.length > 0) {
                    let currentGroup = { start: sortedSlots[0], end: sortedSlots[0] };
                    for (let i = 1; i < sortedSlots.length; i++) {
                        const prevEnd24 = convertTo24h(currentGroup.end);
                        const [ph, pm] = prevEnd24.split(':').map(Number);
                        const expectedNext = format(addMinutes(new Date().setHours(ph, pm, 0, 0), slotGap), 'HH:mm');
                        
                        if (convertTo24h(sortedSlots[i]) === expectedNext) {
                            currentGroup.end = sortedSlots[i];
                        } else {
                            groups.push(currentGroup);
                            currentGroup = { start: sortedSlots[i], end: sortedSlots[i] };
                        }
                    }
                    groups.push(currentGroup);
                }

                // Call API for each group - TRY WITHOUT OVERWRITE FIRST
                try {
                    await Promise.all(groups.map(group => {
                        const start24 = convertTo24h(group.start);
                        const [eh, em] = convertTo24h(group.end).split(':').map(Number);
                        const end24 = format(addMinutes(new Date().setHours(eh, em, 0, 0), slotGap), 'HH:mm');

                        return addDoctorBlock(doctor.id, {
                            block_date: selectedDate,
                            start_time: start24,
                            end_time: end24,
                            reason: reasonText,
                            cancel_appointments: force,
                            overwrite: force
                        });
                    }));
                } catch (err) {
                    if (err.status === 409) {
                        setConflictingAppointments(err.data.conflicts || []);
                        setPendingGroups(groups);
                        setConflictModalOpen(true);
                        setIsSaving(false);
                        return;
                    }
                    throw err;
                }
            } else {
                // Unblock logic: Find blocks spanning these slots
                const blockIdsToDelete = new Set();
                draftUnblockedSlots.forEach(slotTime => {
                    const slot24 = convertTo24h(slotTime);
                    const [sh, sm] = slot24.split(':').map(Number);
                    const slotStartMin = sh * 60 + sm;
                    const slotEndMin = slotStartMin + slotGap;

                    events.forEach(event => {
                        if (event.type === 'blocked' && event.date === selectedDate) {
                            const [eh, em] = event.start.split(':').map(Number);
                            const eventStart = eh * 60 + em;
                            const eventEnd = eventStart + (event.duration || 30);
                            
                            if (slotStartMin < eventEnd && eventStart < slotEndMin) {
                                blockIdsToDelete.add(event.id);
                            }
                        }
                    });
                });

                if (blockIdsToDelete.size > 0) {
                    await Promise.all(Array.from(blockIdsToDelete).map(id => deleteDoctorBlock(doctor.id, id)));
                }
            }

            if (onSave) onSave();
            onClose();
            setDraftBlockedSlots(new Set());
            setDraftUnblockedSlots(new Set());
        } catch (err) {
            console.error('Failed to update blocks:', err);
        } finally {
            setIsSaving(false);
        }
    };
    const handleForceSave = async () => {
        setIsForcedSaving(true);
        try {
            await handleSave(true);
            setConflictModalOpen(false);
            setConflictingAppointments([]);
            setPendingGroups([]);
        } catch (err) {
            console.error('Failed to force save blocks:', err);
        } finally {
            setIsForcedSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'GP';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const formatTimeDisplay = (time) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const footer = (
        <div className="flex items-center gap-3 w-full">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSaving} className="flex-1 h-11 font-bold">Cancel</Button>
            <Button
                variant='primary'
                onClick={() => handleSave()}
                disabled={isSaving || (draftBlockedSlots.size === 0 && draftUnblockedSlots.size === 0)}
                className="flex-[1.5] h-11 font-bold min-w-[130px]"
            >
                {isSaving ? 'Saving...' : 'Apply Changes'}
            </Button>
        </div>
    );

    return (
        <>
        <Modal
            isOpen={isOpen}
            onClose={() => !isSaving && onClose()}
            title="Manage Blocked Times"
            subtitle={`Manage granular availability for ${format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}.`}
            footer={footer}
            className="max-w-[1000px] w-[95%] sm:w-full"
            noPadding={false}
        >
            <div className="flex flex-col md:flex-row gap-8">
                

                    
                    {/* LEFT COLUMN: Selector & Grid */}
                    <div className="flex-grow md:w-[60%] flex flex-col">
                        <div className='-mx-5 sm:mx-0 border-y sm:border border-gray-200 dark:border-gray-800 sm:rounded-xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]'>
                            <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Select Date</label>
                                    <input 
                                        type="date" 
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-11 px-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Interval Gap</label>
                                    <select 
                                        value={slotGap}
                                        onChange={(e) => {
                                            setSlotGap(Number(e.target.value));
                                            setDraftBlockedSlots(new Set());
                                            setDraftUnblockedSlots(new Set());
                                        }}
                                        className="w-full h-11 px-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value={30}>30 Minutes</option>
                                        <option value={60}>1 Hour</option>
                                    </select>
                                </div>
                            </div>

                            <div className="max-h-[40vh] sm:max-h-[420px] overflow-y-auto no-scrollbar p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {TIMES.map(time => {
                                        const occupiedEvent = isSlotOccupied(convertTo24h(time));
                                        const occupied = !!occupiedEvent;
                                        const isAppointment = occupied && occupiedEvent.type === 'appointment';
                                        const isPendingBlock = draftBlockedSlots.has(time);
                                        const isPendingUnblock = draftUnblockedSlots.has(time);
                                        
                                        let pillClass = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:shadow-sm";
                                        let dotClass = "bg-gray-200 dark:bg-gray-700";

                                        if (isPendingBlock) {
                                            if (isAppointment) {
                                                pillClass = "bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400 shadow-sm";
                                                dotClass = "bg-orange-500 animate-[pulse_1.5s_ease-in-out_infinite]";
                                            } else {
                                                pillClass = "bg-brand-50 dark:bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-400 shadow-sm";
                                                dotClass = "bg-brand-500";
                                            }
                                        } else if (occupied) {
                                            if (blockModalMode === 'unblock') {
                                                if (isPendingUnblock) {
                                                    pillClass = "bg-white dark:bg-gray-900 border-dashed border-brand-200 dark:border-gray-700 text-gray-400";
                                                    dotClass = "bg-brand-200 dark:bg-brand-800";
                                                } else {
                                                    pillClass = "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400";
                                                    dotClass = "bg-red-500";
                                                }
                                            } else {
                                                pillClass = isAppointment 
                                                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-200 active:scale-95 hover:border-orange-500"
                                                    : "bg-gray-50 dark:bg-white/[0.02] border-transparent opacity-40 cursor-not-allowed text-gray-400";
                                                dotClass = isAppointment ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600";
                                            }
                                        }

                                        if (blockModalMode === 'view') {
                                            if (occupied) {
                                                pillClass = isAppointment
                                                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-200 cursor-not-allowed opacity-80"
                                                    : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 cursor-not-allowed shadow-theme-xs";
                                                dotClass = isAppointment ? "bg-blue-500" : "bg-red-500";
                                            } else {
                                                pillClass = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60";
                                                dotClass = "bg-gray-200 dark:bg-gray-700 opacity-60";
                                            }
                                        }

                                        return (
                                            <button
                                                key={time}
                                                onClick={() => toggleSlot(time)}
                                                className={`h-11 rounded-xl border px-3 flex items-center justify-between transition-all active:scale-95 ${pillClass}`}
                                            >
                                                <div className='flex flex-col items-start min-w-0'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} strokeWidth={0} />
                                                        <span className="text-[10px] font-black tabular-nums whitespace-nowrap uppercase">{time}</span>
                                                    </div>
                                                    {isAppointment && (
                                                        <span className="text-[8px] font-bold truncate w-full mt-0.5 opacity-80 uppercase tracking-tighter text-left">
                                                            {occupiedEvent.patient}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className='flex items-center justify-center shrink-0 ml-1'>
                                                    {isPendingBlock ? (
                                                        <input type="checkbox" readOnly checked className={`w-3 h-3 translate-y-[-0.5px] ${isAppointment ? 'accent-orange-500' : 'accent-brand-500'}`} />
                                                    ) : occupied ? (
                                                        blockModalMode === 'unblock' ? (
                                                            <input type="checkbox" readOnly checked={!isPendingUnblock} className="w-3 h-3 accent-red-500 translate-y-[-0.5px]" />
                                                        ) : (
                                                            <span className={`text-[7px] font-black uppercase tracking-tighter ${isAppointment ? 'text-blue-500' : 'text-red-500/60'}`}>
                                                                {isAppointment ? 'BOOKED' : 'BLOCKED'}
                                                            </span>
                                                        )
                                                    ) : blockModalMode === 'view' ? (
                                                        <span className="opacity-0"></span> // Hide checkbox in view mode
                                                    ) : (
                                                        <input type="checkbox" readOnly checked={false} className="w-3 h-3 opacity-10 cursor-pointer" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Management (Standardized) */}
                    <div className="md:w-[40%] flex flex-col gap-6 md:pl-2 bg-white dark:bg-gray-900">
                        <div className="shrink-0">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 block uppercase tracking-widest">Action Mode</label>
                            <div className="flex flex-col gap-2">
                                <Button 
                                    variant={blockModalMode === 'block' ? 'primary' : 'outline'} 
                                    className="justify-between w-full h-11 font-bold font-outfit"
                                    onClick={() => {
                                        if (blockModalMode === 'block') setBlockModalMode('view');
                                        else {
                                            setBlockModalMode('block');
                                            setDraftUnblockedSlots(new Set());
                                        }
                                    }}
                                >
                                    <span>Add Blocked Time</span>
                                    {blockModalMode === 'block' && <CheckSquare size={16} />}
                                </Button>
                                <Button 
                                    variant={blockModalMode === 'unblock' ? 'primary' : 'outline'} 
                                    className={`justify-between w-full h-11 font-bold font-outfit ${blockModalMode === 'unblock' ? '!bg-red-500 hover:!bg-red-600' : ''}`}
                                    onClick={() => {
                                        if (blockModalMode === 'unblock') setBlockModalMode('view');
                                        else {
                                            setBlockModalMode('unblock');
                                            setDraftBlockedSlots(new Set());
                                        }
                                    }}
                                >
                                    <span>Remove Blocked Time</span>
                                    {blockModalMode === 'unblock' && <CheckSquare size={16} />}
                                </Button>
                            </div>
                        </div>

                        <div className={`transition-all duration-300 flex-grow flex flex-col ${blockModalMode === 'block' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 block uppercase tracking-widest shrink-0">Block Reason</label>
                            <select 
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full h-11 shrink-0 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white"
                            >
                                <option value="leave">Vacation / Leave</option>
                                <option value="emergency">Emergency Closure</option>
                                <option value="personal">Personal Reasons</option>
                                <option value="other">Other (Specify)</option>
                            </select>
                            {blockReason === 'other' && (
                                <div className="mt-2 animate-fade-in flex-grow flex flex-col min-h-[60px]">
                                    <textarea 
                                        placeholder="Type custom reason..."
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                        className="w-full h-full flex-grow text-sm font-bold bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 shrink-0">
                            <span className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-3 block text-right">
                                {(draftBlockedSlots.size > 0 || draftUnblockedSlots.size > 0) ? `${draftBlockedSlots.size > 0 ? `+${draftBlockedSlots.size} To Block` : ''} ${draftUnblockedSlots.size > 0 ? `-${draftUnblockedSlots.size} To Remove` : ''}` : 'No Pending Changes'}
                            </span>
                        </div>
                    </div>
                </div>
        </Modal>

            {conflictModalOpen && (
                <Modal 
                    isOpen={conflictModalOpen} 
                    onClose={() => !isForcedSaving && setConflictModalOpen(false)}
                    title="Conflicts Detected"
                    subtitle="Appointments found in the selected slots."
                    className="max-w-5xl"
                    footer={(
                        <>
                            <Button 
                                variant="secondary" 
                                onClick={() => setConflictModalOpen(false)}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel & Adjust
                            </Button>
                            <Button 
                                onClick={handleForceSave}
                                disabled={isForcedSaving}
                                className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0 font-bold"
                            >
                                {isForcedSaving ? 'Saving...' : 'Force Save & Displace'}
                            </Button>
                        </>
                    )}
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
                            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                <Info size={24} />
                            </div>
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                                Saving these blocks will affect the following <strong>{conflictingAppointments?.length}</strong> future appointments. If you proceed, these appointments will be flagged as <span className="font-black text-amber-600 dark:text-amber-400">DISPLACED</span>.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-brand-500" />
                                Affected Appointments
                            </h4>
                            <div className="space-y-4 pb-2">
                                {conflictingAppointments?.map(appt => {
                                    const patientName = appt.profiles?.full_name || (appt.guest_first_name ? `${appt.guest_first_name} ${appt.guest_last_name}` : appt.guest_name) || 'Guest Patient';
                                    const contactInfo = appt.profiles?.phone || appt.guest_phone || 'No contact';
                                    const serviceName = appt.services?.name || 'Dental Service';
                                    
                                    const doctorProfile = appt.dentists?.profiles || appt.dentist?.profile;
                                    const doctorName = doctorProfile?.full_name ? `Dr. ${doctorProfile.full_name}` : (doctor?.full_name ? `Dr. ${doctor.full_name}` : 'No Doctor Assigned');
                                    
                                    const initials = getInitials(patientName);
                                    const formattedDate = (appt.date || appt.appointment_date) ? (() => {
                                        const dateStr = appt.date || appt.appointment_date;
                                        const d = new Date(dateStr + 'T00:00:00');
                                        return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'MMM dd yyyy').toUpperCase();
                                    })() : 'N/A';

                                    return (
                                        <div key={appt.id} className="flex flex-col sm:flex-row bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            {/* Left Side: Date & Time */}
                                            <div className="flex sm:flex-col justify-between sm:justify-center sm:w-40 bg-gray-50/50 dark:bg-gray-800/30 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 shrink-0 text-center sm:text-left">
                                                <div className="px-4 py-3">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                                    <p className="text-[11px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">{formattedDate}</p>
                                                </div>
                                                <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800" />
                                                <div className="px-4 py-3">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                                                    <p className="text-[11px] font-black text-brand-500 leading-none">
                                                        {formatTimeDisplay(appt.start_time)} - {formatTimeDisplay(appt.end_time)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Main Content Area */}
                                            <div className="flex-grow p-4 sm:p-5 flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-brand-500/20 border-2 border-white dark:border-gray-900">
                                                        {initials}
                                                    </div>
                                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                                </div>

                                                <div className="flex-grow">
                                                    <p className="text-base font-black text-gray-900 dark:text-white leading-tight mb-1">{patientName}</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">{serviceName}</p>
                                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{doctorName}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[11px] font-medium text-gray-500 flex items-center gap-2">
                                                                <Phone size={10} className="text-green-500" />
                                                                <span className="text-gray-800 dark:text-gray-200">{contactInfo}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side: Status & Source Badges */}
                                            <div className="flex flex-row sm:flex-col items-stretch justify-center border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-white/[0.01] shrink-0 min-w-[200px]">
                                                {/* Source */}
                                                <div className="px-5 py-4 flex flex-col sm:items-start items-center gap-2">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Appointment Source</p>
                                                    {(() => {
                                                        const source = appt.source || 'USER_BOOKING';
                                                        const sourceColors = {
                                                            'GUEST_BOOKING': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
                                                            'USER_BOOKING': 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
                                                            'WALK_IN': 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
                                                            'WAITLIST': 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                        };
                                                        const sourceClass = sourceColors[source] || sourceColors['USER_BOOKING'];
                                                        const sourceLabel = source.replace('_', ' ');
                                                        return (
                                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm ${sourceClass}`}>
                                                                {sourceLabel}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800" />

                                                {/* Status */}
                                                <div className="px-5 py-4 flex flex-col sm:items-start items-center gap-2">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Appointment Status</p>
                                                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border ${appt.status === 'CONFIRMED'
                                                            ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                        }`}>
                                                        {appt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default BlockTimeModal;
