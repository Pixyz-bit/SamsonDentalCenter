import React from 'react';
import { Star, Mail, MailOpen } from 'lucide-react';

const NotificationRow = ({ notification, onToggleStar, onToggleRead, onClick }) => {
    const { id, title, message, category, time, isRead, isStarred } = notification;

    const displayCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace('_', ' ');

    const handleStarClick = (e) => {
        e.stopPropagation();
        onToggleStar(id, !isStarred);
    };

    const handleReadClick = (e) => {
        e.stopPropagation();
        onToggleRead(id, !isRead);
    };

    return (
        <div
            onClick={() => onClick(id)}
            className={`group relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-4 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:z-10 ${
                isRead ? 'bg-white dark:bg-white/[0.02]' : 'bg-brand-50/30 dark:bg-brand-500/5'
            }`}
        >
            {/* Desktop View */}
            <div className='hidden sm:flex items-center gap-4 w-full'>
                <div className='flex items-center gap-3 shrink-0'>
                    <button
                        onClick={handleStarClick}
                        className={`transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isStarred ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'}`}
                    >
                        <Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <div className='w-32 lg:w-40 shrink-0 truncate'>
                    <span className={`text-sm sm:text-base ${isRead ? 'text-gray-500 font-medium' : 'text-gray-900 dark:text-white font-bold'}`}>
                        {displayCategory}
                    </span>
                </div>

                <div className='flex-grow min-w-0'>
                    <p className='text-sm sm:text-base truncate pr-4'>
                        <span className={`${isRead ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-900 dark:text-white font-bold'}`}>
                            {title}
                        </span>
                        <span className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium ml-1'>
                            - {message}
                        </span>
                    </p>
                </div>

                <div className='flex items-center gap-4 shrink-0 min-w-[100px] justify-end'>
                    <span className='group-hover:hidden text-xs text-gray-400 dark:text-gray-500 font-medium'>
                        {time}
                    </span>
                    <div className='hidden group-hover:flex items-center gap-2'>
                        <button
                            onClick={handleReadClick}
                            className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600'
                        >
                            {isRead ? <MailOpen size={16} /> : <Mail size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile View */}
            <div className='flex sm:hidden gap-4 w-full'>
                <div className='shrink-0'>
                    <div className='w-12 h-12 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg'>
                        {displayCategory.charAt(0)}
                    </div>
                </div>
                <div className='flex-grow min-w-0 flex flex-col gap-0.5'>
                    <div className='flex justify-between items-center'>
                        <span className={`text-sm tracking-tight truncate ${isRead ? 'text-gray-500' : 'text-gray-900 dark:text-white font-bold'}`}>
                            {displayCategory}
                        </span>
                        <span className='text-[10px] text-gray-400 font-medium'>{time}</span>
                    </div>
                    <div className={`text-sm truncate ${isRead ? 'text-gray-600' : 'text-gray-900 dark:text-white font-semibold'}`}>
                        {title}
                    </div>
                    <div className='flex justify-between items-end'>
                        <div className='text-xs text-gray-400 truncate pr-4 grow'>{message}</div>
                        <button onClick={handleStarClick} className={`shrink-0 transition-colors ${isStarred ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            <Star size={20} fill={isStarred ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationRow;
