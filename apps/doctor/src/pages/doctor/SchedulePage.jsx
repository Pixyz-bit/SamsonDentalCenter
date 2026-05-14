import React, { useState, useMemo } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { ChevronLeft, ChevronRight, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Mock Data ──
const MOCK_SCHEDULE = [
    { id: 's1', service: 'Tooth Extraction', patient: 'Christopher Picarding', start: '09:30', end: '10:30', status: 'CONFIRMED', date: '2026-05-15' },
    { id: 's2', service: 'Consultation', patient: 'Maria Santos', start: '10:30', end: '11:30', status: 'CONFIRMED', date: '2026-05-15' },
    { id: 's3', service: 'Root Canal', patient: 'Angelo Reyes', start: '14:00', end: '15:00', status: 'CANCELLED', date: '2026-05-15' },
    { id: 's4', service: 'Dental Cleaning', patient: 'Jane Smith', start: '16:30', end: '17:30', status: 'CONFIRMED', date: '2026-05-15' },
    { id: 's5', service: 'Consultation', patient: 'Leo Picard Jr.', start: '09:00', end: '10:00', status: 'CONFIRMED', date: '2026-05-16' },
    { id: 's6', service: 'Braces Adjustment', patient: 'Sarah Picard', start: '10:00', end: '11:00', status: 'CONFIRMED', date: '2026-05-16' },
    { id: 's7', service: 'Consultation', patient: 'FamTwo FamTwo', start: '09:30', end: '10:30', status: 'CANCELLED', date: '2026-05-16' },
    { id: 's8', service: 'Root Canal', patient: 'John Doe', start: '08:30', end: '09:30', status: 'CANCELLED', date: '2026-05-18' },
    { id: 's9', service: 'Dental Cleaning', patient: 'Leo Picard Jr.', start: '12:00', end: '13:00', status: 'CONFIRMED', date: '2026-05-18' },
    { id: 's10', service: 'Consultation', patient: 'Christopher Picarding', start: '09:00', end: '10:00', status: 'CONFIRMED', date: '2026-05-18' },
];

// ── Helpers ──
const CLINIC_START = 8;  // 8 AM
const CLINIC_END = 18;   // 6 PM
const TOTAL_HOURS = CLINIC_END - CLINIC_START;
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = TOTAL_HOURS * SLOTS_PER_HOUR;
const HOUR_LABELS_ONLY = true;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getWeekDates = (baseDate) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - day);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push(date);
    }
    return days;
};

const toDateStr = (d) => d.toISOString().split('T')[0];

const timeToPercent = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h - CLINIC_START) * 60 + m;
    const totalRange = TOTAL_HOURS * 60;
    return (totalMinutes / totalRange) * 100;
};

const timeSlotLabels = () => {
    const labels = [];
    for (let h = CLINIC_START; h <= CLINIC_END; h++) {
        const hour12 = h > 12 ? h - 12 : h;
        const period = h >= 12 ? 'PM' : 'AM';
        labels.push({
            label: `${hour12} ${period}`,
            isHour: true,
            percent: ((h - CLINIC_START) * 60) / (TOTAL_HOURS * 60) * 100,
        });
    }
    return labels;
};

const formatWeekLabel = (dates) => {
    const start = dates[0];
    return start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// ── Component ──
const SchedulePage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = toDateStr(new Date());

    const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
    const slots = useMemo(() => timeSlotLabels(), []);

    const navigateWeek = (dir) => {
        setCurrentDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + dir * 7);
            return d;
        });
    };

    const goToToday = () => setCurrentDate(new Date());

    // Group appointments by date
    const appointmentsByDate = useMemo(() => {
        const map = {};
        MOCK_SCHEDULE.forEach(appt => {
            if (!map[appt.date]) map[appt.date] = [];
            map[appt.date].push(appt);
        });
        return map;
    }, []);

    // Stack overlapping appointments into rows
    const getRows = (appts) => {
        if (!appts || appts.length === 0) return [];
        const sorted = [...appts].sort((a, b) => a.start.localeCompare(b.start));
        const rows = [];
        sorted.forEach(appt => {
            let placed = false;
            for (const row of rows) {
                const overlaps = row.some(existing => appt.start < existing.end && appt.end > existing.start);
                if (!overlaps) { row.push(appt); placed = true; break; }
            }
            if (!placed) rows.push([appt]);
        });
        return rows;
    };

    return (
        <>
            <PageBreadcrumb pageTitle='Weekly Schedule' />

            <div className='flex flex-col border border-gray-200 dark:border-gray-800 rounded-2xl bg-white/50 dark:bg-white/[0.02] backdrop-blur-md shadow-sm overflow-hidden'>
                {/* ── Header ── */}
                <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/10'>
                            <ChevronRight size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className='text-[18px] sm:text-[20px] font-medium text-gray-900 dark:text-white tracking-tight leading-tight'>
                                Upcoming Schedule
                            </h4>
                            <p className='text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-400 mt-0.5'>
                                Timeline view of your dental journey • <span className='text-brand-500'>Approved & Pending Sessions</span>
                            </p>
                        </div>
                    </div>
                    <Link
                        to='/doctor/appointments'
                        className='hidden sm:inline-flex items-center gap-2 px-4 h-9 text-[11px] font-medium border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/30 transition-all text-gray-700 dark:text-gray-300 tracking-wide'
                    >
                        View all requests <ArrowRight size={14} />
                    </Link>
                </div>

                {/* ── Week Navigator ── */}
                <div className='flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/[0.01]'>
                    <h3 className='text-[14px] sm:text-[15px] font-medium text-gray-900 dark:text-white tracking-tight'>
                        Week of {formatWeekLabel(weekDates)}
                    </h3>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={goToToday}
                            className='text-[11px] font-medium px-3 h-7.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-400'
                        >
                            Today
                        </button>
                        <div className='flex items-center gap-1'>
                            <button
                                onClick={() => navigateWeek(-1)}
                                className='p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400'
                            >
                                <ChevronLeft size={14} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => navigateWeek(1)}
                                className='p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400'
                            >
                                <ChevronRight size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Timeline Grid ── */}
                <div className='grow'>
                    <div className='h-full flex flex-col w-full'>

                        {/* Time Header */}
                        <div className='grid border-b border-gray-200 dark:border-white/10 bg-gray-50/20 dark:bg-white/[0.02] sticky top-0 z-30'
                             style={{ gridTemplateColumns: '70px 1fr' }}>
                            <div className='p-2 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-[9px] font-medium text-gray-400 dark:text-gray-500 text-center flex items-center justify-center'>
                                Day
                            </div>
                            <div className='relative h-10 w-full'>
                                {/* Grid Lines */}
                                <div className='absolute inset-0 grid pointer-events-none' style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, 1fr)` }}>
                                    {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                                        <div key={i} className='border-r border-gray-100 dark:border-white/5 h-full' />
                                    ))}
                                </div>
                                {/* Time Labels */}
                                {slots.map((slot, i) => (
                                    <div key={i} className='absolute bottom-1.5 -translate-x-1/2 px-0.5 bg-white dark:bg-transparent z-10' style={{ left: `${slot.percent}%` }}>
                                        <p className='font-medium text-gray-800 dark:text-gray-200 tabular-nums text-[10px]'>
                                            {slot.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Day Rows */}
                        <div className='flex-grow bg-white dark:bg-transparent'>
                            {weekDates.map((date) => {
                                const dateStr = toDateStr(date);
                                const isToday = dateStr === today;
                                const appts = appointmentsByDate[dateStr] || [];
                                const rows = getRows(appts);
                                const ROW_HEIGHT = 56;
                                const ROW_GAP = 4;
                                const PADDING = 12;
                                const minHeight = rows.length > 0
                                    ? rows.length * (ROW_HEIGHT + ROW_GAP) + PADDING * 2 - ROW_GAP
                                    : 72;

                                return (
                                    <div
                                        key={dateStr}
                                        className={`grid border-b last:border-b-0 border-gray-200 dark:border-white/10 transition-all ${
                                            isToday ? 'bg-brand-50/20 dark:bg-brand-500/5' : 'hover:bg-gray-50/30 dark:hover:bg-white/[0.01]'
                                        }`}
                                        style={{ gridTemplateColumns: '70px 1fr', minHeight: `${minHeight}px` }}
                                    >
                                        {/* Day Label */}
                                        <div className={`p-2 border-r border-gray-200 dark:border-white/10 flex flex-col items-center justify-center ${
                                            isToday ? 'bg-brand-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                                        }`}>
                                            <span className={`text-[18px] sm:text-[20px] font-medium leading-none ${
                                                isToday ? 'text-brand-500 dark:text-brand-400' : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                                {date.getDate()}
                                            </span>
                                            <span className={`text-[10px] font-medium mt-0.5 ${
                                                isToday ? 'text-brand-500 dark:text-brand-400 opacity-80' : 'text-gray-400 dark:text-gray-500'
                                            }`}>
                                                {DAY_NAMES[date.getDay()]}
                                            </span>
                                        </div>

                                        {/* Timeline Area */}
                                        <div className='relative overflow-hidden'>
                                            {/* Grid Lines */}
                                            <div className='absolute inset-0 grid pointer-events-none' style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, 1fr)` }}>
                                                {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                                                    <div key={i} className='border-r border-gray-200 dark:border-white/[0.05] h-full' />
                                                ))}
                                            </div>

                                            {/* Appointment Blocks */}
                                            <div className='relative h-full w-full py-2'>
                                                {rows.map((row, rowIndex) =>
                                                    row.map((appt) => {
                                                        const left = timeToPercent(appt.start);
                                                        const width = timeToPercent(appt.end) - left;
                                                        const top = PADDING / 2 + rowIndex * (ROW_HEIGHT + ROW_GAP);
                                                        const isConfirmed = appt.status === 'CONFIRMED';
                                                        const colorClass = isConfirmed
                                                            ? 'border-l-success-500 border-y border-r border-success-200/30 dark:border-success-500/20 bg-success-50/80 dark:bg-success-500/10 hover:bg-success-100 dark:hover:bg-success-500/20 shadow-sm'
                                                            : 'border-l-red-500 border-y border-r border-red-200/30 dark:border-red-500/20 bg-red-50/80 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 shadow-sm';
                                                        const textColor = isConfirmed
                                                            ? 'text-success-700 dark:text-success-300'
                                                            : 'text-red-700 dark:text-red-300';
                                                        const timeColor = isConfirmed
                                                            ? 'text-success-600/80 dark:text-success-400/80'
                                                            : 'text-red-600/80 dark:text-red-400/80';

                                                        const formatTime12 = (t) => {
                                                            const [h, m] = t.split(':').map(Number);
                                                            const h12 = h > 12 ? h - 12 : h;
                                                            const period = h >= 12 ? 'PM' : 'AM';
                                                            return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
                                                        };

                                                        return (
                                                            <div
                                                                key={appt.id}
                                                                className='absolute z-10 transition-all'
                                                                style={{ left: `${left}%`, width: `${Math.max(width, 5)}%`, top: `${top}px`, height: `${ROW_HEIGHT}px` }}
                                                            >
                                                                <div className={`h-full w-full px-2 py-1.5 flex flex-col justify-center overflow-hidden shadow-sm border-l-[3px] border-y border-r dark:border-r-0 backdrop-blur-[2px] transition-all cursor-pointer rounded-r-sm ${colorClass}`}>
                                                                    <div className={`font-medium truncate leading-tight text-[11px] sm:text-[12px] tracking-tight ${textColor}`}>
                                                                        {appt.service}
                                                                    </div>
                                                                    <div className='text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate'>
                                                                        {appt.patient}
                                                                    </div>
                                                                    <div className={`font-medium truncate opacity-90 text-[9px] sm:text-[10px] ${timeColor}`}>
                                                                        {formatTime12(appt.start)} - {formatTime12(appt.end)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchedulePage;
