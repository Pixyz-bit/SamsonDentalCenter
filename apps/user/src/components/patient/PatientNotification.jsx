import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useClickOutside from '../../hooks/useClickOutside';
import useNotifications from '../../hooks/useNotifications';
import { formatFullDateTime } from '../../hooks/useAppointments';

const PatientNotification = () => {
    const { notifications, unreadCount, markRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);

    useClickOutside(notificationRef, () => {
        if (isOpen) setIsOpen(false);
    });

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleRead = async (id, e) => {
        if (e) e.stopPropagation();
        await markRead(id);
        // Removed setIsOpen(false) to prevent unexpected closure when clicking items
    };

    return (
        <div className='relative' ref={notificationRef}>
            <button
                className='relative flex items-center justify-center text-gray-500 bg-white border border-gray-200 rounded-full hover:text-gray-700 h-10 w-10 hover:bg-gray-100 lg:h-11 lg:w-11 dark:bg-white/[0.03] dark:border-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                onClick={toggleDropdown}
                aria-label='Notifications'
            >
                {unreadCount > 0 && (
                    <span className='absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-800'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                <svg
                    className='fill-current'
                    width='20'
                    height='20'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z'
                        fill='currentColor'
                    />
                </svg>
            </button>

            {isOpen && (
                <div className='absolute right-[-52px] sm:right-0 mt-3 flex h-auto max-h-[480px] w-[300px] sm:w-[350px] flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-theme-lg z-50'>
                    <div className='flex items-center justify-between px-3 py-3 border-b border-gray-100 dark:border-gray-800 mb-1'>
                        <h5 className='text-sm sm:text-base font-bold text-gray-800 dark:text-white font-outfit uppercase tracking-tight'>
                            Notifications
                        </h5>
                    </div>
                    <ul className='flex flex-col h-auto overflow-y-auto no-scrollbar gap-1 px-1'>
                        {notifications.length === 0 ? (
                            <li className='py-8 text-center text-gray-400 text-xs sm:text-sm'>
                                No notifications yet.
                            </li>
                        ) : (
                            notifications.slice(0, 3).map((n) => (
                                <li key={n.id}>
                                    <Link 
                                        to={`/patient/notifications?id=${n.id}`}
                                        onClick={(e) => handleRead(n.id, e)}
                                        className={`flex gap-3 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-gray-100/50 dark:bg-white/[0.04]' : ''}`}
                                    >
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600'}`}>
                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin='round' strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div className='block min-w-0 text-left flex-1'>
                                            <p className={`text-[12px] sm:text-[13px] mb-0.5 leading-tight truncate ${!n.is_read ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {n.title}
                                            </p>
                                            <p className='text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1'>
                                                {n.message}
                                            </p>
                                            <span className='text-[9px] text-gray-400 font-medium mt-1 block uppercase tracking-wider'>
                                                {n.sent_at ? formatFullDateTime(n.sent_at) : ''}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                    <div className="p-1 mt-1">
                        <Link
                            to='/patient/notifications'
                            className='block px-4 py-2.5 text-[11px] sm:text-xs font-bold text-center text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20 uppercase tracking-widest'
                            onClick={() => setIsOpen(false)}
                        >
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientNotification;
