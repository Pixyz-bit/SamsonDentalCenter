import React, { useState, useEffect } from 'react';
import { Search, Mail, Star, Calendar, Bell } from 'lucide-react';
import NotificationRow from './NotificationRow';
import NotificationSkeleton from './NotificationSkeleton';
import Pagination from '../../common/Pagination';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: Mail, key: 'all' },
    { id: 'unread', label: 'Unread', icon: Bell, key: 'unread' },
    { id: 'starred', label: 'Starred', icon: Star, key: 'starred' },
    { id: 'appointment', label: 'Appointments', icon: Calendar, key: 'appointment' },
];

const NotificationInbox = ({
    notifications,
    totalCount,
    stats = {},
    currentPage,
    totalPages,
    onPageChange,
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearchChange,
    onToggleStar,
    onToggleRead,
    onMarkAllRead,
    onNotificationClick,
    loading = false
}) => {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    const getCount = (key) => {
        if (key === 'all') return totalCount || 0;
        if (key === 'unread') return stats.unread || 0;
        if (key === 'starred') return stats.starred || 0;
        if (key === 'appointment') return stats.appointment || 0;
        return 0;
    };

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 overflow-hidden'>
            <div className='px-4 sm:px-6 py-5 border-b border-gray-100 dark:border-gray-800 space-y-4'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='relative flex-grow'>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                            <Search size={18} />
                        </span>
                        <input
                            type='text'
                            placeholder='Search notifications...'
                            className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/3 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none'
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>
                    {stats.unread > 0 && (
                        <button 
                            onClick={onMarkAllRead}
                            className='hidden sm:block text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors'
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1'>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeFilter === cat.id;
                        const count = getCount(cat.key);
                        
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onFilterChange(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all group ${
                                    isActive
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{cat.label}</span>
                                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] leading-none transition-all ${
                                    isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-white/20'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className='grow flex flex-col'>
                <div className='flex flex-col grow min-h-120 md:min-h-140 overflow-y-auto pb-14 sm:pb-0'>
                    {loading && notifications.length === 0 ? (
                        <NotificationSkeleton rows={6} />
                    ) : notifications.length > 0 ? (
                        notifications.map((n) => (
                            <NotificationRow
                                key={n.id}
                                notification={n}
                                onToggleStar={onToggleStar}
                                onToggleRead={onToggleRead}
                                onClick={onNotificationClick}
                            />
                        ))
                    ) : (
                        <div className='flex flex-col items-center justify-center py-20 text-center'>
                            <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4'>
                                <Mail size={32} />
                            </div>
                            <h4 className='text-lg font-bold text-gray-800 dark:text-white mb-1'>
                                No notifications found
                            </h4>
                            <p className='text-sm text-gray-500'>Your inbox is looking clean!</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className='px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationInbox;
