import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight, Lock, X, AlertCircle, RefreshCw, Clock, Plus, Hourglass, Calendar, MousePointer2, Loader2, CheckCircle2, CalendarDays, Check, Users, CalendarX } from 'lucide-react';
import { api } from '../../../../../utils/api';
import useSlots from '../../../../../hooks/useSlots';
import ErrorState from '../../../../../../../user/src/components/common/ErrorState';
import JoinWaitlistModal from '../../../../../../../user/src/components/user-booking/JoinWaitlistModal';
import WaitlistOnlyWarningModal from '../../../../../../../user/src/components/user-booking/WaitlistOnlyWarningModal';

const DateTimeStep = ({
    serviceId,
    selectedDate,
    selectedTime,
    formData,
    onUpdate,
    serviceName,
    serviceTier,
    sessionId,
    slotHold,
    userWaitlist = [],
    disableWaitlist = false,
    onValidationError // Added to pass validation errors up to modal
}) => {
    const [specialists, setSpecialists] = useState([]);
    const [specialistsLoading, setSpecialistsLoading] = useState(true);
    const [specialistsError, setSpecialistsError] = useState(null);
    const [availabilityStatus, setAvailabilityStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [waitlistSlot, setWaitlistSlot] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [pendingSlot, setPendingSlot] = useState(null);
    const [showWaitlistOnlyWarning, setShowWaitlistOnlyWarning] = useState(false);
    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
    const [pendingDate, setPendingDate] = useState(null);

    const { activeHold, holdSlot, releaseHold, formattedTime, holdLoading, holdError, timeRemaining } = slotHold;

    const INITIAL_VISIBLE_COUNT = 18;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const MAX_BOOKING_DAYS_AHEAD = 90;
    const maxDate = useMemo(
        () => new Date(today.getTime() + MAX_BOOKING_DAYS_AHEAD * 24 * 60 * 60 * 1000),
        [today],
    );

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

    useEffect(() => {
        if (serviceId) {
            const fetchSpecialists = async () => {
                setSpecialists([]); 
                setSpecialistsLoading(true);
                setSpecialistsError(null);
                try {
                    const response = await api.get(`/services/${serviceId}/specialists`);
                    setSpecialists(response.specialists || []);
                } catch (err) {
                    console.error('Failed to fetch specialists:', err);
                    setSpecialistsError(err.message);
                } finally {
                    setSpecialistsLoading(false);
                }
            };
            fetchSpecialists();

            const checkStatus = async () => {
                setStatusLoading(true);
                try {
                    let url = `/slots/service-status/${serviceId}`;
                    if (formData?.dentist_id) {
                        url += `?dentistId=${formData.dentist_id}`;
                    }
                    const data = await api.get(url);
                    setAvailabilityStatus(data);
                } catch (err) {
                    console.error('Failed to check service status:', err);
                } finally {
                    setStatusLoading(false);
                }
            };
            checkStatus();
        } else {
            setSpecialists([]);
        }
    }, [serviceId, formData?.dentist_id]);

    const formatDateKey = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

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
        formData?.dentist_id || null,
    );

    const isLoading = slotsLoading || isPending;
    const isProcessing = isLoading || !!pendingSlot || !!pendingDate || holdLoading;

    useEffect(() => {
        if (!isLoading) {
            setPendingDate(null);
        }
    }, [isLoading]);

    // Lift validation errors to parent if needed
    useEffect(() => {
        if (onValidationError) onValidationError(validationError);
    }, [validationError]);

    const handleDateClick = async (date) => {
        if (isLoading) return;
        const key = formatDateKey(date);
        
        if (selectedTime && selectedDate !== key) {
            await releaseHold();
        }

        setPendingDate(key);
        if (selectedDate === key) {
            await releaseHold();
            handleTimeUpdate({ date: '', time: '' });
            setPendingDate(null);
        } else {
            handleTimeUpdate({ date: key, time: '' });
        }
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleTimeClick = async (slotData) => {
        const isCurrentlyHeldByMe = activeHold?.time === slotData.rawTime && selectedDate === activeHold.date;
        const isAvailable = slotData.available > 0 || isCurrentlyHeldByMe;

        setPendingSlot(slotData.rawTime);
        try {
            if (isAvailable) {
                const isCurrentlySelected = selectedTime === slotData.rawTime;

                if (isCurrentlySelected || isCurrentlyHeldByMe) {
                    await releaseHold();
                    handleTimeUpdate({ time: '' });
                } else {
                    if (!serviceId || !selectedDate) return;
                    const holdResult = await holdSlot(serviceId, selectedDate, slotData.rawTime, formData?.dentist_id || null);
                    if (holdResult?.success) {
                        handleTimeUpdate({ time: slotData.rawTime });
                    } else if (holdResult?.error === 'SLOT_TAKEN') {
                        refetchSlots();
                        return;
                    }
                }
            } else {
                if (disableWaitlist) return;

                const isSelectedForWaitlist = formData?.waitlist_time === slotData.rawTime;
                const isAlreadyInDB = isSlotWaitlisted(slotData.rawTime);

                if (isAlreadyInDB) {
                    return;
                }

                if (isSelectedForWaitlist) {
                    handleTimeUpdate({
                        waitlist_date: '',
                        waitlist_time: '',
                    });
                } else {
                    setWaitlistSlot(slotData);
                    setShowWaitlistModal(true);
                }
            }
        } finally {
            setPendingSlot(null);
        }
    };

    const handleWaitlistModalSuccess = ({ date, time }) => {
        handleTimeUpdate({
            waitlist_date: date,
            waitlist_time: time,
        });
        setShowWaitlistModal(false);
        setWaitlistSlot(null);
    };

    const handleClearWaitlist = () => {
        handleTimeUpdate({
            waitlist_date: '',
            waitlist_time: '',
        });
    };

    const isSlotWaitlisted = (time) => {
        if (!time || !selectedDate || !serviceId) return false;
        
        return (userWaitlist || []).some(
            (w) =>
                w.preferred_date === selectedDate &&
                String(w.service_id) === String(serviceId) &&
                w.preferred_time?.substring(0, 5) === time.substring(0, 5)
        );
    };

    const handleClearBooking = async () => {
        await releaseHold();
        handleTimeUpdate({
            time: '',
        });
    };

    const handleTimeUpdate = (updates) => {
        setValidationError(null);
        onUpdate(updates);
    };

    const formatTimeDisplay = (rawTime) => {
        if (!rawTime) return '';
        const [hours, minutes] = rawTime.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    const formatDateDisplay = (dateKey) => {
        if (!dateKey) return '';
        const d = new Date(dateKey + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const canGoPrev = viewDate.getMonth() > today.getMonth() || viewDate.getFullYear() > today.getFullYear();
    const canGoNext = viewDate < maxDate;

    const visibleSlots = useMemo(() => {
        if (!slots) return [];
        return slots
            .filter(slot => {
                if (disableWaitlist && slot.available <= 0 && !(activeHold?.time === slot.rawTime && selectedDate === activeHold.date)) {
                    return false;
                }
                const isWaitlisted = isSlotWaitlisted(slot.rawTime);
                if (isWaitlisted) return false;
                return true; 
            })
            .slice(0, visibleCount);
    }, [slots, visibleCount, activeHold, selectedDate, disableWaitlist]);

    const hasMoreSlots = slots && slots.length > visibleCount;

    const handleSpecialistChange = async (dentistId) => {
        if (isLoading) return;
        setValidationError(null);
        if (formData.time) {
            await releaseHold();
        }
        onUpdate({
            dentist_id: dentistId,
            time: '',
            waitlist_time: '',
        });
    };

    const DoctorDropdown = () => {
        const getDoctorName = (s) => {
            if (!s?.profile) return 'Any available dentist';
            const { first_name, last_name, suffix, full_name } = s.profile;
            if (first_name || last_name) {
                return `Dr. ${first_name} ${last_name}`.trim();
            }
            return full_name;
        };

        const selectedDoctor = specialists.find(s => s.id === formData?.dentist_id);
        const initials = selectedDoctor 
            ? ((selectedDoctor.profile?.first_name?.[0] || '') + (selectedDoctor.profile?.last_name?.[0] || '')).toUpperCase() || 'D'
            : '✨';

        return (
            <div className='relative w-full mb-10'>
                <h3 className='text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                    Select Dentist
                </h3>
                
                <button
                    type="button"
                    onClick={() => !isProcessing && setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border-2 rounded-2xl transition-all shadow-theme-sm group ${
                        isDoctorDropdownOpen ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-gray-100 dark:border-gray-800 hover:border-brand-200'
                    } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <div className='flex items-center gap-4'>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${
                            !formData?.dentist_id ? 'bg-brand-50 text-brand-500' : 'bg-slate-50 dark:bg-white/5'
                        }`}>
                            {selectedDoctor?.photo_url ? (
                                <img src={selectedDoctor.photo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : !formData?.dentist_id ? <Users size={24} /> : initials}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">
                                {selectedDoctor ? getDoctorName(selectedDoctor) : 'Any available dentist'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                                {selectedDoctor 
                                    ? (serviceTier === 'specialized' ? 'Specialist' : 'Dentist') 
                                    : "We'll match you with available dentist"}
                            </span>
                        </div>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isDoctorDropdownOpen ? 'rotate-180 text-brand-500' : ''}`} />
                </button>

                {isDoctorDropdownOpen && (
                    <>
                        <div className='fixed inset-0 z-40' onClick={() => setIsDoctorDropdownOpen(false)} />
                        <div className='absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#0f172a] border-2 border-slate-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
                            <div className='max-h-[300px] overflow-y-auto p-2 scrollbar-hide'>
                                <button
                                    onClick={() => { handleSpecialistChange(''); setIsDoctorDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left mb-1 ${
                                        !formData?.dentist_id ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className='w-10 h-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center text-lg'>
                                        <Users size={20} />
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-sm font-black'>Any available dentist</span>
                                        <span className='text-[10px] font-bold opacity-70'>We'll match you with available dentist</span>
                                    </div>
                                    {!formData?.dentist_id && <Check size={18} className='ml-auto text-brand-500' />}
                                </button>

                                {specialists.map(s => {
                                    const isSelected = formData?.dentist_id === s.id;
                                    const doctorInitials = ((s.profile?.first_name?.[0] || '') + (s.profile?.last_name?.[0] || '')).toUpperCase() || 'D';
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => { handleSpecialistChange(s.id); setIsDoctorDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left mb-1 ${
                                                isSelected ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className='w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden'>
                                                {s.photo_url ? <img src={s.photo_url} alt="" className="w-full h-full object-cover" /> : <span className='text-xs font-black text-slate-400'>{doctorInitials}</span>}
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-black'>{getDoctorName(s)}</span>
                                                <span className='text-[10px] font-bold opacity-70'>
                                                    {serviceTier === 'specialized' ? 'Specialist' : 'Dentist'}
                                                </span>
                                            </div>
                                            {isSelected && <Check size={18} className='ml-auto text-brand-500' />}
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
    const hasStatusError = !statusLoading && availabilityStatus === null;
    const hasNoSlots = (!statusLoading && availabilityStatus?.is_bookable === false) || hasStatusError;
    const showNoAppointments = hasNoSpecialists || hasNoSlots;

    if ((specialistsLoading || statusLoading) && (specialists.length === 0 || !availabilityStatus)) {
        return (
            <div className="flex flex-col gap-10 animate-pulse py-2">
                <div className='mb-8 sm:mb-10'>
                    <div className='h-7 sm:h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full max-w-sm mb-4' />
                    <div className='h-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl w-full max-w-2xl' />
                </div>
                
                <div className="h-20 bg-slate-50 dark:bg-white/[0.02] border-2 border-slate-100 dark:border-slate-800 rounded-3xl w-full flex items-center px-4 gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    <div className="flex flex-col gap-2 flex-grow">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
                        <div className="h-3 bg-slate-50 dark:bg-gray-800/50 rounded-lg w-1/4" />
                    </div>
                    <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
                
                <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-8 gap-y-10 mb-10'>
                    <div className="flex flex-col gap-5">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-32 ml-1" />
                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 rounded-[32px] sm:rounded-[40px] p-6 h-[440px]">
                            <div className="flex justify-between items-center mb-8">
                                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-xl w-32" />
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-4">
                                {[...Array(35)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-40 ml-1" />
                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 rounded-[32px] sm:rounded-[40px] p-6 h-[440px]">
                            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-xl w-32 mb-10" />
                            <div className="grid grid-cols-2 xsm:grid-cols-3 gap-3">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative pb-10 sm:pb-6">
            {(holdError || (validationError && !validationError.includes('fetch'))) && (
                <div className="fixed top-[4.5rem] sm:top-24 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none animate-in slide-in-from-right-10 fade-in duration-500">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-3 sm:p-5 flex gap-3 sm:gap-4 items-center ring-1 ring-black/5 pointer-events-auto">
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${holdError ? 'bg-red-500 shadow-red-500/20' : 'bg-amber-500 shadow-amber-500/20'} text-white flex items-center justify-center shrink-0 shadow-lg`}>
                            <AlertCircle size={18} className="sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h4 className="text-[9px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">Attention Required</h4>
                            <p className="text-[12px] sm:text-[14px] font-bold text-gray-900 dark:text-white leading-tight break-words">
                                {holdError || validationError}
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                if (holdError) slotHold.setHoldError?.(null);
                                setValidationError(null);
                            }} 
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                    </div>
                </div>
            )}

            {specialistsError?.toLowerCase().includes('fetch') ? (
                <div className='grow flex flex-col py-10'>
                     <ErrorState 
                        error={specialistsError} 
                        onRetry={() => window.location.reload()} 
                        title="Connection Issues"
                    />
                </div>
            ) : (
                <>
                    {!showNoAppointments && (
                        <div className='mb-8 sm:mb-10'>
                            <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 font-display tracking-tight uppercase'>
                                Pick Date & Time
                            </h2>
                            <p className='text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed'>
                                Choose your preferred appointment date and available time slot. {serviceTier === 'specialized' ? 'Select a specific dentist or "Any Specialist" to see availability.' : 'Select a specific dentist or stay with "Any Dentist" for more options.'}
                            </p>
                        </div>
                    )}

            {showNoAppointments ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-[40px] shadow-theme-sm my-10">
                    <div className="w-24 h-24 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mb-8">
                        <CalendarX size={44} className="text-brand-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-tight font-display">
                        No Available Appointments
                    </h3>
                    
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-10 text-sm md:text-base font-medium">
                        {availabilityStatus?.message || "There are no available appointments for this service right now. Please try selecting another service or contact us for assistance."}
                    </p>
                </div>
            ) : (
                <>
                    <DoctorDropdown />

            <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-8 gap-y-10 mb-10'>
                <div className={`flex flex-col transition-all duration-300 ${isProcessing ? 'opacity-40 pointer-events-none cursor-wait' : ''}`}>
                    <h3 className='text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2'>
                        <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                        Select Date
                    </h3>
                    <div className='bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-theme-sm h-full'>
                    <div className='flex items-center justify-between mb-5'>
                        <h3 className='text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight uppercase'>
                            <div className='p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg'><Calendar size={14} className='text-brand-500' /></div>
                            {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className='flex gap-1.5'>
                            <button onClick={() => navigateMonth('prev')} disabled={!canGoPrev || isProcessing} className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all disabled:opacity-30 hover:shadow-theme-xs'><ChevronLeft size={18} className='text-gray-600 dark:text-gray-400' /></button>
                            <button onClick={() => navigateMonth('next')} disabled={!canGoNext || isProcessing} className='p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all disabled:opacity-30 hover:shadow-theme-xs'><ChevronRight size={18} className='text-gray-600 dark:text-gray-400' /></button>
                        </div>
                    </div>
                    <div className='grid grid-cols-7 gap-1 mb-2'>
                        {dayNames.map(day => (<div key={day} className='text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest text-center py-2'>{day}</div>))}
                    </div>
                    <div className='grid grid-cols-7 gap-1.5'>
                        {calendarDays.map((date, idx) => {
                            const key = formatDateKey(date);
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                            const isPast = date < today;
                            const isToday = date.getTime() === today.getTime();
                            const isSelected = key === selectedDate;
                            
                            let isDisabled = isPast || isToday || date > maxDate || isProcessing;
                            
                            if (availabilityStatus?.working_days?.length > 0) {
                                if (!availabilityStatus.working_days.includes(date.getDay())) {
                                    isDisabled = true;
                                }
                            } else {
                                if (date.getDay() === 0) isDisabled = true;
                            }

                            if (!isCurrentMonth) return <div key={idx} className="aspect-square" />;
                            return (
                                <button key={idx} onClick={() => !isDisabled && handleDateClick(date)} disabled={isDisabled} className={`relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all duration-300 ${isSelected ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105 z-10' : isDisabled ? 'text-gray-300 dark:text-gray-600/50 cursor-not-allowed opacity-30 shadow-none bg-transparent border-2 border-slate-100/50 dark:border-gray-800/50' : 'bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-500/50 text-gray-700 dark:text-gray-300 shadow-theme-xs'}`}>
                                    <span className={`text-[13px] sm:text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                                        {pendingDate === key ? (
                                            <Loader2 size={16} className={`animate-spin ${isSelected ? 'text-white' : 'text-brand-500'}`} />
                                        ) : (
                                            date.getDate()
                                        )}
                                    </span>
                                    {isToday && !isSelected && <div className="absolute bottom-1 sm:bottom-1.5 w-1 h-1 rounded-full bg-brand-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className='flex flex-col h-full'>
                    <h3 className='text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2'>
                        <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                        Select Time
                    </h3>
                    {!selectedDate ? (
                        <div className='flex-grow bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500'>
                            <div className='bg-white dark:bg-gray-800 w-14 h-14 rounded-2xl flex items-center justify-center shadow-theme-sm mb-5'><MousePointer2 size={28} className='text-brand-500' /></div>
                            <h4 className='text-base font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight uppercase'>Pick a Date</h4>
                            <p className='text-[12px] text-gray-500 dark:text-gray-400 max-w-[220px] leading-relaxed font-bold'>Select an available day from the calendar to see slots.</p>
                        </div>
                    ) : (
                        <div className='animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col bg-gray-50/30 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl p-6'>
                            <div className={`flex flex-col h-full ${isProcessing ? 'opacity-40 pointer-events-none cursor-wait' : ''}`}>
                                <div className='flex items-center justify-between mb-5'>
                                    <h3 className='text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight uppercase'>
                                        <div className='p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg'><Clock size={16} className='text-brand-500' /></div>
                                        Available Times
                                    </h3>
                                    <button onClick={refetchSlots} disabled={isProcessing} className='flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-700 shadow-theme-xs transition-all disabled:opacity-50'><RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />Refresh</button>
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
                                                const isSelectedForBooking = selectedTime === slot.rawTime && !pendingSlot;
                                                const isSelectedForWaitlist = formData?.waitlist_time === slot.rawTime;
                                                const isAvailable = slot.available > 0 || isHeldByMe;

                                                return (
                                                    <button 
                                                        key={slot.rawTime} 
                                                        onClick={() => handleTimeClick(slot)} 
                                                        disabled={holdLoading && !isSelectedForBooking}
                                                        title={slot.available > 0 ? `${slot.available} slots available` : 'Fully booked - Join waitlist'}
                                                        className={`py-3 rounded-xl text-[12px] font-bold transition-all relative flex items-center justify-center ${
                                                            isSelectedForBooking && isAvailable
                                                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 ring-4 ring-brand-500/10' 
                                                            : isSelectedForWaitlist && !isAvailable
                                                            ? 'bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 text-amber-900 dark:text-amber-100 shadow-lg shadow-amber-400/10 ring-4 ring-amber-400/10 opacity-100 scale-105 z-10'
                                                            : isHeldByMe 
                                                            ? 'bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-200 text-brand-700 dark:text-brand-400' 
                                                            : isAvailable
                                                            ? 'bg-white dark:bg-white/[0.03] border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-500/50 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-theme-sm'
                                                            : 'bg-transparent dark:bg-transparent border-2 border-slate-100 dark:border-gray-800 text-slate-400 dark:text-slate-600 opacity-60'
                                                        }`}
                                                    >
                                                        {pendingSlot === slot.rawTime && (isAvailable || isSelectedForBooking) ? (
                                                            <Loader2 size={16} className={`animate-spin ${isSelectedForBooking ? 'text-white' : 'text-brand-500'}`} />
                                                        ) : (
                                                            <>
                                                                {slot.displayTime}
                                                                {!isAvailable && <Lock size={10} className={`absolute top-2 right-2 ${isSelectedForWaitlist ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />}
                                                                {isHeldByMe && !isSelectedForBooking && <Lock size={10} className='absolute top-2 right-2 text-brand-500' />}
                                                            </>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        {hasMoreSlots && (
                                            <button 
                                                onClick={() => setVisibleCount(prev => prev + 18)}
                                                className='mb-8 w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-[11px] font-black text-gray-500 hover:text-brand-500 hover:border-brand-200 dark:hover:border-brand-500/50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/30'
                                            >
                                                <Plus size={14} />
                                                Show More Times
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className='p-8 bg-gray-50 dark:bg-white/[0.02] rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-gray-800 flex-grow flex flex-col items-center justify-center leading-relaxed'><p className='text-gray-500 text-[14px] font-bold mb-2'>No available slots.</p>{nextAvailableDate && <button onClick={() => {const d = new Date(nextAvailableDate);setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));handleDateClick(d);}} className='text-brand-500 text-[13px] font-black hover:underline underline-offset-4'>Try {new Date(nextAvailableDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</button>}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(selectedTime || formData?.waitlist_time) && (
                <div className='mb-10 p-5 sm:p-7 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-theme-sm animate-in fade-in slide-in-from-bottom-4 duration-500'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                        <div className='flex items-center gap-2.5'>
                            <div className='w-1 h-5 bg-brand-500 rounded-full' />
                            <h4 className='text-[11px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest'>Your Selection Summary</h4>
                        </div>
                        
                        {activeHold && (
                            <div className='flex items-center gap-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-gray-800 px-4 py-2 rounded-xl animate-in fade-in zoom-in duration-500'>
                                <div className='flex flex-col gap-0.5'>
                                    <p className='text-[10px] sm:text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight'>
                                        We are holding this time for you.
                                    </p>
                                    <p className='text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500'>
                                        Please complete your request within: <span className="font-mono text-brand-500 font-black ml-1 text-sm sm:text-base tracking-tighter">{formattedTime}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'> 
                        {selectedTime && (
                           <div className='group flex items-center justify-between gap-5 pl-3.5 pr-2.5 py-2.5 bg-white dark:bg-transparent border border-brand-100/50 dark:border-brand-500/20 rounded-2xl transition-all hover:border-brand-300 shadow-theme-xs'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-9 h-9 rounded-xl bg-brand-50/50 dark:bg-brand-500/5 flex items-center justify-center text-brand-500 transition-transform group-hover:scale-105'>
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <p className='text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 leading-none'>Primary Request</p>
                                        <div className='flex items-center gap-1.5'>
                                            <p className='text-[13px] sm:text-[14px] font-black text-slate-900 dark:text-white'>{formatDateDisplay(selectedDate)}</p>
                                            <span className='w-1 h-1 rounded-full bg-slate-200 dark:bg-gray-700' />
                                            <p className='text-[13px] sm:text-[14px] font-black text-brand-500'>{formatTimeDisplay(selectedTime)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleClearBooking} 
                                    className='p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-slate-300 hover:text-red-500 transition-all active:scale-90 flex items-center justify-center' 
                                    title="Remove"
                                >
                                    <X size={16} className="stroke-[2.5]" />
                                </button>
                           </div>
                        )}

                        {formData?.waitlist_time && (
                            <div className='group flex items-center justify-between gap-5 pl-3.5 pr-2.5 py-2.5 bg-white dark:bg-transparent border border-amber-100/50 dark:border-amber-500/20 rounded-2xl transition-all hover:border-amber-300 shadow-theme-xs'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-9 h-9 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-105'>
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className='text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 leading-none'>Waitlist Choice</p>
                                        <div className='flex items-center gap-1.5'>
                                            <p className='text-[13px] sm:text-[14px] font-black text-slate-900 dark:text-white'>{formatDateDisplay(formData.waitlist_date)}</p>
                                            <span className='w-1 h-1 rounded-full bg-slate-200 dark:bg-gray-700' />
                                            <p className='text-[13px] sm:text-[14px] font-black text-amber-500'>{formatTimeDisplay(formData.waitlist_time)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleClearWaitlist} 
                                    className='p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-slate-300 hover:text-red-500 transition-all active:scale-90 flex items-center justify-center' 
                                    title="Remove"
                                >
                                    <X size={16} className="stroke-[2.5]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showWaitlistModal && waitlistSlot && (
                <JoinWaitlistModal
                    serviceId={serviceId}
                    date={selectedDate}
                    time={waitlistSlot.displayTime}
                    rawTime={waitlistSlot.rawTime}
                    serviceName={serviceName}
                    onSuccess={handleWaitlistModalSuccess}
                    onClose={() => {
                        setShowWaitlistModal(false);
                        setWaitlistSlot(null);
                    }}
                />
            )}
            {showWaitlistOnlyWarning && (
                <WaitlistOnlyWarningModal 
                    onConfirm={() => {
                        setShowWaitlistOnlyWarning(false);
                    }}
                    onCancel={() => setShowWaitlistOnlyWarning(false)}
                />
            )}
                    </>
                )}
            </>
        )}
    </div>
    );
};

export default DateTimeStep;
