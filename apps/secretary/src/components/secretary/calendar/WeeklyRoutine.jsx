import React, { useState, useEffect, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarOff, CheckSquare, AlertTriangle, X, Phone, Link2, Settings2, Info } from 'lucide-react';
import { Switch, Input, Button, Modal } from '../../ui';
import { useToast } from '../../../context/ToastContext.jsx';
import { useDoctors } from '../../../hooks/useDoctors';
import { useSettings } from '../../../hooks/useSettings';

const WeeklyRoutine = ({ doctor, externalBlockModalOpen, setExternalBlockModalOpen, onScheduleUpdate }) => {
    const { showToast } = useToast();
    const { fetchDoctorSchedule, updateDoctorScheduleBulk, fetchDoctorBlocks, addDoctorBlock, bulkAddDoctorBlocks, deleteDoctorBlock, fetchDoctorAppointments } = useDoctors(false);

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

            await Promise.all(deletionPromises);

            // 2. Process Additions (Bulk Blocks)
            if (draftBlockedDates.size > 0) {
                const blocks = Array.from(draftBlockedDates).map(dateKey => ({
                    block_date: dateKey,
                    reason: blockReason,
                    notes: blockReason === 'other' ? otherReason : '',
                }));

                await bulkAddDoctorBlocks(doctor.id, blocks, force);
            }

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
        <div className="flex flex-col border border-gray-300 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.03] overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h4 className='text-base sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit'>
                        Weekly Routine & Blocks
                    </h4>
                    <p className='text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                        Manage availability and exceptions.
                    </p>
                    <div className='mt-2'>
                        {isUsingGlobal ? (
                            <span className='inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'>
                                <Link2 size={8} /> Synced to Clinic
                            </span>
                        ) : (
                            <span className='inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'>
                                <Settings2 size={8} /> Custom Schedule
                            </span>
                        )}
                    </div>
                </div>
                <div className='hidden sm:flex items-center gap-3'>
                    <Button
                        variant="soft"
                        onClick={openBlockModal}
                        className="h-9 px-5 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl"
                    >
                        <CalendarOff size={14} className="mr-2" />
                        Block Date
                    </Button>
                    <Button
                        variant="outline"
                        onClick={openEditModal}
                        className="h-9 px-5 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-white/5 rounded-xl"
                    >
                        <CalendarIcon size={14} className="mr-2" />
                        Edit Routine
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
                <div className='flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01] gap-4'>
                    <div>
                        <h3 className='text-sm sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit'>{monthName} {year}</h3>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Button variant="outline" size="sm" onClick={goThisMonth} className="text-[10px] font-black uppercase tracking-widest px-4 h-8 border-gray-200 dark:border-white/5 rounded-lg">Today</Button>
                        <div className='flex items-center gap-2'>
                            <button onClick={() => navMonth(setCurrentDate, currentDate, -1)} className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-800 text-gray-500 transition-all'>
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => navMonth(setCurrentDate, currentDate, 1)} className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-800 text-gray-500 transition-all'>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent'>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className='py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400'>{day}</div>
                    ))}
                </div>

                {/* Day grid */}
                <div className='grid grid-cols-7 w-full border-t border-l border-gray-200 dark:border-gray-800'>
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
                                    relative aspect-square p-2 sm:p-4 flex flex-col transition-all cursor-pointer group
                                    border-r border-b border-gray-200 dark:border-gray-800
                                    ${!isEffectivelyWorking ? 'bg-gray-50/30 dark:bg-white/[0.01]' : 'bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'}
                                `}
                            >
                                <div className="flex items-center justify-between mb-auto">
                                    <span className={`text-xs sm:text-xl font-black ${!isEffectivelyWorking ? 'text-gray-400' : isToday ? 'text-brand-500' : 'text-gray-900 dark:text-white'}`}>
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
                                        <div className='w-full flex items-center gap-1.5 opacity-80'>
                                            {isBlocked && <CalendarOff size={10} className="text-red-500" />}
                                            {isHolidayToday && <CalendarIcon size={10} className="text-indigo-500" />}
                                            <span className={`text-[7px] sm:text-[10px] font-black uppercase tracking-[0.1em] truncate ${isHolidayToday ? 'text-indigo-500' : isBlocked ? 'text-red-500' : 'text-gray-400'}`}>
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
                className='max-w-4xl w-[95%] sm:w-full m-auto'
                title="Weekly Schedule"
                subtitle="Set default availability."
                footer={(
                    <div className='flex items-center gap-3 sm:justify-end w-full sm:w-auto'>
                        <Button
                            variant='outline'
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={isSaving}
                            className='flex-1 sm:flex-none px-6 h-9 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => saveWeekly(false)}
                            disabled={isSaving}
                            className='flex-1 sm:flex-none px-8 h-9 sm:h-10 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20'
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
                            onClick={() => saveBlocks(false)}
                            disabled={isSaving || (draftBlockedDates.size === 0 && draftUnblockedDates.size === 0)}
                            className='flex-1 sm:flex-none h-11 font-bold px-8 bg-brand-500 text-white'
                        >
                            {isSaving ? 'Saving...' : 'Apply Changes'}
                        </Button>
                    </div>
                )}
            >
                <div className='flex flex-col gap-6'>
                     {/* Calendar View for selecting dates to block/unblock */}
                     <div className='border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden'>
                        <div className='flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-gray-800'>
                            <h5 className='text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white'>{blockMonthName} {blockYear}</h5>
                            <div className='flex items-center gap-2'>
                                <button onClick={() => navMonth(setBlockCalDate, blockCalDate, -1)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-800'><ChevronLeft size={14}/></button>
                                <button onClick={() => navMonth(setBlockCalDate, blockCalDate, 1)} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-800'><ChevronRight size={14}/></button>
                            </div>
                        </div>
                        <div className='grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-transparent'>
                            {['S','M','T','W','T','F','S'].map(d => <div key={d} className='py-2 text-center text-[9px] font-black text-gray-400'>{d}</div>)}
                        </div>
                        <div className='grid grid-cols-7'>
                            {Array.from({length: blockStartingDay}).map((_, i) => <div key={i} className='aspect-square bg-gray-50/30 dark:bg-gray-800/5' />)}
                            {Array.from({length: blockDaysInMonth}).map((_, i) => {
                                const d = i + 1;
                                const k = formatDateKey(blockYear, blockMonth, d);
                                const isBlocked = blockedDates.has(k);
                                const isDraftBlock = draftBlockedDates.has(k);
                                const isDraftUnblock = draftUnblockedDates.has(k);
                                
                                let cellClass = "aspect-square border-r border-b border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-white/5 ";
                                if (isDraftBlock) cellClass += "bg-brand-500 text-white shadow-inner ";
                                else if (isBlocked && !isDraftUnblock) cellClass += "bg-red-500 text-white ";
                                else if (isBlocked && isDraftUnblock) cellClass += "bg-white dark:bg-gray-900 text-gray-300 border-dashed ";
                                else cellClass += "text-gray-700 dark:text-gray-300 ";

                                return (
                                    <div key={d} onClick={() => toggleBlockDate(k)} className={cellClass}>
                                        <span className='text-xs font-black'>{d}</span>
                                        {isHoliday(k) && <div className='w-1 h-1 rounded-full bg-indigo-400 mt-1' />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1'>Block Reason</label>
                            <select 
                                value={blockReason} 
                                onChange={e => setBlockReason(e.target.value)}
                                className='w-full h-11 px-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold'
                            >
                                <option value="leave">Vacation / Leave</option>
                                <option value="emergency">Emergency Closure</option>
                                <option value="personal">Personal Reasons</option>
                                <option value="other">Other (Specify)</option>
                            </select>
                        </div>
                        {blockReason === 'other' && (
                            <div>
                                <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1'>Specify Reason</label>
                                <Input 
                                    value={otherReason}
                                    onChange={e => setOtherReason(e.target.value)}
                                    placeholder="Enter reason..."
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* 3. Conflict Resolution Modal */}
            <Modal
                isOpen={conflictModalOpen || blockConflictModalOpen}
                onClose={() => !isSaving && (setConflictModalOpen(false) || setBlockConflictModalOpen(false))}
                className='max-w-4xl'
                title="Conflict Alert"
                subtitle="Existing appointments found."
                footer={(
                    <div className='flex items-center gap-3 w-full sm:justify-end'>
                        <Button variant='outline' onClick={() => { setConflictModalOpen(false); setBlockConflictModalOpen(false); }} className='flex-1 sm:flex-none h-11 font-bold px-6'>Cancel & Adjust</Button>
                        <Button onClick={() => conflictModalOpen ? handleForceDisplace() : saveBlocks(true)} disabled={isSaving} className='flex-1 sm:flex-none h-11 font-bold px-8 bg-amber-500 text-white'>Force Save & Displace</Button>
                    </div>
                )}
            >
                <div className='space-y-6'>
                    <div className='p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-4'>
                        <AlertTriangle className='text-amber-500 shrink-0 mt-0.5' size={20} />
                        <p className='text-sm font-bold text-amber-800 dark:text-amber-200'>
                            The proposed changes conflict with <strong>{conflictingCount || blockConflictCount}</strong> upcoming appointments. If you force save, these patients will be notified and moved to the Displaced Queue for manual outreach.
                        </p>
                    </div>

                    <div className='space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1'>
                        {conflictingAppointments.map(appt => (
                            <div key={appt.id} className='p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.01] flex items-center justify-between gap-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-sm uppercase'>{getInitials(appt.profiles?.full_name || appt.guest_name)}</div>
                                    <div>
                                        <p className='text-sm font-black text-gray-900 dark:text-white uppercase'>{appt.profiles?.full_name || appt.guest_name}</p>
                                        <p className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>{format(new Date(appt.date || appt.appointment_date), 'MMM dd, yyyy')} @ {formatTimeDisplay(appt.start_time)}</p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='text-[10px] font-black text-brand-500 uppercase tracking-widest'>{appt.services?.name || 'General Checkup'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WeeklyRoutine;
