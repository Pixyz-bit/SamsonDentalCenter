import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, CheckCircle2, XCircle, RotateCcw, CalendarDays } from 'lucide-react';

const CATEGORIES = [
    { id: '', label: 'All', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'pending', label: 'Pending', icon: RotateCcw },
    { id: 'cancel', label: 'Cancelled', icon: XCircle },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const formatTodayDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const AppointmentFilters = ({ search, onSearchChange, statusFilter, onStatusChange }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

    return (
        <div className='px-4 sm:px-6 py-5 border-b border-gray-100 dark:border-gray-800 space-y-4'>
            {/* Search + Clock + Date */}
            <div className='flex gap-2 sm:gap-3 items-center'>
                <div className='relative flex-grow'>
                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                        <Search size={18} />
                    </span>
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder='Search patient, service...'
                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none'
                    />
                </div>

                {/* Live Clock */}
                <div className='flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm shadow-sm shrink-0'>
                    <Clock size={14} className='text-brand-500 shrink-0 animate-pulse' aria-hidden='true' />
                    <span className='font-outfit tabular-nums tracking-tight'>{timeString}</span>
                </div>

                {/* Today's Date */}
                <div className='hidden sm:flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm shadow-sm shrink-0'>
                    <CalendarDays size={14} className='text-gray-400 dark:text-gray-500 shrink-0' aria-hidden='true' />
                    <span className='truncate font-outfit'>{formatTodayDate()}</span>
                </div>
            </div>

            {/* Categories */}
            <div className='flex items-center gap-2 overflow-x-auto no-scrollbar'>
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = statusFilter === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onStatusChange(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                isActive 
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                                : 'bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
                            }`}
                        >
                            <Icon size={14} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AppointmentFilters;
