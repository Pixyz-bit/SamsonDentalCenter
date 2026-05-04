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

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const DeskIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 20H23M4 20V9C4 7.34315 5.34315 6 7 6H17C18.6569 6 20 7.34315 20 9V20M9 10H15M12 20V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const BookingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C7.03 15 3 19.03 3 24H21C21 19.03 16.97 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 8V12M17 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PatientsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const AppointmentsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ShieldIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const navItems = [
    {
        icon: <GridIcon />,
        name: 'Dashboard',
        path: '/',
    },
    {
        icon: <DeskIcon />,
        name: 'Front Desk',
        path: '/front-desk',
    },
    {
        icon: <CalendarIcon />,
        name: "Doctor's Schedule",
        path: '/calendar',
    },
    {
        icon: <AppointmentsIcon />,
        name: 'Appointments',
        path: '/appointments',
    },
    {
        icon: <CheckIcon />,
        name: 'Approvals',
        path: '/approvals',
    },
    {
        icon: <BookingIcon />,
        name: 'Booking Desk',
        path: '/booking',
    },

    {
        icon: <PatientsIcon />,
        name: 'Patients',
        path: '/patients',
    },
    {
        icon: <AlertIcon />,
        name: 'Displaced',
        path: '/displaced',
    },
    {
        icon: <ShieldIcon />,
        name: 'Audit Logs',
        path: '/audit-logs',
    },
];


const SecretarySidebar = () => {
    const { isExpanded, isMobileOpen, setIsMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();

    const isActive = useCallback(
        (path) => {
            if (path === '/' && location.pathname !== '/') return false;
            return location.pathname.startsWith(path);
        },
        [location.pathname]
    );
    
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 pb-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
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
            {/* Logo */}
            <div
                className={`py-8 flex ${
                    !isExpanded && !isHovered
                        ? 'lg:justify-center'
                        : 'justify-start'
                }`}
            >
                <Link to='/'>
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <span className='text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-outfit'>
                                Samson <span className='text-brand-500'>Dental</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className='text-2xl font-black text-brand-500 font-outfit'>
                                S
                            </span>
                        </>
                    )}
                </Link>
            </div>

            {/* Nav */}
            <div className='flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar'>
                <nav className='mb-6'>
                    <div className='flex flex-col'>
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered
                                        ? 'lg:justify-center'
                                        : 'justify-start'
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    'Menu'
                                ) : (
                                    <HorizontalDots className='size-6' />
                                )}
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
                                            } ${
                                                !isExpanded && !isHovered
                                                    ? 'lg:justify-center'
                                                    : 'lg:justify-start'
                                            }`}
                                        >
                                            <span
                                                className={`menu-item-icon-size ${
                                                    isActive(nav.path)
                                                        ? 'menu-item-icon-active'
                                                        : 'menu-item-icon-inactive'
                                                }`}
                                            >
                                                {nav.icon}
                                            </span>
                                            {(isExpanded ||
                                                isHovered ||
                                                isMobileOpen) && (
                                                <span className='menu-item-text'>
                                                    {nav.name}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default SecretarySidebar;
