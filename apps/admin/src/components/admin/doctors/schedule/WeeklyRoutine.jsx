import React, { useState, useEffect, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarOff, CheckSquare, AlertTriangle, X, Phone, Link2, Settings2, Info } from 'lucide-react';
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
    const [conflictingAppointments, setConflictingAppointments] = useState([]);
    const [pendingPayload, setPendingPayload] = useState(null);

    // ── Block Conflict Modal States ──
    const [blockConflictModalOpen, setBlockConflictModalOpen] = useState(false);
    const [blockConflictCount, setBlockConflictCount] = useState(0);

    // Clinic schedule for Clone Logic
    const { schedule: clinicSchedule, holidays: clinicHolidays } = useSettings();

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
            const hasExistingSchedule = fetchedSchedule && fetchedSchedule.length > 0;
            const newSchedule = initialDays.map(day => ({ ...day }));

            // Determine if the doctor is in "Custom Mode" (any row is not using global)
            const isCustomMode = hasExistingSchedule && fetchedSchedule.some(r => r.is_using_global === false);

            // Re-sync global/draft flags
            setIsUsingGlobal(!isCustomMode);
            setDraftIsUsingGlobal(!isCustomMode);

            // Build effective schedule for UI
            initialDays.forEach((day, idx) => {
                const dow = idx === 6 ? 0 : idx + 1; // Mon=0..Sun=6 -> Sun=0..Sat=6
                const clinicDay = (clinicSchedule || []).find(c => c.day_of_week === dow);
                const doctorRow = (fetchedSchedule || []).find(s => s.day_of_week === dow);

                // Inheritance Logic (Matches slot.service.js):
                // 1. If row exists and is_using_global is true -> Inherit.
                // 2. If row exists and is_using_global is false -> Custom.
                // 3. If no row exists:
                //    - If isCustomMode is false (Global) -> Inherit.
                //    - If isCustomMode is true (Custom) -> Closed (not Inheriting).

                const shouldInherit = doctorRow ? (doctorRow.is_using_global !== false) : !isCustomMode;

                if (shouldInherit && clinicDay) {
                    newSchedule[idx] = {
                        ...newSchedule[idx],
                        isWorking: clinicDay.is_open,
                        start: clinicDay.open_time?.substring(0, 5) || '09:00',
                        end: clinicDay.close_time?.substring(0, 5) || '17:00',
                        break_start_time: clinicDay.lunch_start_time?.substring(0, 5) || null,
                        break_end_time: clinicDay.lunch_end_time?.substring(0, 5) || null
                    };
                } else if (doctorRow) {
                    newSchedule[idx] = {
                        ...newSchedule[idx],
                        isWorking: doctorRow.is_working,
                        start: (doctorRow.start_time || doctorRow.start)?.substring(0, 5) || '09:00',
                        end: (doctorRow.end_time || doctorRow.end)?.substring(0, 5) || '17:00',
                        break_start_time: doctorRow.break_start_time?.substring(0, 5) || null,
                        break_end_time: doctorRow.break_end_time?.substring(0, 5) || null
                    };
                } else {
                    // Custom mode but no row for this day -> Off Duty
                    newSchedule[idx] = {
                        ...newSchedule[idx],
                        isWorking: false
                    };
                }
            });

            setSchedule(newSchedule);
            setDraftSchedule(newSchedule);

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
    }, [doctor?.id, fetchDoctorSchedule, fetchDoctorBlocks, clinicSchedule]);

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

    const isHoliday = (dateKey) => {
        return (clinicHolidays || []).some(h => h.date === dateKey);
    };

    const getHolidayName = (dateKey) => {
        return (clinicHolidays || []).find(h => h.date === dateKey)?.name || 'Holiday';
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

    // ── Clone clinic hours into doctor draft ──
    const cloneFromClinic = useCallback(() => {
        if (!clinicSchedule || clinicSchedule.length === 0) {
            showToast('Clinic schedule not loaded yet.', 'error');
            return;
        }
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

    const saveWeekly = async (force = false) => {
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

            await updateDoctorScheduleBulk(doctor.id, payload, force);
            setIsUsingGlobal(draftIsUsingGlobal);
            await loadData();
            if (onScheduleUpdate) onScheduleUpdate();
            setIsEditModalOpen(false);
            setConflictModalOpen(false);
            setPendingPayload(null);
            setConflictingAppointments([]);
            showToast('Weekly routine updated and saved.', 'success');
        } catch (err) {
            if (err.status === 409) {
                setConflictingCount(err.data.conflicts?.length || 0);
                setConflictingAppointments(err.data.conflicts || []);
                setIsSaving(false);
                setConflictModalOpen(true);
                return;
            }
            console.error('Failed to save weekly routine:', err);
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

    const saveBlocks = async (force = false) => {
        if (!doctor?.id) return;
        setIsSaving(true);
        try {
            // Backend now handles conflict detection
            await performBlockSave(force);
        } catch (err) {
            if (err.status === 409) {
                setBlockConflictCount(err.data.conflicts?.length || 0);
                setConflictingAppointments(err.data.conflicts || []);
                setBlockConflictModalOpen(true);
                setIsSaving(false);
                return;
            }
            console.error('Save blocks error:', err);
            showToast('Error updating blocked dates.', 'error');
            setIsSaving(false);
        }
    };

    const performBlockSave = async (force) => {
        setIsSaving(true);
        try {
            // 1. Process Deletions (Unblocks)
            const deletionPromises = Array.from(draftUnblockedDates).map(dateKey => {
                const blockId = dbBlocks[dateKey];
                if (blockId) {
                    return deleteDoctorBlock(doctor.id, blockId);
                }
                return Promise.resolve();
            });

            // 2. Process Additions (Blocks)
            const additionPromises = Array.from(draftBlockedDates).map(dateKey => {
                return addDoctorBlock(doctor.id, {
                    block_date: dateKey,
                    reason: blockReason,
                    notes: blockReason === 'other' ? otherReason : '',
                    cancel_appointments: false,
                    overwrite: force // Using 'overwrite' as backend expected
                });
            });

            await Promise.all([...deletionPromises, ...additionPromises]);

            await loadData();
            if (onScheduleUpdate) onScheduleUpdate();

            setIsSaving(false);
            setIsBlockModalOpen(false);
            setBlockConflictModalOpen(false);
            setConflictingAppointments([]);
            showToast('Blocked dates successfully updated.', 'success');
        } catch (err) {
            // If it's a conflict, rethrow so saveBlocks can handle it
            if (err.status === 409) throw err;
            
            console.error('Perform block save error:', err);
            showToast('Error saving blocks.', 'error');
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
                        const isHolidayToday = isHoliday(dateKey);
                        const isEffectivelyWorking = dayConfig.isWorking && !isBlocked && !isHolidayToday;

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
                                            {isHolidayToday && <CalendarIcon size={10} className="text-indigo-500" />}
                                            <span className={`text-[7px] sm:text-[10px] font-bold uppercase tracking-widest truncate ${isHolidayToday ? 'text-indigo-500' : isBlocked ? 'text-red-500' : 'text-gray-400'}`}>
                                                {isHolidayToday ? 'Holiday' : isBlocked ? 'Blocked' : 'Closed'}
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
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => !isSaving && setIsEditModalOpen(false)}
                className='max-w-5xl w-[95%] sm:w-full m-auto'
                title="Edit Weekly Schedule"
                subtitle="Set default availability and working hours."
                footer={(
                    <div className='flex items-center gap-3 sm:justify-end w-full sm:w-auto'>
                        <Button
                            variant='outline'
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={isSaving}
                            className='flex-1 sm:flex-none px-6 h-11 rounded-lg text-[14px] font-black'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => saveWeekly(false)}
                            disabled={isSaving}
                            className='flex-1 sm:flex-none px-8 h-11 rounded-lg text-[14px] font-black bg-gray-900 text-white min-w-[170px] dark:bg-white dark:text-gray-900 shadow-theme-xs hover:bg-gray-800 active:scale-95 transition-all'
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            >
                <div className='flex flex-col gap-6'>
                    {/* ── Inheritance Toggle Row (Premium Segmented Control) ── */}
                    <div className='flex flex-col gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className={`p-2 rounded-xl ${draftIsUsingGlobal ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                    {draftIsUsingGlobal ? <Link2 size={18} /> : <Settings2 size={18} />}
                                </div>
                                <div>
                                    <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider'>
                                        {draftIsUsingGlobal ? 'Automatic Inheritance' : 'Manual Override'}
                                    </p>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>
                                        {draftIsUsingGlobal ? 'Following Clinic Schedule' : 'Individual Doctor Routine'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftIsUsingGlobal(true);
                                        cloneFromClinic();
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${draftIsUsingGlobal ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-theme-xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                >
                                    Global
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDraftIsUsingGlobal(false)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!draftIsUsingGlobal ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-theme-xs' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                >
                                    Custom
                                </button>
                            </div>
                        </div>

                        {!draftIsUsingGlobal && (
                            <div className='pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3'>
                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block'>
                                    Tip: You can clone the clinic's hours and then edit them.
                                </p>
                                <div className='flex items-center gap-2 ml-auto'>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setDraftSchedule(prev => prev.map(day => ({ ...day, isWorking: false })));
                                            showToast('All days set to OFF.', 'notice', 'Cleared');
                                        }}
                                        type="button"
                                        className="text-[10px] font-black h-8 px-3 flex items-center gap-1.5 uppercase tracking-widest border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    >
                                        <X size={12} /> Clear All
                                    </Button>
                                    <Button
                                        variant='outline'
                                        type='button'
                                        onClick={cloneFromClinic}
                                        className='text-[10px] font-black h-8 px-4 whitespace-nowrap flex items-center gap-2 border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all rounded-lg active:scale-95'
                                    >
                                        <Link2 size={12} /> Sync with Clinic Config
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Card Grid Layout for Days + Break */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3'>
                        {/* 1. Master Break Config Card */}
                        {(() => {
                            const hasAnyWorkingDay = draftSchedule.some(d => d.isWorking);
                            const isBreakDisabled = draftIsUsingGlobal || !hasAnyWorkingDay;

                            return (
                                <div className={`p-2 sm:p-3 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl flex flex-col transition-all shadow-sm ${isBreakDisabled ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                    <div className='flex items-center justify-between mb-2'>
                                        <div className='flex flex-col'>
                                            <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                                <Clock size={12} className="text-gray-400" />
                                                Daily Break
                                            </span>
                                            {!hasAnyWorkingDay && !draftIsUsingGlobal && (
                                                <span className='text-[7px] font-bold text-red-500 uppercase tracking-tighter'>Pick a working day first</span>
                                            )}
                                        </div>
                                        <Switch
                                            checked={globalBreakEnabled}
                                            disabled={isBreakDisabled}
                                            onChange={() => setGlobalBreakEnabled(!globalBreakEnabled)}
                                            className="scale-75 sm:scale-90"
                                        />
                                    </div>

                                    {globalBreakEnabled && hasAnyWorkingDay ? (
                                        <div className="flex flex-col gap-1.5 mt-auto">
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">Start</span>
                                                <Input type="time" value={globalBreakStart} disabled={draftIsUsingGlobal} onChange={(e) => setGlobalBreakStart(e.target.value)} className={`w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500 ${draftIsUsingGlobal ? 'opacity-60 cursor-not-allowed text-gray-500' : ''}`} />
                                            </div>
                                            <div className="flex items-center justify-between gap-1.5">
                                                <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">End</span>
                                                <Input type="time" value={globalBreakEnd} disabled={draftIsUsingGlobal} onChange={(e) => setGlobalBreakEnd(e.target.value)} className={`w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500 ${draftIsUsingGlobal ? 'opacity-60 cursor-not-allowed text-gray-500' : ''}`} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex-grow flex flex-col items-center justify-center py-2 bg-white/40 dark:bg-gray-900/40 rounded-lg mt-auto border border-dashed border-gray-200 dark:border-gray-800'>
                                            <CalendarOff size={10} className="text-gray-300 mb-1" />
                                            <span className='text-[7.5px] font-bold text-gray-400 uppercase tracking-widest'>No Break</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* 2. Days Cards */}
                        {draftSchedule.map((day, index) => (
                            <div key={day.id} className={`p-2 sm:p-3 border rounded-xl flex flex-col transition-all duration-200 shadow-sm ${day.isWorking ? 'border-brand-500/30 bg-brand-50/20 dark:bg-brand-900/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 opacity-80 hover:opacity-100'} ${draftIsUsingGlobal ? 'opacity-80' : ''}`}>
                                <div className='flex items-center justify-between mb-2'>
                                    <span className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest ${day.isWorking ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'}`}>
                                        {day.id}
                                    </span>
                                    <Switch checked={day.isWorking} disabled={draftIsUsingGlobal} onChange={() => handleToggle(index)} className="scale-75 sm:scale-90" />
                                </div>

                                {day.isWorking ? (
                                    <div className='flex flex-col gap-1.5 mt-auto'>
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">Start</span>
                                            <Input type="time" value={day.start} disabled={draftIsUsingGlobal} onChange={(e) => handleTimeChange(index, 'start', e.target.value)} className={`w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500 ${draftIsUsingGlobal ? 'opacity-60 cursor-not-allowed text-gray-500' : ''}`} />
                                        </div>
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="text-[7.5px] sm:text-[9px] text-gray-500 uppercase font-black tracking-widest min-w-[24px]">End</span>
                                            <Input type="time" value={day.end} disabled={draftIsUsingGlobal} onChange={(e) => handleTimeChange(index, 'end', e.target.value)} className={`w-full !h-6 sm:!h-8 !p-1 sm:!px-2 !text-[8.5px] sm:!text-[11px] font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-none focus:border-brand-500 ${draftIsUsingGlobal ? 'opacity-60 cursor-not-allowed text-gray-500' : ''}`} />
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
            </Modal>

            {/* 2. Block Date Multi-Select Modal */}
            <Modal
                isOpen={isBlockModalOpen}
                onClose={() => !isSaving && setIsBlockModalOpen(false)}
                className='max-w-[760px] w-[95%] sm:w-full m-auto'
                title="Manage Blocked Dates"
                subtitle="View current overrides, add new blocks, or remove existing ones."
                footer={(
                    <div className='flex items-center gap-3 w-full sm:w-auto sm:justify-end'>
                        <Button
                            variant='outline'
                            type="button"
                            onClick={() => setIsBlockModalOpen(false)}
                            disabled={isSaving}
                            className='flex-1 sm:flex-none h-11 font-bold px-6'
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='primary'
                            onClick={() => saveBlocks(false)}
                            disabled={isSaving || (draftBlockedDates.size === 0 && draftUnblockedDates.size === 0)}
                            className='flex-[1.5] sm:flex-none h-11 font-bold min-w-[150px] px-8'
                        >
                            {isSaving ? 'Saving...' : 'Apply Changes'}
                        </Button>
                    </div>
                )}
            >
                <div className='flex flex-col md:flex-row gap-8 min-h-[400px]'>
                    {/* LEFT PANE: Calendar */}
                    <div className='flex-grow md:w-[60%] flex flex-col'>
                        <div className='border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]'>
                            <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
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

                            <div className='max-h-[340px] overflow-y-auto bg-gray-200 dark:bg-gray-800'>
                                <div className='grid grid-cols-7 gap-[1px]'>
                                    {Array.from({ length: blockStartingDay }).map((_, i) => <div key={`bem-${i}`} className='bg-white dark:bg-gray-900 aspect-square' />)}

                                    {Array.from({ length: blockDaysInMonth }).map((_, i) => {
                                        const d = i + 1;
                                        const dKey = formatDateKey(blockYear, blockMonth, d);
                                        const isPendingUnblock = draftUnblockedDates.has(dKey);
                                        const isSavedBlocked = blockedDates.has(dKey);
                                        const isPendingBlock = draftBlockedDates.has(dKey);
                                        const jsDow = (blockStartingDay + i) % 7;

                                        const scheduleIdx = jsDayToScheduleIndex(jsDow);
                                        const isRoutineClosed = !schedule[scheduleIdx]?.isWorking;

                                        const holidayToday = isHoliday(dKey);
                                        const holidayName = holidayToday ? getHolidayName(dKey) : '';

                                        let cellClass = 'bg-white dark:bg-gray-900 border-transparent text-gray-700 dark:text-gray-300';
                                        let isDisabled = true;
                                        let renderCheck = null;

                                        if (holidayToday) {
                                            cellClass = 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 opacity-90 cursor-not-allowed shadow-theme-xs';
                                            renderCheck = <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight sm:tracking-widest text-indigo-500 opacity-80 truncate px-1">Holiday</span>;
                                        } else if (blockModalMode === 'block') {
                                            if (isRoutineClosed) {
                                                cellClass = 'bg-gray-50 dark:bg-gray-800/20 border-transparent opacity-40 cursor-not-allowed text-gray-400';
                                                renderCheck = <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-tight sm:tracking-widest text-gray-400 opacity-60">Closed</span>;
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
                                            if (isRoutineClosed) {
                                                cellClass = 'bg-gray-50 dark:bg-gray-800/20 border-transparent opacity-40 cursor-not-allowed text-gray-400';
                                                renderCheck = <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-tight sm:tracking-widest text-gray-400 opacity-60">Closed</span>;
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
                    <div className='md:w-[40%] flex flex-col gap-6'>
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
                                            setDraftUnblockedDates(new Set());
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
                                            setDraftBlockedDates(new Set());
                                            showToast('Removal mode active. Click red dates to unblock.', 'notice', 'Notice');
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
                                <option value="emergency">Emergency</option>
                                <option value="personal">Personal Reasons</option>
                                <option value="training">Training / Seminar</option>
                                <option value="maintenance">Clinic Maintenance</option>
                            </select>

                            <div className='mt-6 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 flex-grow'>
                                <h5 className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Selection Summary</h5>
                                        <span className='text-[11px] font-bold text-gray-600 dark:text-gray-300'>
                                            {(draftBlockedDates.size > 0 || draftUnblockedDates.size > 0) ? `${draftBlockedDates.size > 0 ? `+${draftBlockedDates.size} To Block` : ''} ${draftUnblockedDates.size > 0 ? `-${draftUnblockedDates.size} To Remove` : ''}` : 'No Pending Changes'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>

            {conflictModalOpen && (
                <Modal 
                    isOpen={conflictModalOpen} 
                    onClose={() => setConflictModalOpen(false)}
                    title="Conflicts Detected"
                    subtitle="Appointments found outside the new routine hours."
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
                                onClick={handleForceDisplace}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0 font-bold"
                            >
                                {isSaving ? 'Saving...' : 'Force Save & Displace'}
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
                                Updating this routine will affect the following <strong>{conflictingAppointments?.length}</strong> future appointments. If you proceed, these appointments will be flagged as <span className="font-black text-amber-600 dark:text-amber-400">DISPLACED</span>.
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
                                    
                                    // Use appointment's dentist if available, otherwise fallback to the current doctor prop
                                    const doctorProfile = appt.dentists?.profiles || appt.dentist?.profile;
                                    const doctorName = doctorProfile?.full_name ? `Dr. ${doctorProfile.full_name}` : (doctor?.full_name ? `Dr. ${doctor.full_name}` : 'No Doctor Assigned');
                                    
                                    const initials = getInitials(patientName);
                                    const formattedDate = (appt.date || appt.appointment_date) ? (() => {
                                        const dateStr = appt.date || appt.appointment_date;
                                        // Append T00:00:00 to ensure local time parsing
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

                                            {/* Right Side: Status & Source Badges (Stacked with Full Labels) */}
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

            {blockConflictModalOpen && (
                <Modal 
                    isOpen={blockConflictModalOpen} 
                    onClose={() => setBlockConflictModalOpen(false)}
                    title="Conflicts Detected"
                    subtitle="Future appointments found on this date."
                    className="max-w-5xl"
                    footer={(
                        <>
                            <Button 
                                variant="secondary" 
                                onClick={() => setBlockConflictModalOpen(false)}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel & Adjust
                            </Button>
                            <Button 
                                onClick={() => saveBlocks(true)}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0 font-bold"
                            >
                                {isSaving ? 'Saving...' : 'Force Save & Displace'}
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
                                Saving this block will affect the following <strong>{conflictingAppointments?.length}</strong> future appointments. If you proceed, these appointments will be flagged as <span className="font-black text-amber-600 dark:text-amber-400">DISPLACED</span>.
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
                                    
                                    // Use appointment's dentist if available, otherwise fallback to the current doctor prop
                                    const doctorProfile = appt.dentists?.profiles || appt.dentist?.profile;
                                    const doctorName = doctorProfile?.full_name ? `Dr. ${doctorProfile.full_name}` : (doctor?.full_name ? `Dr. ${doctor.full_name}` : 'No Doctor Assigned');
                                    
                                    const initials = getInitials(patientName);
                                    const formattedDate = (appt.date || appt.appointment_date) ? (() => {
                                        const dateStr = appt.date || appt.appointment_date;
                                        // Append T00:00:00 to ensure local time parsing
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

                                            {/* Right Side: Status & Source Badges (Stacked with Full Labels) */}
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
        </div>
    );
};

export default WeeklyRoutine;
