import React, { useState, useEffect, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarOff, CheckSquare, AlertTriangle, X, Phone, Link2, Settings2 } from 'lucide-react';
import { Switch, Input, Button, Modal } from '../../../ui';
import { useToast } from '../../../../context/ToastContext.jsx';
import { useDoctors } from '../../../../hooks/useDoctors';
import { useSettings } from '../../../../hooks/useSettings';

const WeeklyRoutine = ({ doctor, externalBlockModalOpen, setExternalBlockModalOpen, onScheduleUpdate }) => {
    const { showToast } = useToast();
    const { fetchDoctorSchedule, updateDoctorScheduleBulk, fetchDoctorBlocks, addDoctorBlock, deleteDoctorBlock, fetchDoctorAppointments } = useDoctors(false);

    const initialDays = [
        { id: 'Monday', isWorking: false, start: '08:00', end: '17:00' },
        { id: 'Tuesday', isWorking: false, start: '08:00', end: '17:00' },
        { id: 'Wednesday', isWorking: false, start: '08:00', end: '17:00' },
        { id: 'Thursday', isWorking: false, start: '08:00', end: '17:00' },
        { id: 'Friday', isWorking: false, start: '08:00', end: '17:00' },
        { id: 'Saturday', isWorking: false, start: '08:00', end: '12:00' },
        { id: 'Sunday', isWorking: false, start: '08:00', end: '12:00' }
    ];

    const [schedule, setSchedule] = useState(initialDays);
    const [draftSchedule, setDraftSchedule] = useState(initialDays);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ── Inheritance toggle ──
    const [isUsingGlobal, setIsUsingGlobal] = useState(true);
    const [draftIsUsingGlobal, setDraftIsUsingGlobal] = useState(true);

    // ── Conflict modal (replaces window.confirm) ──
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictingCount, setConflictingCount] = useState(0);
    const [pendingPayload, setPendingPayload] = useState(null);

    // Clinic schedule for Clone Logic
    const { schedule: clinicSchedule } = useSettings();
    
    // Track DB block IDs for deletion logic
    const [dbBlocks, setDbBlocks] = useState({}); // { dateKey: blockId }

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Internal fallback if no external state is provided (for backward compat)
    const [_isBlockModalOpen, _setIsBlockModalOpen] = useState(false);
    const isBlockModalOpen = externalBlockModalOpen !== undefined ? externalBlockModalOpen : _isBlockModalOpen;
    const setIsBlockModalOpen = setExternalBlockModalOpen !== undefined ? setExternalBlockModalOpen : _setIsBlockModalOpen;

    const [blockModalMode, setBlockModalMode] = useState('view');

    // Blocked Dates State (YYYY-MM-DD format)
    const [blockedDates, setBlockedDates] = useState(new Set());
    const [draftBlockedDates, setDraftBlockedDates] = useState(new Set());
    const [draftUnblockedDates, setDraftUnblockedDates] = useState(new Set());
    
    // Break Schedule States
    const [globalBreakEnabled, setGlobalBreakEnabled] = useState(false);
    const [globalBreakStart, setGlobalBreakStart] = useState('12:00');
    const [globalBreakEnd, setGlobalBreakEnd] = useState('13:00');
    
    // Reason States
    const [blockReason, setBlockReason] = useState('leave');
    const [otherReason, setOtherReason] = useState('');

    // Main Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Block Modal Calendar State
    const [blockCalDate, setBlockCalDate] = useState(new Date());

    const loadData = useCallback(async () => {
        if (!doctor?.id) return;
        try {
            setIsLoading(true);
            const [fetchedSchedule, fetchedBlocks] = await Promise.all([
                fetchDoctorSchedule(doctor.id),
                fetchDoctorBlocks(doctor.id)
            ]);

            // Map Schedule
            if (fetchedSchedule && fetchedSchedule.length > 0) {
                // Ensure we start with a fresh DEEP copy of initialDays
                const newSchedule = initialDays.map(day => ({ ...day }));

                // Read is_using_global from first row (same for all rows of a doctor)
                const globalFlag = fetchedSchedule[0]?.is_using_global ?? true;
                setIsUsingGlobal(globalFlag);
                setDraftIsUsingGlobal(globalFlag);

                fetchedSchedule.forEach(item => {
                    // Map 0 (Sun) -> 6, 1 (Mon) -> 0, etc.
                    const idx = item.day_of_week === 0 ? 6 : item.day_of_week - 1;
                    if (newSchedule[idx]) {
                        newSchedule[idx] = {
                            ...newSchedule[idx],
                            isWorking: item.is_working ?? item.is_available ?? newSchedule[idx].isWorking,
                            start: (item.start_time || item.start)?.substring(0, 5) || newSchedule[idx].start,
                            end: (item.end_time || item.end)?.substring(0, 5) || newSchedule[idx].end,
                            break_start_time: item.break_start_time?.substring(0, 5) || null,
                            break_end_time: item.break_end_time?.substring(0, 5) || null
                        };
                    }
                });
                setSchedule(newSchedule);
                setDraftSchedule(newSchedule);
            }

            // Map Blocks
            const blockSet = new Set();
            const blockMap = {};
            fetchedBlocks.forEach(b => {
                const dateKey = b.block_date.substring(0, 10);
                blockSet.add(dateKey);
                blockMap[dateKey] = b.id;
            });
            setBlockedDates(blockSet);
            setDbBlocks(blockMap);

        } catch (err) {
            console.error('Failed to load doctor schedule:', err);
            showToast('Failed to load doctor schedule.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [doctor?.id, fetchDoctorSchedule, fetchDoctorBlocks]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const syncDraftWithSchedule = useCallback(() => {
        const deepCopy = schedule.map(day => ({ ...day }));
        setDraftSchedule(deepCopy);
        
        const workingDayWithBreak = schedule.find(d => d.isWorking && d.break_start_time);
        if (workingDayWithBreak) {
            setGlobalBreakEnabled(true);
            setGlobalBreakStart(workingDayWithBreak.break_start_time.substring(0, 5));
            setGlobalBreakEnd(workingDayWithBreak.break_end_time.substring(0, 5));
        } else {
            setGlobalBreakEnabled(false);
            setGlobalBreakStart('12:00');
            setGlobalBreakEnd('13:00');
        }
    }, [schedule]);

    // Keep draft schedule in sync with fetched schedule when modal is not open
    useEffect(() => {
        if (!isEditModalOpen) {
            syncDraftWithSchedule();
        }
    }, [isEditModalOpen, syncDraftWithSchedule]);

    const navMonth = (setter, date, offset) => {
        setter(new Date(date.getFullYear(), date.getMonth() + offset, 1));
    };

    const goThisMonth = () => setCurrentDate(new Date());

    // Calendar Generation Logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // Sunday is 0

    // Format YYYY-MM-DD
    const formatDateKey = (y, m, d) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const jsDayToScheduleIndex = (jsDay) => jsDay === 0 ? 6 : jsDay - 1;

    // --- Weekly Edit Actions ---
    const handleToggle = (index) => {
        setDraftSchedule(prev => prev.map((day, i) => 
            i === index ? { ...day, isWorking: !day.isWorking } : day
        ));
    };

    const handleTimeChange = (index, field, value) => {
        setDraftSchedule(prev => prev.map((day, i) => 
            i === index ? { ...day, [field]: value } : day
        ));
    };

    const applyToAll = () => {
        const monday = draftSchedule[0];
        const newSchedule = draftSchedule.map((day, i) => {
            if (i === 0 || !day.isWorking) return day; 
            return { ...day, start: monday.start, end: monday.end };
        });
        setDraftSchedule(newSchedule);
        showToast('Monday\'s hours applied to all working days.', 'success');
    };

    // \u2500\u2500 Clone clinic hours into doctor draft \u2500\u2500
    const cloneFromClinic = useCallback(() => {
        if (!clinicSchedule || clinicSchedule.length === 0) {
            showToast('Clinic schedule not loaded yet.', 'error');
            return;
        }
        const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // clinic_schedule uses day_of_week 0=Sun..6=Sat; doctor schedule array is Mon=0..Sun=6
        const newDraft = draftSchedule.map((day, idx) => {
            const dow = idx === 6 ? 0 : idx + 1; // convert to JS day_of_week
            const clinicDay = clinicSchedule.find(c => c.day_of_week === dow);
            if (!clinicDay) return day;
            return {
                ...day,
                isWorking: clinicDay.is_open ?? day.isWorking,
                start: clinicDay.open_time?.substring(0, 5) || day.start,
                end: clinicDay.close_time?.substring(0, 5) || day.end,
            };
        });
        setDraftSchedule(newDraft);
        showToast('Clinic hours cloned into doctor schedule.', 'success');
    }, [clinicSchedule, draftSchedule, showToast]);

    const saveWeekly = async (overwrite = false) => {
        if (!doctor?.id) return;
        setIsSaving(true);
        try {
            const payload = draftSchedule.map((day, idx) => {
                const dow = idx === 6 ? 0 : idx + 1;
                return {
                    day_of_week: dow,
                    is_working: day.isWorking,
                    start_time: day.start,
                    end_time: day.end,
                    is_using_global: draftIsUsingGlobal,
                    break_start_time: (day.isWorking && globalBreakEnabled) ? globalBreakStart : null,
                    break_end_time: (day.isWorking && globalBreakEnabled) ? globalBreakEnd : null
                };
            });

            if (!overwrite) {
                // \u2500\u2500 Conflict detection (same logic, no window.confirm) \u2500\u2500
                const allAppointments = await fetchDoctorAppointments(doctor.id);
                let count = 0;
                
                allAppointments.forEach(appt => {
                    if (['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'COMPLETED', 'RESCHEDULED', 'DISPLACED'].includes((appt.status || '').toUpperCase())) return;
                    
                    const [y, m, d] = (appt.date || '').split('-');
                    const jsDow = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getDay(); 
                    const draftDay = payload.find(p => p.day_of_week === jsDow);
                    
                    if (!draftDay || !draftDay.is_working) {
                        count++;
                    } else {
                        const ast = (appt.start_time || '').substring(0, 5);
                        const aet = (appt.end_time || '').substring(0, 5);
                        if (ast < draftDay.start_time || aet > draftDay.end_time) {
                            count++;
                        } else if (draftDay.break_start_time && draftDay.break_end_time) {
                            if (ast < draftDay.break_end_time && aet > draftDay.break_start_time) {
                                count++;
                            }
                        }
                    }
                });

                if (count > 0) {
                    // Show polished modal instead of window.confirm
                    setConflictingCount(count);
                    setPendingPayload(payload);
                    setIsSaving(false);
                    setConflictModalOpen(true);
                    return;
                }
            }

            await updateDoctorScheduleBulk(doctor.id, { schedules: payload, overwrite });
            setIsUsingGlobal(draftIsUsingGlobal);
            await loadData();
            if (onScheduleUpdate) onScheduleUpdate();
            setIsEditModalOpen(false);
            setConflictModalOpen(false);
            setPendingPayload(null);
            showToast('Weekly routine updated and saved.', 'success');
        } catch (err) {
            showToast('Failed to save weekly routine.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleForceDisplace = async () => {
        await saveWeekly(true);
    };


    // --- Block Date Actions ---
    const toggleBlockDate = (dateKey) => {
        if (blockedDates.has(dateKey)) {
            const newUnblocks = new Set(draftUnblockedDates);
            if (newUnblocks.has(dateKey)) newUnblocks.delete(dateKey);
            else newUnblocks.add(dateKey);
            setDraftUnblockedDates(newUnblocks);
        } else {
            const newDrafts = new Set(draftBlockedDates);
            if (newDrafts.has(dateKey)) newDrafts.delete(dateKey);
            else newDrafts.add(dateKey);
            setDraftBlockedDates(newDrafts);
        }
    };

    const saveBlocks = async () => {
        if (!doctor?.id) return;
        setIsSaving(true);
        try {
            // === OVERLAP DETECTION PHASE ===
            const allAppointments = await fetchDoctorAppointments(doctor.id);
            const newBlockDates = Array.from(draftBlockedDates);
            let overlapCount = 0;
            
            // Any active appointment landing on a newly blocked date is displaced
            allAppointments.forEach(appt => {
                if (newBlockDates.includes(appt.date)) {
                    if (!['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'COMPLETED', 'RESCHEDULED'].includes((appt.status || '').toUpperCase())) {
                        overlapCount++;
                    }
                }
            });

            let overwrite = false;
            if (overlapCount > 0) {
                const confirmed = window.confirm(`Warning: Blocking these dates will displace ${overlapCount} existing appointment(s).\n\nThey will fall into the Secretary Displaced Queue. Continue with displacement?`);
                if (!confirmed) {
                    setIsSaving(false);
                    return;
                }
                overwrite = true;
            }

            // 1. Process Deletions (Unblocks)
            const deletionPromises = Array.from(draftUnblockedDates).map(dateKey => {
                const blockId = dbBlocks[dateKey];
                if (blockId) {
                    return deleteDoctorBlock(doctor.id, blockId);
                }
                return Promise.resolve();
            });

            // 2. Process Additions (Blocks)
            const additionPromises = newBlockDates.map(dateKey => {
                return addDoctorBlock(doctor.id, {
                    block_date: dateKey,
                    reason: blockReason,
                    notes: blockReason === 'other' ? otherReason : '',
                    cancel_appointments: false,
                    overwrite: overwrite
                });
            });

            await Promise.all([...deletionPromises, ...additionPromises]);

            // 3. Reload everything to be sync with DB
            await loadData();
            if (onScheduleUpdate) {
                onScheduleUpdate();
            }
            
            setIsSaving(false);
            setIsBlockModalOpen(false);
            showToast('Blocked dates successfully updated.', 'success');
        } catch (err) {
            console.error('Save blocks error:', err);
            showToast('Error updating blocked dates.', 'error');
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        syncDraftWithSchedule();
        setIsEditModalOpen(true);
    };

    const openBlockModal = () => {
        setDraftBlockedDates(new Set()); 
        setDraftUnblockedDates(new Set());
        setBlockReason('leave');
        setOtherReason('');
        setBlockCalDate(new Date()); 
        setBlockModalMode('view');
        setIsBlockModalOpen(true);
    };

    const formatTimeToAMPM = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        const mins = minutes === '00' ? '' : `:${minutes}`;
        return `${h12}${mins} ${ampm}`;
    };

    // Main calendar vars
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startingDay = getFirstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Block modal calendar vars
    const blockYear = blockCalDate.getFullYear();
    const blockMonth = blockCalDate.getMonth();
    const blockDaysInMonth = getDaysInMonth(blockYear, blockMonth);
    const blockStartingDay = getFirstDayOfMonth(blockYear, blockMonth);
    const blockMonthName = blockCalDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="flex flex-col border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h4 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                        Weekly Routine & Blocks
                    </h4>
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mt-1'>
                        Manage recurring availability and specific date exceptions.
                    </p>
                    <div className='mt-2'>
                        {isUsingGlobal ? (
                            <span className='inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'>
                                <Link2 size={9} /> Synced to Clinic
                            </span>
                        ) : (
                            <span className='inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'>
                                <Settings2 size={9} /> Custom Schedule
                            </span>
                        )}
                    </div>
                </div>
                <div className='hidden sm:flex items-center gap-3'>
                    <Button 
                        variant="soft" 
                        onClick={openBlockModal}
                        className="text-sm font-bold h-10 px-4 flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    >
                        <CalendarOff size={16} />
                        Block Date
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={openEditModal}
                        className="text-sm font-bold h-10 px-4 flex items-center gap-2"
                    >
                        <CalendarIcon size={16} />
                        Edit Weekly Sched
                    </Button>
                </div>
            </div>

            {/* Main Read-only Display view: Full Calendar */}
            <div className={`overflow-hidden bg-white dark:bg-transparent transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Syncing Routine...</span>
                        </div>
                    </div>
                )}
                <div className='flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/[0.01] gap-2'>
                    <div>
                        <h3 className='text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none'>{monthName} {year}</h3>
                    </div>
                    <div className='flex items-center gap-1.5 sm:gap-2'>
                        <Button variant="outline" size="sm" onClick={goThisMonth} className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 h-7 sm:h-8 border-gray-200 dark:border-gray-700">Today</Button>
                        <div className='flex items-center gap-1 ml-1 sm:ml-2'>
                            <button onClick={() => navMonth(setCurrentDate, currentDate, -1)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-500 transition-all'>
                                <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button onClick={() => navMonth(setCurrentDate, currentDate, 1)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-500 transition-all'>
                                <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent'>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className='py-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400'>{day}</div>
                    ))}
                </div>

                {/* Day grid */}
                <div className='grid grid-cols-7 w-full border-t border-l border-gray-200 dark:border-gray-700'>
                    {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} className='bg-gray-50/50 dark:bg-gray-800/10 border-r border-b border-gray-200 dark:border-gray-800 aspect-square' />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dateNum = i + 1;
                        const dateObj = new Date(year, month, dateNum);
                        const jsDay = dateObj.getDay();
                        const scheduleIndex = jsDayToScheduleIndex(jsDay);
                        const dayConfig = schedule[scheduleIndex];
                        const dateKey = formatDateKey(year, month, dateNum);
                        
                        const isBlocked = blockedDates.has(dateKey);
                        const isEffectivelyWorking = dayConfig.isWorking && !isBlocked;

                        const isSelected = isSameDay(dateObj, currentDate);
                        const isToday = isSameDay(dateObj, new Date());

                        return (
                            <div 
                                key={dateNum} 
                                onClick={() => setCurrentDate(dateObj)}
                                className={`
                                    relative aspect-square p-1.5 sm:p-3 flex flex-col transition-all cursor-pointer group
                                    border-r border-b border-gray-200 dark:border-gray-700
                                    ${!isEffectivelyWorking ? 'bg-gray-50/30 dark:bg-white/[0.01]' : 'bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'}
                                `}
                            >
                                <div className="flex items-center justify-between mb-auto">
                                    <span className={`text-xs sm:text-lg font-black ${!isEffectivelyWorking ? 'text-gray-400' : isToday ? 'text-brand-500' : 'text-gray-900 dark:text-white'}`}>
                                        {dateNum}
                                    </span>
                                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                                </div>

                                <div className='flex flex-col justify-end min-w-0 w-full mt-auto'>
                                    {isEffectivelyWorking ? (
                                        <div className='flex flex-col sm:flex-row sm:items-center sm:gap-1 text-[8px] sm:text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-[1.1] sm:leading-normal truncate'>
                                            {(() => {
                                                const f = (t) => {
                                                    const [h, m] = t.split(':').map(Number);
                                                    const d = new Date().setHours(h, m);
                                                    return format(d, m === 0 ? 'ha' : 'h:mma').toLowerCase();
                                                };
                                                return (
                                                    <>
                                                        <span>{f(dayConfig.start)}</span>
                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <span className="opacity-40 sm:hidden">/</span>
                                                            <span className="opacity-40 hidden sm:inline">-</span>
                                                            <span>{f(dayConfig.end)}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className='w-full flex items-center gap-1 opacity-60'>
                                            {isBlocked && <CalendarOff size={10} className="text-red-500" />}
                                            <span className='text-[7px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate'>
                                                {isBlocked ? 'Blocked' : 'Closed'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {Array.from({ length: (7 - ((startingDay + daysInMonth) % 7)) % 7 }).map((_, i) => <div key={`empty-end-${i}`} className='bg-gray-50/50 dark:bg-gray-800/10 border-r border-b border-gray-200 dark:border-gray-800 aspect-square' />)}
                </div>
            </div>

            {/* Mobile Action Buttons (Under Calendar) */}
            <div className='flex sm:hidden flex-col items-stretch gap-3 mt-6 px-5 pb-6'>
                <Button 
                    variant="soft" 
                    onClick={openBlockModal}
                    className="text-[13px] w-full font-bold h-11 px-4 flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-transparent dark:border-red-900/30"
                >
                    <CalendarOff size={16} />
                    Block Date
                </Button>
                <Button 
                    variant="outline" 
                    onClick={openEditModal}
                    className="text-[13px] w-full font-bold h-11 px-4 flex items-center justify-center gap-2"
                >
                    <CalendarIcon size={16} />
                    Edit Weekly Sched
                </Button>
            </div>

            {/* 1. Edit Weekly Schedule Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => !isSaving && setIsEditModalOpen(false)} className='max-w-5xl w-[95%] sm:w-full m-auto'>
                <div className='no-scrollbar relative w-full overflow-y-auto rounded-xl bg-white p-5 dark:bg-gray-900 sm:p-10 max-h-[90vh] flex flex-col'>
                    <div className='mb-6 flex flex-col gap-4'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div>
                                <h4 className='text-[clamp(18px,2.5vw,22px)] font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                                    Edit Weekly Schedule
                                </h4>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                                    Set default availability and working hours.
                                </p>
                            </div>
                            <Button variant="outline" onClick={applyToAll} type="button" className="text-xs font-bold h-9 px-3 flex items-center gap-2 whitespace-nowrap">
                                <Clock size={14} /> Apply Monday's Hours to All
                            </Button>
                        </div>

                        {/* ── Inheritance Toggle Row ── */}
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]'>
                            <div className='flex items-center gap-3'>
                                {draftIsUsingGlobal
                                    ? <Link2 size={16} className='text-brand-500' />
                                    : <Settings2 size={16} className='text-amber-500' />
                                }
                                <div>
                                    <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-wide'>
                                        {draftIsUsingGlobal ? 'Synced to Clinic Hours' : 'Custom Schedule'}
                                    </p>
                                    <p className='text-[10px] text-gray-400'>
                                        {draftIsUsingGlobal
                                            ? 'Doctor inherits global clinic operating hours'
                                            : 'Doctor uses their own independent schedule'}
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                {!draftIsUsingGlobal && (
                                    <Button
                                        variant='outline'
                                        type='button'
                                        onClick={cloneFromClinic}
                                        className='text-[10px] font-black h-8 px-3 whitespace-nowrap flex items-center gap-1.5 border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                                    >
                                        <Link2 size={12} /> Clone from Clinic
                                    </Button>
                                )}
                                <div className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>Inherit</span>
                                    <Switch
                                        checked={draftIsUsingGlobal}
                                        onChange={(checked) => setDraftIsUsingGlobal(checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Grid Layout for Days + Break */}
                    <div className='overflow-y-auto no-scrollbar flex-grow mb-6 max-h-[60vh] pr-1'>
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3'>
                            {/* 1. Master Break Config Card */}
                            <div className='p-2 sm:p-3 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl flex flex-col transition-all shadow-sm'>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" />
                                        Daily Break
                                    </span>
                                    <Switch checked={globalBreakEnabled} onChange={() => setGlobalBreakEnabled(!globalBreakEnabled)} className="scale-75 sm:scale-90" />
                                </div>
                                
                                {globalBreakEnabled ? (
                                    <div className="flex flex-col gap-1.5 mt-auto">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">Start</span>
                                            <Input type="time" value={globalBreakStart} onChange={(e) => setGlobalBreakStart(e.target.value)} className="w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500" />
                                        </div>
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">End</span>
                                            <Input type="time" value={globalBreakEnd} onChange={(e) => setGlobalBreakEnd(e.target.value)} className="w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex-grow flex flex-col items-center justify-center py-2 bg-white/40 dark:bg-gray-900/40 rounded-lg mt-auto border border-dashed border-gray-200 dark:border-gray-800'>
                                        <CalendarOff size={10} className="text-gray-300 mb-1" />
                                        <span className='text-[7.5px] font-bold text-gray-400 uppercase tracking-widest'>No Break</span>
                                    </div>
                                )}
                            </div>

                            {/* 2. Days Cards */}
                            {draftSchedule.map((day, index) => (
                                <div key={day.id} className={`p-2 sm:p-3 border rounded-xl flex flex-col transition-all duration-200 shadow-sm ${day.isWorking ? 'border-brand-500/30 bg-brand-50/20 dark:bg-brand-900/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 opacity-80 hover:opacity-100'}`}>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest ${day.isWorking ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
                                            {day.id}
                                        </span>
                                        <Switch checked={day.isWorking} onChange={() => handleToggle(index)} className="scale-75 sm:scale-90" />
                                    </div>
                                    
                                    {day.isWorking ? (
                                        <div className='flex flex-col gap-1.5 mt-auto'>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">Start</span>
                                                <Input type="time" value={day.start} onChange={(e) => handleTimeChange(index, 'start', e.target.value)} className="w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500" />
                                            </div>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">End</span>
                                                <Input type="time" value={day.end} onChange={(e) => handleTimeChange(index, 'end', e.target.value)} className="w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex-grow flex flex-col items-center justify-center py-2 bg-white/50 dark:bg-gray-900/50 rounded-lg mt-auto border border-dashed border-gray-200 dark:border-gray-800 transition-all'>
                                            <CalendarOff size={10} className="text-gray-300 mb-1" />
                                            <span className='text-[7.5px] font-bold text-gray-400 uppercase tracking-widest text-center'>
                                                Off Duty
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-800 sm:justify-end'>
                        <Button variant='outline' type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSaving} className='flex-1 sm:flex-none px-6 py-3.5 h-11 rounded-lg text-[14px] font-black'>Cancel</Button>
                        <Button onClick={saveWeekly} disabled={isSaving} className='flex-1 sm:flex-none px-8 py-3.5 h-11 rounded-lg text-[14px] font-black bg-gray-900 text-white min-w-[170px] dark:bg-white dark:text-gray-900 shadow-theme-xs hover:bg-gray-800 active:scale-95 transition-all'>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* 2. Block Date Multi-Select Modal */}
            <Modal isOpen={isBlockModalOpen} onClose={() => !isSaving && setIsBlockModalOpen(false)} className='max-w-[760px] w-[95%] sm:w-full m-auto'>
                <div className='no-scrollbar relative w-full overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 sm:p-8 max-h-[90vh] flex flex-col min-h-[540px]'>
                    <div className='mb-6 shrink-0'>
                        <h4 className='text-[clamp(18px,2.5vw,22px)] font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                            Manage Blocked Dates
                        </h4>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                            View current overrides, add new blocks, or remove existing ones.
                        </p>
                    </div>

                    <div className='flex flex-col md:flex-row gap-8 flex-grow'>
                        {/* LEFT PANE: Calendar */}
                        <div className='flex-grow md:w-[60%] flex flex-col'>
                            <div className='-mx-5 sm:mx-0 border-y sm:border border-gray-200 dark:border-gray-800 sm:rounded-xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]'>
                                <div className='flex items-center justify-between px-5 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                                    <h3 className='text-base font-bold text-gray-900 dark:text-white'>{blockMonthName} {blockYear}</h3>
                                    <div className='flex items-center gap-1'>
                                        <button onClick={() => navMonth(setBlockCalDate, blockCalDate, -1)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500'><ChevronLeft size={16} /></button>
                                        <button onClick={() => navMonth(setBlockCalDate, blockCalDate, 1)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500'><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                        <div key={idx} className='py-2 text-center text-[10px] font-bold uppercase text-gray-400'>{day}</div>
                                    ))}
                                </div>

                                <div className='max-h-[40vh] sm:max-h-[340px] overflow-y-auto no-scrollbar bg-gray-200 dark:bg-gray-800'>
                                    <div className='grid grid-cols-7 gap-[1px]'>
                                        {Array.from({ length: blockStartingDay }).map((_, i) => <div key={`bem-${i}`} className='bg-white dark:bg-gray-900 aspect-square' />)}
                                        
                                        {Array.from({ length: blockDaysInMonth }).map((_, i) => {
                                            const d = i + 1;
                                            const dKey = formatDateKey(blockYear, blockMonth, d);
                                            const isPendingUnblock = draftUnblockedDates.has(dKey);
                                            const isSavedBlocked = blockedDates.has(dKey);
                                            const isPendingBlock = draftBlockedDates.has(dKey);
                                            const jsDow = (blockStartingDay + i) % 7;
                                            
                                            // Check if the day is closed based on standard weekly routine
                                            const scheduleIdx = jsDayToScheduleIndex(jsDow);
                                            const isRoutineClosed = !schedule[scheduleIdx]?.isWorking;
                                            
                                            let cellClass = 'bg-white dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300';
                                            let isDisabled = true;
                                            let renderCheck = null;

                                            if (blockModalMode === 'block') {
                                                if (isRoutineClosed) {
                                                    cellClass = 'bg-gray-50 dark:bg-gray-800/20 border-transparent opacity-40 cursor-not-allowed text-gray-400';
                                                } else if (isSavedBlocked) {
                                                    cellClass = 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 opacity-90 cursor-not-allowed';
                                                    renderCheck = <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-tight sm:tracking-widest text-red-500 opacity-80 mix-blend-multiply dark:mix-blend-lighten">Blocked</span>;
                                                } else {
                                                    isDisabled = false;
                                                    if (isPendingBlock) {
                                                        cellClass = 'bg-brand-50 dark:bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-400 shadow-sm z-10';
                                                        renderCheck = <input type="checkbox" readOnly checked className="w-3.5 h-3.5 accent-brand-500 cursor-pointer pointer-events-none" />;
                                                    } else {
                                                        cellClass = 'hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer';
                                                        renderCheck = <input type="checkbox" readOnly checked={false} className="w-3.5 h-3.5 accent-brand-500 cursor-pointer pointer-events-none opacity-20" />;
                                                    }
                                                }
                                            } else if (blockModalMode === 'unblock') {
                                                if (isSavedBlocked) {
                                                    isDisabled = false;
                                                    if (isPendingUnblock) {
                                                        cellClass = 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 opacity-80 cursor-pointer border border-dashed border-gray-300 dark:border-gray-700'; 
                                                        renderCheck = <input type="checkbox" readOnly checked={false} className="w-3.5 h-3.5 cursor-pointer pointer-events-none opacity-20" />;
                                                    } else {
                                                        cellClass = 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 cursor-pointer shadow-theme-xs z-10';
                                                        renderCheck = <input type="checkbox" readOnly checked className="w-3.5 h-3.5 accent-red-500 cursor-pointer pointer-events-none opacity-90" />;
                                                    }
                                                } else {
                                                    cellClass = 'bg-gray-50 dark:bg-gray-800 border-transparent opacity-40 cursor-not-allowed text-gray-400';
                                                }
                                            } else {
                                                // VIEW MODE
                                                if (isRoutineClosed) {
                                                    cellClass = 'bg-gray-50 dark:bg-gray-800/20 border-transparent opacity-40 cursor-not-allowed text-gray-400';
                                                } else if (isSavedBlocked) {
                                                    cellClass = 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 opacity-90 cursor-not-allowed shadow-theme-xs';
                                                    renderCheck = <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-tight sm:tracking-widest text-red-500 opacity-80 mix-blend-multiply dark:mix-blend-lighten">Blocked</span>;
                                                } else {
                                                    cellClass = 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-60';
                                                }
                                            }

                                            return (
                                                <button 
                                                    key={d} 
                                                    onClick={() => !isDisabled && toggleBlockDate(dKey)}
                                                    disabled={isDisabled}
                                                    className={`aspect-square p-1 flex flex-col items-center justify-center transition-all border rounded ${cellClass}`}
                                                >
                                                    <div className='flex-grow flex items-center justify-center w-full'>
                                                        <span className='text-sm font-bold'>{d}</span>
                                                    </div>
                                                    <div className='h-4 flex items-center justify-center pb-1'>
                                                        {renderCheck}
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {Array.from({ length: (7 - ((blockStartingDay + blockDaysInMonth) % 7)) % 7 }).map((_, i) => <div key={`bee-${i}`} className='bg-white dark:bg-gray-900 aspect-square' />)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANE: Actions */}
                        <div className='md:w-[40%] flex flex-col gap-6 md:pl-2 bg-white dark:bg-gray-900'>
                            <div className='shrink-0'>
                                <label className='text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 block uppercase tracking-widest'>Action Mode</label>
                                <div className='flex flex-col gap-2'>
                                    <Button 
                                        variant={blockModalMode === 'block' ? 'primary' : 'outline'} 
                                        className="justify-between w-full h-11 font-bold font-outfit"
                                        onClick={() => {
                                            if (blockModalMode === 'block') setBlockModalMode('view');
                                            else {
                                                setBlockModalMode('block');
                                                setDraftUnblockedDates(new Set()); // Reset conflicting state
                                                showToast('Edit mode active. Click dates to block them.', 'notice', 'Notice');
                                            }
                                        }}
                                    >
                                        <span>Add Blocked Date</span>
                                        {blockModalMode === 'block' && <CheckSquare size={16} />}
                                    </Button>
                                    <Button 
                                        variant={blockModalMode === 'unblock' ? 'primary' : 'outline'} 
                                        className={`justify-between w-full h-11 font-bold font-outfit ${blockModalMode === 'unblock' ? '!bg-red-500 hover:!bg-red-600' : ''}`}
                                        onClick={() => {
                                            if (blockModalMode === 'unblock') setBlockModalMode('view');
                                            else {
                                                setBlockModalMode('unblock');
                                                setDraftBlockedDates(new Set()); // Reset conflicting state
                                                showToast('Edit mode active. Click blocked dates to remove them.', 'notice', 'Notice');
                                            }
                                        }}
                                    >
                                        <span>Remove Blocked Date</span>
                                        {blockModalMode === 'unblock' && <CheckSquare size={16} />}
                                    </Button>
                                </div>
                            </div>

                            {/* Reason details only when actively blocking */}
                            <div className={`transition-all duration-300 flex-grow flex flex-col ${blockModalMode === 'block' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <label className='text-xs font-bold text-gray-500 dark:text-gray-400 mb-2.5 block uppercase tracking-widest shrink-0'>Block Reason</label>
                                <select 
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    className='w-full h-11 shrink-0 px-3 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white'
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

                            <div className='mt-auto shrink-0'>
                                <span className='text-[11px] uppercase tracking-widest font-black text-gray-400 mb-3 block text-right'>
                                    {(draftBlockedDates.size > 0 || draftUnblockedDates.size > 0) ? `${draftBlockedDates.size > 0 ? `+${draftBlockedDates.size} To Block` : ''} ${draftUnblockedDates.size > 0 ? `-${draftUnblockedDates.size} To Remove` : ''}` : 'No Pending Changes'}
                                </span>
                                <div className='flex items-center gap-3 w-full'>
                                    <Button variant='outline' type="button" onClick={() => setIsBlockModalOpen(false)} disabled={isSaving} className='flex-1 h-11 font-bold'>Cancel</Button>
                                    <Button variant='primary' onClick={saveBlocks} disabled={isSaving || (draftBlockedDates.size === 0 && draftUnblockedDates.size === 0)} className='flex-[1.5] h-11 font-bold min-w-[130px]'>
                                        {isSaving ? 'Saving...' : 'Apply Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ── Schedule Conflict Modal (replaces window.confirm) ── */}
            {conflictModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                        <div className="flex items-start gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 shrink-0">
                                <AlertTriangle size={22} className="text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-black text-gray-900 dark:text-white">Schedule Conflict</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <strong className="text-amber-600">{conflictingCount}</strong> appointment{conflictingCount !== 1 ? 's' : ''} will fall outside the new schedule hours and will be moved to the <strong>Displaced Holding Area</strong>.
                                </p>
                            </div>
                            <button onClick={() => setConflictModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <Button
                                onClick={() => setConflictModalOpen(false)}
                                className="h-11 px-6 rounded-xl text-sm font-black border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleForceDisplace}
                                disabled={isSaving}
                                className="h-11 px-6 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            >
                                {isSaving ? 'Displacing...' : `Displace & Save`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyRoutine;
