import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Lock, Calendar as CalendarIcon, Clock as ClockIcon, Info, ArrowRight, MousePointer2, Loader2, Plus, Check, Users, CalendarX, AlertCircle, X } from 'lucide-react';
import useSlots from '../../hooks/useSlots';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import ErrorState from '../common/ErrorState';

const DateTimeStep = ({
    serviceId,
    selectedDate,
    selectedTime,
    onUpdate,
    onNext,
    onBack,
    sessionId,
    slotHold,
    formData,
    excludeAppointmentId,
    serviceTier,
    error,
}) => {
    const lastErrorRef = useRef(null);
    const toast = useToast();
    const { activeHold, holdSlot, releaseHold, formattedTime, holdLoading, holdError, timeRemaining } = slotHold;
    const [pendingSlot, setPendingSlot] = useState(null);
    const [specialists, setSpecialists] = useState([]);
    const [specialistsLoading, setSpecialistsLoading] = useState(true);
    const [specialistsError, setSpecialistsError] = useState(null);
    const [availabilityStatus, setAvailabilityStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [pendingDate, setPendingDate] = useState(null);
    const dentistId = formData?.dentist_id || null;
    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
    
    // ✅ Fetch clinic-wide settings (holidays, schedule)
    const { settings, holidays, schedule, loading: settingsLoading, refetch: refetchSettings } = useClinicSettings();
    
    // VISIBILITY LIMIT: 3 columns * 6 rows = 18 slots
    const INITIAL_VISIBLE_COUNT = 18;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const minDate = useMemo(() => {
        const d = new Date();
        const leadTimeDays = settings?.booking_lead_time_days || 1;
        d.setDate(d.getDate() + leadTimeDays);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [settings]);

    const maxDate = useMemo(() => {
        const horizon = settings?.booking_max_horizon_days || 90;
        const d = new Date(today);
        d.setDate(d.getDate() + horizon);
        d.setHours(23, 59, 59, 999); // End of the horizon day
        return d;
    }, [today, settings]);

    const [viewDate, setViewDate] = useState(() => {
        if (selectedDate) return new Date(selectedDate);
        const d = new Date(today);
        d.setDate(1);
        return d;
    });

    const navigateMonth = (direction) => {
        setViewDate((prev) => {
            const next = new Date(prev);
            next.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            return next;
        });
    };

    const formatDateKey = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // ✅ Fetch overall availability status (slots for next 90 days)
    const fetchAvailabilityStatus = useCallback(async () => {
        if (!serviceId) return;
        setStatusLoading(true);
        try {
            let url = `/slots/service-status/${serviceId}`;
            if (dentistId) {
                url += `?dentistId=${dentistId}`;
            }
            const data = await api.get(url);
            setAvailabilityStatus(data);
        } catch (err) {
            console.error('Failed to check service status:', err);
        } finally {
            setStatusLoading(false);
        }
    }, [serviceId, dentistId]);



    // ✅ Fetch qualified specialists for this service
    useEffect(() => {
        if (serviceId) {
            const fetchSpecialists = async () => {
                setSpecialists([]); // 🎯 Clear old data to trigger skeleton
                setAvailabilityStatus(null); 
                setSpecialistsLoading(true);
                setStatusLoading(true);
                setSpecialistsError(null);
                try {
                    const data = await api.get(`/services/${serviceId}/specialists`);
                    const loadedSpecialists = data.specialists || [];
                    setSpecialists(loadedSpecialists);

                    // ✅ Sync dentist name if ID exists but name is missing (e.g., on recovery or refresh)
                    if (dentistId && !formData?.dentist_name && loadedSpecialists.length > 0) {
                        const specialist = loadedSpecialists.find(s => s.id === dentistId);
                        if (specialist) {
                            const { first_name, last_name, full_name } = specialist.profile || {};
                            const doctorName = (first_name || last_name)
                                ? `Dr. ${first_name} ${last_name}`.trim()
                                : (full_name || 'Selected Dentist');
                            
                            onUpdate({ dentist_name: doctorName });
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch specialists:', err);
                    setSpecialistsError(err.message);
                } finally {
                    setSpecialistsLoading(false);
                }
            };
            fetchSpecialists();
            fetchAvailabilityStatus();
        }
    }, [serviceId, fetchAvailabilityStatus, dentistId, formData?.dentist_name]);

    const {
        slots,
        nextAvailableDate,
        loading: slotsLoading,
        isPending,
        refetch: refetchSlots,
    } = useSlots(
        selectedDate || null, 
        serviceId || null, 
        true, 
        sessionId, 
        dentistId, 
        excludeAppointmentId
    );

    // ✅ Consolidated Global Refresh (Calendar + Slots + Hold)
    const handleGlobalRefresh = useCallback(async () => {
        // 1. Sync Clinic Rules & Holidays
        refetchSettings();
        // 2. Sync Doctor Availability Logic
        fetchAvailabilityStatus();
        // 3. Sync Timeslots (if a date is selected)
        if (selectedDate) {
            refetchSlots();
        }
        // 4. Sync Hold Status
        slotHold.checkActiveHold?.();
    }, [refetchSettings, fetchAvailabilityStatus, refetchSlots, selectedDate, slotHold]);

    const isLoading = slotsLoading || isPending;
    const isProcessing = isLoading || !!pendingSlot || !!pendingDate || holdLoading || statusLoading;

    // ✅ Clear pendingDate when slots finish loading
    useEffect(() => {
        if (!isLoading) {
            setPendingDate(null);
        }
    }, [isLoading]);

    // ✅ Sync Error Alerts with Success Alert style (Standard Toasts)
    useEffect(() => {
        if (holdError && holdError !== lastErrorRef.current) {
            // User doesn't want duration on "Slot Taken" error
            const isSlotTaken = holdError.toLowerCase().includes('someone else');
            const durationText = (formattedTime && !isSlotTaken) ? ` (Hold expires in: ${formattedTime})` : '';
            toast.error(`${holdError}${durationText}`);
            lastErrorRef.current = holdError;
        } else if (!holdError && lastErrorRef.current === holdError) {
             lastErrorRef.current = null;
        }
    }, [holdError, toast]); // Remove formattedTime to stop multiple popups per second

    useEffect(() => {
        if (error && !error.includes('fetch') && error !== lastErrorRef.current) {
            toast.error(error);
            lastErrorRef.current = error;
        } else if (!error && lastErrorRef.current === error) {
            lastErrorRef.current = null;
        }
    }, [error, toast]);

    const handleSpecialistChange = async (id) => {
        if (isProcessing) return; // ✅ Block while loading
        const val = id || null;
        
        // Inform user about loading
        const specialist = specialists.find(s => s.id === val);
        
        const getDoctorName = (s) => {
            if (!s?.profile) return 'Any Available Dentist';
            const { first_name, last_name, full_name } = s.profile;
            if (first_name || last_name) {
                return `Dr. ${first_name} ${last_name}`.trim();
            }
            return full_name || 'Selected Dentist';
        };

        const doctorName = getDoctorName(specialist);
        
        toast.info(`Loading available dates for ${doctorName}...`);

        // 🎯 Reset everything when doctor changes
        if (selectedDate || selectedTime) {
            await releaseHold();
            onUpdate({ 
                dentist_id: val, 
                dentist_name: doctorName,
                date: '', 
                time: '' 
            });
        } else {
            onUpdate({ 
                dentist_id: val,
                dentist_name: doctorName
            });
        }
    };

    const handleDateClick = async (date) => {
        if (isLoading) return; // ✅ Block while loading
        const key = formatDateKey(date);
        
        // If clicking a NEW date while a slot is already held, release that hold first
        if (selectedTime && selectedDate !== key) {
            await releaseHold();
        }

        setPendingDate(key);
        // Toggle Logic: If clicking the SAME date that's already selected, clear it
        if (selectedDate === key) {
            await releaseHold();
            onUpdate({ date: '', time: '' });
            setPendingDate(null);
        } else {
            onUpdate({ date: key, time: '' });
        }
        setVisibleCount(INITIAL_VISIBLE_COUNT); // RESET visibility when date changes or toggles
    };

    const handleTimeClick = async (slotData) => {
        if (!serviceId || !selectedDate) return;
        
        // ✅ Guest Booking: Strictly prevent booking if slot is full (no waitlist)
        if (slotData.available <= 0) return;

        const isCurrentlySelected = selectedTime === slotData.rawTime;
        setPendingSlot(slotData.rawTime);
        try {
            if (isCurrentlySelected) {
                await releaseHold();
                onUpdate({ time: '' });
            } else {
                const holdResult = await holdSlot(serviceId, selectedDate, slotData.rawTime, dentistId);
                if (holdResult?.success) {
                    onUpdate({ time: slotData.rawTime });
                    toast.success(`Slot hold success! You have ${holdResult.expires_in_minutes || 10} minutes to finish your booking.`);
                } else if (holdResult?.error === 'SLOT_TAKEN') {
                    refetchSlots();
                    return;
                }
            }
        } finally {
            setPendingSlot(null);
        }
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculation for Progress Bar
    const holdProgress = useMemo(() => {
        if (!activeHold || timeRemaining === null) return 0;
        const totalDurationSeconds = (activeHold.expires_in_minutes || 15) * 60;
        return Math.min(100, Math.max(0, (timeRemaining / totalDurationSeconds) * 100));
    }, [activeHold, timeRemaining]);

    const formatHoldDetail = () => {
        if (!activeHold) return '';
        const date = new Date(activeHold.date);
        const dayName = dayNames[date.getDay()];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${dayName}, ${monthNames[date.getMonth()]} ${date.getDate()} at ${activeHold.time}`;
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startOfGrid = new Date(firstDayOfMonth);
        startOfGrid.setDate(1 - firstDayOfMonth.getDay());
        const totalCells = Math.ceil((lastDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7) * 7;
        const days = [];
        for (let i = 0; i < totalCells; i++) {
            const d = new Date(startOfGrid);
            d.setDate(startOfGrid.getDate() + i);
            d.setHours(0,0,0,0);
            days.push(d);
        }
        return days;
    }, [viewDate]);

    // ✅ Navigation Restrictions
    const canGoPrev = useMemo(() => {
        const firstDayOfCurrentMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        return firstDayOfCurrentMonth > minDate;
    }, [viewDate, minDate]);

    const canGoNext = useMemo(() => {
        const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        return nextMonth <= maxDate;
    }, [viewDate, maxDate]);

    // Filtered Slots for "Load More"
    const visibleSlots = useMemo(() => {
        if (!slots) return [];
        // ✅ Guest Booking: Show ALL slots (including full ones) as disabled, similar to User Booking
        return slots.slice(0, visibleCount);
    }, [slots, visibleCount]);

    const hasMoreSlots = slots && slots.length > visibleCount;

    // Custom Premium Doctor Dropdown Component
    const DoctorDropdown = () => {
        const getDoctorName = (s) => {
            if (!s?.profile) return 'Any Available Dentist';
            const { first_name, last_name, suffix, full_name } = s.profile;
            if (first_name || last_name) {
                return `Dr. ${first_name} ${last_name}`.trim();
            }
            return full_name;
        };

        const selectedDoctor = specialists.find(s => s.id === dentistId);
        const initials = selectedDoctor 
            ? ((selectedDoctor.profile?.first_name?.[0] || '') + (selectedDoctor.profile?.last_name?.[0] || '')).toUpperCase() || 'D'
            : '✨';

        return (
            <div className='relative w-full mb-10'>
                <h3 className='text-[13px] font-black text-gray-400 mb-4 flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                    Select Dentist
                </h3>
                
                {/* Main Trigger Button */}
                <button
                    type="button"
                    onClick={() => !isProcessing && setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-white/[0.02] border-2 rounded-2xl transition-all shadow-theme-sm group ${
                        isDoctorDropdownOpen 
                            ? 'border-brand-500 ring-4 ring-brand-500/10 bg-brand-50/10' 
                            : 'border-gray-200 dark:border-gray-800 hover:border-brand-400'
                    } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <div className='flex items-center gap-3.5'>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden border transition-all ${
                            !dentistId ? 'bg-brand-500 border-brand-500 text-white' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800'
                        }`}>
                            {selectedDoctor?.photo_url ? (
                                <img src={selectedDoctor.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : !dentistId ? <Users size={20} /> : initials}
                        </div>
                        <div className="flex flex-col text-left justify-center">
                            <span className="text-[12px] sm:text-[14px] font-black text-gray-900 dark:text-white leading-tight">
                                {selectedDoctor ? getDoctorName(selectedDoctor) : 'Any Available Dentist'}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                                {selectedDoctor 
                                    ? (serviceTier === 'specialized' ? 'Medical Specialist' : 'Clinical Dentist') 
                                    : "Best match for your selected time"}
                            </span>
                        </div>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 transition-colors ${isDoctorDropdownOpen ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-500 ${isDoctorDropdownOpen ? 'rotate-180 text-brand-500' : 'group-hover:text-brand-500'}`} />
                    </div>
                </button>

                {/* Dropdown Menu Overlay */}
                {isDoctorDropdownOpen && (
                    <>
                        <div className='fixed inset-0 z-40' onClick={() => setIsDoctorDropdownOpen(false)} />
                        <div className='absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#0f172a] border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200'>
                            <div className='max-h-[320px] overflow-y-auto p-2 scrollbar-hide'>
                                {/* Any Dentist Option */}
                                <button
                                    onClick={() => { handleSpecialistChange(''); setIsDoctorDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left mb-1 group ${
                                        !dentistId 
                                            ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30' 
                                            : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-lg overflow-hidden border transition-colors ${
                                        !dentistId ? 'bg-brand-500 border-brand-500 text-white' : 'bg-brand-50 border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20 text-brand-500'
                                    }`}>
                                        <Users size={20} />
                                    </div>
                                    <div className='flex flex-col flex-grow justify-center'>
                                        <span className={`text-[12px] sm:text-[14px] font-black ${!dentistId ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>Any Available Dentist</span>
                                        <span className={`text-[9px] sm:text-[10px] font-bold leading-tight mt-0.5 ${!dentistId ? 'text-brand-600/70 dark:text-brand-400/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                            We’ll match you with a dentist available at your selected time.
                                        </span>
                                    </div>
                                    {!dentistId && (
                                        <div className='w-5 h-5 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white'>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className='px-3 py-1 mb-1'>
                                    <div className='h-px bg-gray-100 dark:bg-gray-800 w-full' />
                                </div>

                                {/* Doctor Options */}
                                {specialists.map(s => {
                                    const isSelected = dentistId === s.id;
                                    const doctorInitials = ((s.profile?.first_name?.[0] || '') + (s.profile?.last_name?.[0] || '')).toUpperCase() || 'D';
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => { handleSpecialistChange(s.id); setIsDoctorDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left mb-1 group ${
                                                isSelected 
                                                    ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30' 
                                                    : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className='w-10 h-10 shrink-0 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 group-hover:border-brand-200 transition-colors'>
                                                {s.photo_url ? (
                                                    <img src={s.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className={`text-xs font-black ${isSelected ? 'text-brand-600' : 'text-gray-400'}`}>{doctorInitials}</span>
                                                )}
                                            </div>
                                            <div className='flex flex-col flex-grow justify-center'>
                                                <span className={`text-[12px] sm:text-[14px] font-black ${isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {getDoctorName(s)}
                                                </span>
                                                <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${isSelected ? 'text-brand-600/70 dark:text-brand-400/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {serviceTier === 'specialized' ? 'Medical Specialist' : 'Clinical Dentist'}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className='w-5 h-5 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white'>
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const hasNoSpecialists = !specialistsLoading && specialists.length === 0;
    // If availabilityStatus is null AFTER loading finishes, it means the API crashed or failed. 
    // In strict mode, we should treat that as NO slots.
    const hasStatusError = !statusLoading && availabilityStatus === null;
    const hasNoSlots = (!statusLoading && availabilityStatus?.is_bookable === false) || hasStatusError;
    const showNoAppointments = hasNoSpecialists || hasNoSlots;

    // ✅ Initial Loading State: Prevent flicker by showing a high-fidelity pulse skeleton
    if ((specialistsLoading || statusLoading) && (specialists.length === 0 || !availabilityStatus)) {
        return (
            <div className="flex flex-col gap-10 animate-pulse py-2">
                {/* Header Skeleton */}
                <div className='mb-8 sm:mb-10'>
                    <div className='h-7 sm:h-10 bg-gray-200 dark:bg-gray-700/60 rounded-2xl w-full max-w-sm mb-4' />
                    <div className='h-4 bg-gray-100 dark:bg-gray-800/40 rounded-xl w-full max-w-2xl' />
                </div>
                
                {/* Doctor Select Skeleton */}
                <div className="h-20 bg-gray-100 dark:bg-white/[0.02] border-2 border-gray-200 dark:border-gray-800 rounded-3xl w-full flex items-center px-4 gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
                    <div className="flex flex-col gap-2 flex-grow">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-lg w-1/3" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800/40 rounded-lg w-1/4" />
                    </div>
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700/60 rounded-md" />
                </div>
                
                <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-8 gap-y-10 mb-10'>
                    {/* Column 1: Calendar Skeleton */}
                    <div className="flex flex-col gap-5">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-lg w-32 ml-1" />
                        <div className="bg-gray-100 dark:bg-white/[0.02] border-2 border-gray-200 dark:border-gray-800 rounded-[32px] sm:rounded-[40px] p-6 h-[440px]">
                            <div className="flex justify-between items-center mb-8">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700/60 rounded-xl w-32" />
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700/60 rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-4">
                                {[...Array(35)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700/40 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Slots Skeleton */}
                    <div className="flex flex-col gap-5">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-lg w-40 ml-1" />
                        <div className="bg-gray-100 dark:bg-white/[0.02] border-2 border-gray-200 dark:border-gray-800 rounded-[32px] sm:rounded-[40px] p-6 h-[440px]">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700/60 rounded-xl w-32 mb-10" />
                            <div className="grid grid-cols-2 xsm:grid-cols-3 gap-3">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700/40 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer Skeleton */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 mt-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700/60 rounded-lg w-24" />
                    <div className="h-14 bg-gray-300 dark:bg-gray-700/80 rounded-2xl w-52" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-5 sm:pb-6">
            {(error?.includes('fetch') || specialistsError?.includes('fetch')) ? (
                <div className='grow flex flex-col py-10'>
                     <ErrorState 
                        error={error || specialistsError} 
                        onRetry={() => window.location.reload()} 
                        title="Connection Issues"
                    />
                </div>
            ) : (
                <>
                    {/* Header Section */}
                    <div className='mb-8 sm:mb-10'>
                        <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                            Choose Schedule
                        </h2>
                        <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed font-medium'>
                            Pick a date, time, and dentist. Use "Any Available Dentist" for more options.
                        </p>
                    </div>

                    {showNoAppointments ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white dark:bg-white/[0.02] border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] shadow-theme-sm my-10">
                            <div className="w-24 h-24 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-8">
                                <CalendarX size={44} className="text-brand-500" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight font-display">
                                No Available Appointments
                            </h3>
                            
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-10 text-sm md:text-base font-medium">
                                {availabilityStatus?.message || "There are no available appointments for this service right now. Please try selecting another service or contact us for assistance."}
                            </p>
                            
                            <button 
                                onClick={onBack}
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/25 active:scale-95 text-xs"
                            >
                                <ChevronRight size={18} className="rotate-180" />
                                Choose Another Service
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* FULL WIDTH DENTIST SELECTION */}
                            <DoctorDropdown />

                            {/* 2-COLUMN LAYOUT */}
                            <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-8 gap-y-10 mb-10'>
                                
                                {/* Column 1: Select Date (Calendar) */}
                                <div className={`flex flex-col transition-all duration-300 ${isProcessing ? 'opacity-40 pointer-events-none cursor-wait' : ''}`}>
                                    <h3 className='text-[13px] font-black text-gray-400 mb-5 flex items-center gap-2'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                                        Select Date
                                    </h3>
                                    <div className='bg-white dark:bg-white/[0.02] border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-theme-md h-full'>
                                        <div className='flex items-center justify-between mb-5'>
                                            <h3 className='text-[15px] sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight'><CalendarIcon size={16} className='text-brand-500' />{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                            <div className='flex items-center gap-2 sm:gap-3'>
                                                <button 
                                                    onClick={handleGlobalRefresh} 
                                                    disabled={settingsLoading || statusLoading || isProcessing} 
                                                    className='flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 text-[10px] sm:text-[11px] font-bold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-700 shadow-theme-xs transition-all disabled:opacity-50'
                                                >
                                                    <RefreshCw size={14} className={settingsLoading || statusLoading || isProcessing ? 'animate-spin' : ''} />
                                                    <span className="hidden sm:inline">Refresh</span>
                                                </button>
                                                <div className='flex gap-1.5'>
                                                    <button onClick={() => navigateMonth('prev')} disabled={!canGoPrev} className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all disabled:opacity-30 hover:shadow-theme-xs'><ChevronLeft size={18} className='text-gray-600 dark:text-gray-400' /></button>
                                                    <button onClick={() => navigateMonth('next')} disabled={!canGoNext} className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all disabled:opacity-30 hover:shadow-theme-xs'><ChevronRight size={18} className='text-gray-600 dark:text-gray-400' /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-7 gap-1 mb-2'>
                                            {dayNames.map(day => (<div key={day} className='text-[11px] sm:text-[13px] font-black text-gray-400 dark:text-gray-500 text-center py-2'>{day}</div>))}
                                        </div>
                                        <div className='grid grid-cols-7 border-t border-l border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden'>
                                            {calendarDays.map((date, idx) => {
                                                const key = formatDateKey(date);
                                                const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                                                const isPast = date < today;
                                                const isToday = date.getTime() === today.getTime();
                                                const isSelected = key === selectedDate;
                                                
                                                // ✅ Check if date is a holiday (Robust check)
                                                const isHoliday = holidays?.some(h => {
                                                    const hDate = typeof h.date === 'string' ? h.date.split('T')[0] : h.date;
                                                    return hDate === key && h.is_closed;
                                                });
 
                                                // ✅ Check if day of week is open in clinic schedule
                                                const daySchedule = schedule?.find(s => s.day_of_week === date.getDay());
                                                const isClosedDay = daySchedule ? !daySchedule.is_open : (date.getDay() === 0);
 
                                                // ✅ Combine disabling rules
                                                let isDisabled = 
                                                    date < minDate || 
                                                    date > maxDate || 
                                                    isHoliday || 
                                                    isClosedDay || 
                                                    (availabilityStatus && !availabilityStatus.is_bookable) ||
                                                    availabilityStatus?.blocked_dates?.includes(key) || 
                                                    isProcessing;
                                                
                                                // ✅ Doctor-specific working day check (if applicable)
                                                if (!isDisabled && availabilityStatus?.working_days?.length > 0) {
                                                    if (!availabilityStatus.working_days.includes(date.getDay())) {
                                                        isDisabled = true;
                                                    }
                                                }
 
                                                if (!isCurrentMonth) return <div key={idx} className="aspect-square border-r border-b border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-transparent" />;
                                                return (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => !isDisabled && handleDateClick(date)} 
                                                        disabled={isDisabled} 
                                                        className={`relative flex flex-col items-center justify-center aspect-square transition-all duration-300 border-r border-b border-gray-200 dark:border-gray-800 ${
                                                            isSelected 
                                                                ? 'z-10' 
                                                                : isDisabled 
                                                                    ? 'text-gray-300 dark:text-gray-600/50 cursor-not-allowed bg-gray-50/30 dark:bg-transparent' 
                                                                    : 'bg-white dark:bg-white/[0.01] hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-700 dark:text-gray-300 group'
                                                        }`}
                                                    >
                                                        {/* Selected Background (Rounded Inset) */}
                                                        {isSelected && (
                                                            <div className="absolute inset-[2px] bg-brand-500 rounded-lg shadow-md z-0" />
                                                        )}

                                                        <span className={`relative z-10 text-[13px] sm:text-sm font-bold ${
                                                            isSelected 
                                                                ? 'text-white' 
                                                                : isToday && !isDisabled 
                                                                    ? 'text-brand-600' 
                                                                    : isDisabled 
                                                                        ? 'text-gray-300 dark:text-gray-600/50' 
                                                                        : ''
                                                        }`}>
                                                            {pendingDate === key ? (
                                                                <Loader2 size={16} className={`animate-spin ${isSelected ? 'text-white' : 'text-brand-500'}`} />
                                                            ) : (
                                                                date.getDate()
                                                            )}
                                                        </span>
                                                        
                                                        {/* Today's Border Indicator (Red border instead of dot) */}
                                                        {isToday && !isSelected && (
                                                            <div className="absolute inset-[2px] border-2 border-brand-500 rounded-lg pointer-events-none" />
                                                        )}
                                                        
                                                        {/* Subtle hover indicator for enabled dates (Rounded Inset) */}
                                                        {!isDisabled && !isSelected && (
                                                            <div className="absolute inset-[2px] border-2 border-transparent group-hover:border-brand-500/20 group-hover:bg-brand-500/5 rounded-lg transition-all pointer-events-none" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* CALENDAR LEGEND - Optimized for Mobile */}
                                        <div className="mt-6 p-3 sm:p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl">
                                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-6">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-brand-500 shadow-md ring-1 ring-white/20" />
                                                    <span className="text-[10px] sm:text-[13px] font-black text-gray-700 dark:text-gray-300">Selected</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm" />
                                                    <span className="text-[10px] sm:text-[13px] font-black text-gray-700 dark:text-gray-300">Available</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md border-2 sm:border-[2.5px] border-brand-500 bg-white dark:bg-transparent" />
                                                    <span className="text-[10px] sm:text-[13px] font-black text-gray-700 dark:text-gray-300">Today</span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md bg-gray-200 dark:bg-gray-800 opacity-60 border border-transparent" />
                                                    <span className="text-[10px] sm:text-[13px] font-black text-gray-600 dark:text-gray-500">Blocked</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Select Time (Slots) */}
                                <div className='flex flex-col h-full'>
                                    <h3 className='text-[13px] font-black text-gray-400 mb-5 flex items-center gap-2'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                                        Select Time
                                    </h3>
                                    {!selectedDate ? (
                                        <div className='flex-grow bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500'>
                                            <div className='bg-white dark:bg-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center shadow-theme-sm mb-5'><MousePointer2 size={28} className='text-brand-500' /></div>
                                            <h4 className='text-base font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight'>Pick a Date</h4>
                                            <p className='text-[12px] text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed font-bold'>Select an available day from the calendar to see slots.</p>
                                        </div>
                                    ) : (
                                        <div className='animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col'>
                                            <div className={`flex flex-col h-full ${isProcessing ? 'opacity-40 pointer-events-none cursor-wait' : ''}`}>
                                                
                                                <div className='flex items-center justify-between mb-5'>
                                                    <h3 className='text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight'><ClockIcon size={18} className='text-brand-500' />Available Times</h3>
                                                    <button onClick={handleGlobalRefresh} disabled={isProcessing} className='flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-700 shadow-theme-xs transition-all disabled:opacity-50'><RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />Refresh</button>
                                                </div>

                                                {isLoading ? (
                                                    <div className='grid grid-cols-2 xsm:grid-cols-3 gap-3 cursor-wait'>
                                                        {[...Array(12)].map((_, i) => <div key={i} className='h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl' />)}
                                                    </div>
                                                ) : visibleSlots && visibleSlots.length > 0 ? (
                                                    <>
                                                        <div className='grid grid-cols-2 xsm:grid-cols-3 gap-3 mb-6'>
                                                            {visibleSlots.map((slot) => {
                                                                const isHeldByMe = activeHold?.time === slot.rawTime && selectedDate === activeHold.date;
                                                                const isSelected = selectedTime === slot.rawTime && !pendingSlot;
                                                                const isPending = pendingSlot === slot.rawTime;
                                                                const isAvailable = slot.available > 0 || isHeldByMe;
                                                                
                                                                return (
                                                                    <button 
                                                                        key={slot.rawTime} 
                                                                        onClick={() => isAvailable && handleTimeClick(slot)} 
                                                                        disabled={holdLoading || (!isAvailable && !isHeldByMe)} 
                                                                        title={isAvailable ? `${slot.available} slots available` : 'Fully booked'} 
                                                                        className={`py-2 sm:py-3 rounded-xl text-[10px] sm:text-[12px] font-bold transition-all relative flex items-center justify-center ${
                                                                            isSelected ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 ring-4 ring-brand-500/10' 
                                                                            : isHeldByMe ? 'bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-200 text-brand-700 dark:text-brand-400' 
                                                                            : isAvailable ? 'bg-white dark:bg-white/[0.03] border-2 border-gray-100 dark:border-gray-800/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-theme-sm hover:shadow-theme-md'
                                                                            : 'bg-transparent dark:bg-transparent border-2 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 opacity-60 cursor-not-allowed'
                                                                        }`}
                                                                    >
                                                                        {isPending ? (
                                                                            <Loader2 size={16} className="animate-spin text-brand-500" />
                                                                        ) : (
                                                                            <>
                                                                                {slot.displayTime}
                                                                                {(isHeldByMe || !isAvailable) && (
                                                                                    <Lock 
                                                                                        size={10} 
                                                                                        className={`absolute top-2 right-2 ${isHeldByMe ? 'text-brand-500' : 'text-gray-400 dark:text-gray-600'}`} 
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* LOAD MORE Button */}
                                                        {hasMoreSlots && (
                                                            <button 
                                                                onClick={() => setVisibleCount(prev => prev + 18)}
                                                                className='mb-8 w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-[11px] font-black text-gray-500 hover:text-brand-500 hover:border-brand-200 dark:hover:border-brand-500/50 transition-all flex items-center justify-center gap-2 bg-gray-50/50 dark:bg-gray-800/30'
                                                            >
                                                                <Plus size={14} />
                                                                Show More Times
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className='p-8 bg-gray-50 dark:bg-white/[0.02] rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-gray-800 flex-grow flex flex-col items-center justify-center leading-relaxed'><p className='text-gray-500 text-[13px] font-bold mb-2'>No available slots for this date.</p>{nextAvailableDate && <button onClick={() => {const d = new Date(nextAvailableDate);setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));handleDateClick(d);}} className='text-brand-500 text-[13px] font-black hover:underline underline-offset-4'>Try {new Date(nextAvailableDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</button>}</div>
                                                )}
                                            </div>

                                            {/* DYNAMIC HOLD Status Indicator moved to StepIndicator */}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-6 sm:pt-2 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                                <div className='flex items-center gap-3 w-full sm:justify-between'>
                                    <button 
                                        onClick={onBack} 
                                        disabled={isProcessing} 
                                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[11px] sm:text-sm px-2 py-3.5 sm:px-8 transition-colors bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs disabled:opacity-30'
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={onNext} 
                                        disabled={!selectedDate || !selectedTime || isProcessing} 
                                        className='flex-1 sm:flex-none sm:min-w-[240px] bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black px-2 py-3.5 sm:px-10 sm:py-4 rounded-2xl transition-all shadow-theme-md disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-base'
                                    >
                                        Continue to Details
                                        <ArrowRight size={16} className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default DateTimeStep;
