import React from 'react';
import { ChevronLeft, Star, Mail, MailOpen } from 'lucide-react';

const NotificationDetailView = ({ notification, onBack, onToggleStar, onToggleRead }) => {
    if (!notification) return null;

    const { id, title, message, category, time, isStarred, isRead } = notification;
    const displayCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace('_', ' ');

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]'>
            {/* Action Bar */}
            <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
                <button 
                    onClick={onBack}
                    className='p-2 rounded-lg bg-gray-100 dark:bg-white/[0.05] text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors'
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className='p-5 sm:p-8 md:p-10 overflow-y-auto grow no-scrollbar pb-24 sm:pb-8 md:pb-10'>
                <div className='space-y-4 sm:space-y-6'>
                    <h2 className='text-[22px] sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit leading-tight tracking-tight'>
                        {title}
                    </h2>
                    <div className='flex items-center justify-between border-b border-gray-100/50 dark:border-gray-800 pb-6'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm sm:text-base'>
                                {category.charAt(0)}
                            </div>
                            <div>
                                <p className='text-[13px] sm:text-sm font-bold text-gray-900 dark:text-white'>{displayCategory} Alert</p>
                                <p className='text-[10px] sm:text-[11px] text-gray-400 font-medium'>To: Doctor Portal</p>
                            </div>
                        </div>
                        <span className='text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider'>{time}</span>
                    </div>
                </div>

                <div className='prose prose-sm dark:prose-invert max-w-none pt-4 sm:pt-6'>
                    <div 
                        className='text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base whitespace-pre-wrap'
                        dangerouslySetInnerHTML={{ __html: notification.richMessage || notification.message }}
                    />
                    
                    <p className='mt-10 sm:mt-12 text-[13px] sm:text-sm text-gray-400 italic font-medium'>
                        System generated alert,<br />
                        The PrimeraDental Platform
                    </p>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-20 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md sm:shadow-none'>
                <div className='flex items-center gap-3 w-full'>
                    <div className='hidden sm:block sm:w-1/2 text-gray-400 text-xs font-medium'>
                        Last updated {time}
                    </div>
                    <div className='flex flex-1 sm:w-1/2 gap-3 sm:justify-end'>
                        <button 
                            onClick={() => onToggleStar(id, !isStarred)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-bold text-xs ${
                                isStarred 
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' 
                                : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                        >
                            <Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
                            {isStarred ? 'Starred' : 'Star'}
                        </button>
                        <button 
                            onClick={() => onToggleRead(id, !isRead)}
                            className={`flex-1 sm:flex-none sm:min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] sm:text-sm font-bold rounded-lg transition-all ${
                                isRead 
                                ? 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300 hover:bg-gray-200' 
                                : 'bg-brand-500 text-white hover:bg-brand-600'
                            }`}
                        >
                            {isRead ? <MailOpen size={18} /> : <Mail size={18} />}
                            {isRead ? 'Mark Unread' : 'Mark Read'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailView;
