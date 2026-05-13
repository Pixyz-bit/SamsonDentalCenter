import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay, addMinutes } from 'date-fns';
import { Link } from 'react-router-dom';

const START_HOUR = 8;
const END_HOUR = 18; // 6 PM
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const TIME_SLOTS = [];
for (let h = START_HOUR; h <= END_HOUR; h++) {
    TIME_SLOTS.push({ label: `${h > 12 ? h - 12 : h === 0 ? 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`, value: `${h}:00` });
    if (h < END_HOUR) {
        TIME_SLOTS.push({ label: `${h > 12 ? h - 12 : h === 0 ? 12 : h}:30 ${h >= 12 ? 'PM' : 'AM'}`, value: `${h}:30` });
    }
}

export default function DashboardCalendar({ appointments = [], loading = false }) {
    const [startDate, setStartDate] = useState(startOfDay(new Date()));
    const [dims, setDims] = useState({ slotWidth: 100, dayColWidth: 90, timelinePadding: 60 });

    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setDims({ slotWidth: 60, dayColWidth: 60, timelinePadding: 16 });
            else if (width < 1024) setDims({ slotWidth: 80, dayColWidth: 70, timelinePadding: 32 });
            else setDims({ slotWidth: 100, dayColWidth: 90, timelinePadding: 60 });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { slotWidth, dayColWidth, timelinePadding } = dims;
    const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const nav = (offset) => setStartDate(addDays(startDate, offset));
    const goToday = () => setStartDate(startOfDay(new Date()));

    const CALENDAR_MIN_WIDTH = dayColWidth + timelinePadding + (TIME_SLOTS.length * slotWidth);
    const gridTemplateColumns = `${dayColWidth}px ${timelinePadding}px 1fr`;

    const getMinuteOffset = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return (h * 60 + m) - (START_HOUR * 60);
    };
    
    const getAppointmentStyles = (app) => {
        const s = (app.status || '').toUpperCase();
        const as = (app.approval_status || '').toLowerCase();
        const type = (app.type || '').toLowerCase();
        
        // Red: Cancelled, Rejected, No Show, or Blocked
        const isBlocked = ['CANCELLED', 'REJECTED', 'NO_SHOW', 'LATE_CANCEL'].includes(s) || type === 'blocked';
        
        // Green: Approved or Confirmed
        const isApproved = s === 'CONFIRMED' || as === 'approved';
        
        // Yellow: Pending
        const isPending = s === 'PENDING' && as !== 'approved' && as !== 'rejected';

        if (isBlocked) {
            return {
                card: 'border-l-red-500 dark:border-l-red-400 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 hover:shadow-red-500/10 dark:hover:bg-red-900/20',
                title: 'text-red-700 dark:text-red-300 group-hover:text-red-600 dark:group-hover:text-red-200',
                time: 'text-red-600/80 dark:text-red-400/80',
                duration: 'text-red-500/70 dark:text-red-500/70'
            };
        }

        if (isPending) {
            return {
                card: 'border-l-amber-500 dark:border-l-amber-400 border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/40 hover:shadow-amber-500/10 dark:hover:bg-amber-900/20',
                title: 'text-amber-700 dark:text-amber-300 group-hover:text-amber-600 dark:group-hover:text-amber-200',
                time: 'text-amber-600/80 dark:text-amber-400/80',
                duration: 'text-amber-500/70 dark:text-amber-500/70'
            };
        }

        if (isApproved) {
            return {
                card: 'border-l-success-500 dark:border-l-success-400 border-success-100 dark:border-success-900/30 bg-success-50 dark:bg-success-950/40 hover:shadow-success-500/10 dark:hover:bg-success-900/20',
                title: 'text-success-700 dark:text-success-300 group-hover:text-success-600 dark:group-hover:text-success-200',
                time: 'text-success-600/80 dark:text-success-400/80',
                duration: 'text-success-500/70 dark:text-success-500/70'
            };
        }
        
        // Default: Brand color (Blue)
        return {
            card: 'border-l-brand-500 dark:border-l-brand-400 border-brand-100 dark:border-gray-700 bg-brand-50/50 dark:bg-white/[0.08] hover:shadow-brand-500/10 dark:hover:bg-white/[0.12]',
            title: 'text-brand-700 dark:text-brand-300 group-hover:text-brand-600 dark:group-hover:text-brand-200',
            time: 'text-brand-600/80 dark:text-brand-400/80',
            duration: 'text-brand-500/70 dark:text-brand-500/70'
        };
    };

    const getAppointmentTracks = (dayAppts) => {
        const sorted = [...dayAppts].sort((a, b) => getMinuteOffset(a.start_time) - getMinuteOffset(b.start_time));
        const tracks = []; // Each track is an array of appointments

        sorted.forEach(appt => {
            const start = getMinuteOffset(appt.start_time);
            let trackIndex = tracks.findIndex(track => {
                const lastAppt = track[track.length - 1];
                const lastEnd = getMinuteOffset(lastAppt.start_time) + (lastAppt.service?.duration || 60);
                return start >= lastEnd;
            });

            if (trackIndex === -1) {
                tracks.push([appt]);
            } else {
                tracks[trackIndex].push(appt);
            }
        });
        return tracks;
    };

    if (loading) {
        return (
            <div className='rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex flex-col h-[600px] animate-pulse'>
                <div className='p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between'>
                    <div className='h-6 w-32 bg-gray-100 dark:bg-white/5 rounded' />
                    <div className='h-6 w-24 bg-gray-100 dark:bg-white/5 rounded' />
                </div>
                <div className='flex-grow bg-gray-50/50 dark:bg-white/[0.01]' />
            </div>
        );
    }

    return (
        <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-2xl bg-white/50 dark:bg-white/[0.02] backdrop-blur-md shadow-sm overflow-hidden transition-all duration-300">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/10">
                        <ChevronRight size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-[18px] sm:text-[20px] font-medium text-gray-900 dark:text-white tracking-tight leading-tight">Upcoming Schedule</h4>
                        <p className="text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-400 mt-0.5">
                            Timeline view of your dental journey • <span className="text-brand-500">Approved & Pending Sessions</span>
                        </p>
                    </div>
                </div>
                <Link to="/patient/appointments" className="hidden sm:inline-flex items-center gap-2 px-4 h-9 text-[11px] font-medium border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/30 transition-all text-gray-700 dark:text-gray-300 tracking-wide">
                    View all requests <ArrowRight size={14} />
                </Link>
            </div>

            {/* Navigation Section */}
            <div className='flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-white/[0.01]'>
                <h3 className='text-[14px] sm:text-[15px] font-medium text-gray-900 dark:text-white tracking-tight'>{`Week of ${format(startDate, 'MMMM d, yyyy')}`}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={goToday} className="text-[11px] font-medium px-3 h-7.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-400">Today</button>
                    <div className="flex items-center gap-1">
                        <button onClick={() => nav(-7)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400"><ChevronLeft size={14} strokeWidth={2.5} /></button>
                        <button onClick={() => nav(7)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400"><ChevronRight size={14} strokeWidth={2.5} /></button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid (Scrollbar at top using rotateX hack) */}
            <div className='overflow-x-auto grow scroll-smooth pb-1' style={{ transform: 'rotateX(180deg)' }}>
                <div style={{ minWidth: `${CALENDAR_MIN_WIDTH}px`, transform: 'rotateX(180deg)' }} className='h-full flex flex-col'>
                    
                    {/* Time Scale Header (Absolute Positioning for perfect alignment) */}
                    <div className='grid border-b border-gray-300 dark:border-gray-700 bg-gray-50/20 dark:bg-white/[0.03] sticky top-0 z-30' style={{ gridTemplateColumns: `${dayColWidth}px ${timelinePadding}px 1fr` }}>
                        <div className='p-2.5 border-r border-gray-300 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-40 text-[9px] font-medium text-gray-400 dark:text-gray-500 text-center flex items-center justify-center'>Day / Time</div>
                        <div className='border-r border-gray-300 dark:border-gray-700 bg-gray-50/10 dark:bg-white/[0.01]' />
                        
                        <div className='relative h-11 w-full'>
                            {/* Header Grid Lines (Ticks) */}
                            <div className='absolute inset-0 grid pointer-events-none' style={{ gridTemplateColumns: `repeat(${TIME_SLOTS.length - 1}, 1fr)` }}>
                                {TIME_SLOTS.slice(0, -1).map((_, i) => (
                                    <div key={i} className='border-r border-gray-200 dark:border-gray-700 h-full' />
                                ))}
                            </div>

                            {/* Time Labels */}
                            {TIME_SLOTS.map((slot, i) => {
                                const percent = (i / (TIME_SLOTS.length - 1)) * 100;
                                return (
                                    <div 
                                        key={i} 
                                        className='absolute bottom-1.5 -translate-x-1/2 px-1 bg-white dark:bg-transparent z-10'
                                        style={{ left: `${percent}%` }}
                                    >
                                        <p className={`font-medium text-gray-800 dark:text-gray-200 tabular-nums ${slot.value.includes(':30') ? 'text-[9px] opacity-40' : 'text-[11px]'}`}>
                                            {format(new Date().setHours(...slot.value.split(':')), slot.value.includes(':30') ? 'h:mm' : 'h a')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Day Rows */}
                    <div className='flex-grow bg-white dark:bg-transparent'>
                        {dates.map((day, dayIdx) => {
                            const active = isSameDay(day, new Date());
                            const dayAppts = appointments.filter(a => isSameDay(new Date(a.date), day));
                            const tracks = getAppointmentTracks(dayAppts);
                            const rowHeight = Math.max(1, tracks.length) * 90 + 16; // 90px per card + padding

                            return (
                                <div 
                                    key={dayIdx} 
                                    className={`grid border-b last:border-b-0 border-gray-300 dark:border-gray-700 transition-all ${active ? 'bg-brand-50/20 dark:bg-white/[0.04]' : 'hover:bg-gray-50/30 dark:hover:bg-white/[0.01]'}`}
                                    style={{ gridTemplateColumns, minHeight: `${rowHeight}px` }}
                                >
                                    {/* Sticky Date Label (Opaque to prevent overlap visibility) */}
                                    <div className={`p-2.5 border-r border-gray-300 dark:border-gray-700 sticky left-0 z-20 flex flex-col items-center justify-center shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)] ${active ? 'bg-brand-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
                                        <span className={`text-[20px] sm:text-[24px] font-medium leading-none ${active ? 'text-brand-500 dark:text-brand-400' : 'text-gray-900 dark:text-gray-100'}`}>{format(day, 'd')}</span>
                                        <span className={`text-[10px] font-medium mt-0.5 ${active ? 'text-brand-500 dark:text-brand-400 opacity-80' : 'text-gray-400 dark:text-gray-500'}`}>{format(day, 'EEE')}</span>
                                    </div>
                                    
                                    <div className='border-r border-gray-300 dark:border-gray-700 bg-gray-50/10 dark:bg-white/[0.01]' />

                                    {/* Appointment Container */}
                                    <div className='relative overflow-hidden'>
                                        {/* Background Grid Lines */}
                                        <div className='absolute inset-0 grid pointer-events-none' style={{ gridTemplateColumns: `repeat(${TIME_SLOTS.length - 1}, 1fr)` }}>
                                            {TIME_SLOTS.slice(0, -1).map((_, i) => (
                                                <div key={i} className='border-r border-gray-200 dark:border-white/[0.05] h-full' />
                                            ))}
                                        </div>

                                        {/* Positioned Appointments */}
                                        <div className='relative h-full w-full py-3'>
                                            {tracks.map((track, trackIndex) => (
                                                track.map((app, i) => {
                                                    const start = getMinuteOffset(app.start_time);
                                                    const duration = app.service?.duration || 60;
                                                    const left = (start / TOTAL_MINUTES) * 100;
                                                    const width = (duration / TOTAL_MINUTES) * 100;

                                                    const styles = getAppointmentStyles(app);
                                                    
                                                    return (
                                                        <div 
                                                            key={`${trackIndex}-${i}`}
                                                            className='absolute z-10 transition-all'
                                                            style={{ 
                                                                left: `${left}%`,
                                                                width: `${width}%`,
                                                                top: `${trackIndex * 90 + 8}px`,
                                                                height: '82px'
                                                            }}
                                                        >
                                                            <Link 
                                                                to={`/patient/appointments/${app.id}`}
                                                                className={`
                                                                    h-full w-full p-2.5 flex flex-col justify-center overflow-hidden 
                                                                    shadow-sm border-l-[3px] border-y border-r dark:border-r-0 backdrop-blur-[2px] transition-all group
                                                                    ${styles.card}
                                                                `}
                                                            >
                                                                <div className={`font-medium truncate leading-tight text-[13px] sm:text-[14px] mb-1 tracking-tight ${styles.title}`}>
                                                                    {app.service?.name || app.service}
                                                                </div>
                                                                {(app.patient_name || app.booked_for_name) && (
                                                                    <div className="text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1 truncate flex items-center gap-1">
                                                                        <span className="opacity-70">For:</span>
                                                                        <span className="text-gray-900 dark:text-white">{app.patient_name || app.booked_for_name}</span>
                                                                    </div>
                                                                )}
                                                                <div className={`font-medium truncate opacity-90 text-[11px] sm:text-[12px] ${styles.time}`}>
                                                                    {(() => {
                                                                        const [h, m] = app.start_time.split(':').map(Number);
                                                                        const s = new Date();
                                                                        s.setHours(h, m, 0, 0);
                                                                        const e = addMinutes(s, duration);
                                                                        return `${format(s, 'h:mm')} - ${format(e, 'h:mm a')}`;
                                                                    })()}
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    );
                                                })
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
