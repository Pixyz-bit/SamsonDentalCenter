import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

// ── Inline SVG Icons ──
const GridIcon = () => (
    <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M3.5 3.5H10.5V10.5H3.5V3.5ZM13.5 3.5H20.5V10.5H13.5V3.5ZM3.5 13.5H10.5V20.5H3.5V13.5ZM13.5 13.5H20.5V20.5H13.5V13.5Z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);

const CalendarIcon = () => (
    <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M15.695 13.7H15.704M15.695 16.7H15.704M11.995 13.7H12.005M11.995 16.7H12.005M8.295 13.7H8.305M8.295 16.7H8.305'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);

const UserCircleIcon = () => (
    <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);

const BellIcon = () => (
    <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M15 17H20L18.595 15.595C18.214 15.214 18 14.697 18 14.159V11C18 7.301 15.482 4.191 12.1 3.507V3.5C12.1 2.672 11.428 2 10.6 2C9.772 2 9.1 2.672 9.1 3.5V3.507C5.718 4.191 3.2 7.301 3.2 11V14.159C3.2 14.697 2.986 15.214 2.605 15.595L1.2 17H6.2M15 17V18C15 20.209 13.209 22 11 22C8.791 22 7 20.209 7 18V17M15 17H7'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);

const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.5L12 4L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const UsersIcon = () => (
    <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M2 18V17C2 14.7909 3.79086 13 6 13H12C14.2091 13 16 14.7909 16 17V18'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M19 13C21.2091 13 23 14.7909 23 17V18'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);

const ClipboardIcon = () => (
    <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M16 4H18C19.1046 4 20 4.89543 20 6V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V6C4 4.89543 4.89543 4 6 4H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 16H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SettingsIcon = () => (
    <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
    >
        <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
        <circle cx='12' cy='12' r='3' />
    </svg>
);

const HistoryIcon = () => (
    <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.05 11C3.2107 9.42547 3.82475 7.94092 4.8213 6.71692C5.81785 5.49291 7.1511 4.5855 8.66794 4.09915C10.1848 3.6128 11.8152 3.56994 13.3688 3.97544C14.9224 4.38094 16.3274 5.21584 17.421 6.384L20 9M20 9V4M20 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.95 13C20.7893 14.5745 20.1753 16.0591 19.1787 17.2831C18.1821 18.5071 16.8489 19.4145 15.3321 19.9008C13.8152 20.3872 12.1848 20.4301 10.6312 20.0246C9.07759 19.6191 7.6726 18.7842 6.579 17.616L4 15M4 15V20M4 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const HorizontalDots = ({ className }) => (
    <svg
        className={className}
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <circle cx='6' cy='12' r='1.5' fill='currentColor' />
        <circle cx='12' cy='12' r='1.5' fill='currentColor' />
        <circle cx='18' cy='12' r='1.5' fill='currentColor' />
    </svg>
);

const navItems = [
    {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/patient',
    },
    {
        icon: <CalendarIcon />,
        name: 'My Appointments',
        path: '/patient/appointments',
    },
    {
        icon: <ClipboardIcon />,
        name: 'My Requests',
        path: '/patient/requests',
    },
    {
        icon: <UsersIcon />,
        name: 'Family Members',
        path: '/patient/dependents',
    },
    {
        icon: <HistoryIcon />,
        name: 'Appointment History',
        path: '/patient/history',
    },
    {
        icon: <BellIcon />,
        name: 'Notifications',
        path: '/patient/notifications',
    },
    {
        icon: <UserCircleIcon />,
        name: 'Profile',
        path: '/patient/profile',
    },
    {
        icon: <SettingsIcon />,
        name: 'Settings',
        path: '/patient/settings',
    },
];


const PatientSidebar = () => {
    const { isExpanded, isMobileOpen, setIsMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    const isActive = useCallback(
        (path) => location.pathname === path,
        [location.pathname]
    );
    
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <aside
            className={`fixed top-16 lg:top-0 flex flex-col px-5 pb-20 lg:pb-8 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100dvh-64px)] lg:h-[100dvh] transition-[width,transform,padding] duration-300 ease-in-out z-50 border-r border-gray-200 
                ${
                    isExpanded || isMobileOpen
                        ? 'w-[290px]'
                        : isHovered
                        ? 'w-[290px]'
                        : 'w-[90px]'
                }
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`pt-5 pb-6 flex w-full transition-all duration-300 pl-[13px]`}>
                <Link to='/patient' className="flex items-center min-h-[40px]">
                    <div className='flex items-center gap-3 transition-all duration-300 group flex-shrink-0'>
                        <div className='w-[24px] flex-shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110'>
                            <img
                                src='/images/logo/samson-logo.png'
                                alt='Samson Dental Logo'
                                className='w-10 h-auto min-w-[40px]'
                            />
                        </div>
                        <div className={`flex flex-col items-start justify-center flex-shrink-0 transition-all duration-300 ${
                            isExpanded || isHovered || isMobileOpen 
                            ? 'opacity-100 max-w-[200px] visible ml-1' 
                            : 'opacity-0 max-w-0 invisible ml-0'
                        }`}>
                            <span className='font-black text-[24px] tracking-[-0.03em] leading-[0.8] text-black dark:text-white whitespace-nowrap font-serif'>
                                SAMSON
                            </span>
                            <span className='text-[10px] uppercase tracking-[0.16em] font-black mt-0 text-gray-400 dark:text-gray-500 whitespace-nowrap font-serif block w-full text-center'>
                                DENTAL CENTER
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <div className='flex-1 min-h-0 flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar'>
                <nav className='mb-6'>
                    <div className='flex flex-col'>
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex items-center leading-[20px] text-gray-400 pl-[13px] transition-all duration-300`}
                            >
                                <div className={`flex items-center transition-all duration-300 ${isExpanded || isHovered || isMobileOpen ? 'opacity-0 scale-50 w-0 overflow-hidden' : 'opacity-100 scale-100 w-[24px]'}`}>
                                    <HorizontalDots className='size-6' />
                                </div>
                                <span className={`sidebar-text-base ${
                                    isExpanded || isHovered || isMobileOpen 
                                    ? 'opacity-100 max-w-[200px] visible ml-0' 
                                    : 'opacity-0 max-w-0 invisible ml-0 text-transparent'
                                }`}>
                                    Menu
                                </span>
                            </h2>
                            <ul className='flex flex-col gap-1'>
                                {navItems.map((nav) => (
                                    <li key={nav.name}>
                                        <Link
                                            to={nav.path}
                                            className={`menu-item group ${
                                                isActive(nav.path)
                                                    ? 'menu-item-active'
                                                    : 'menu-item-inactive'
                                            }`}
                                        >
                                            <span
                                                className={`menu-item-icon-size shrink-0 ${
                                                    isActive(nav.path)
                                                        ? 'menu-item-icon-active'
                                                        : 'menu-item-icon-inactive'
                                                }`}
                                            >
                                                {nav.icon}
                                            </span>
                                            <span className={`sidebar-text-base menu-item-text ${
                                                isExpanded || isHovered || isMobileOpen 
                                                ? 'sidebar-text-expanded' 
                                                : 'sidebar-text-collapsed'
                                            }`}>
                                                {nav.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Sidebar Footer */}
            <div className='mt-auto pt-4 border-t border-gray-100 dark:border-gray-800'>
                <ul className='flex flex-col gap-1'>
                    <li>
                        <Link
                            to='/'
                            className={`menu-item group menu-item-inactive`}
                        >
                            <span className='menu-item-icon-size menu-item-icon-inactive shrink-0'>
                                <HomeIcon />
                            </span>
                            <span className={`sidebar-text-base menu-item-text ${
                                isExpanded || isHovered || isMobileOpen 
                                ? 'sidebar-text-expanded' 
                                : 'sidebar-text-collapsed'
                            }`}>
                                Back to Home
                            </span>
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default PatientSidebar;
