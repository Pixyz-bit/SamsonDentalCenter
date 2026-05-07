import { useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

// â”€â”€ Inline SVG Icons â”€â”€
const GridIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M3.5 3.5H10.5V10.5H3.5V3.5ZM13.5 3.5H20.5V10.5H13.5V3.5ZM3.5 13.5H10.5V20.5H3.5V13.5ZM13.5 13.5H20.5V20.5H13.5V13.5Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

const UserCircleIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

const MailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9.5L12 4L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HorizontalDots = ({ className }) => (
    <svg className={className} width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='6' cy='12' r='1.5' fill='currentColor' />
        <circle cx='12' cy='12' r='1.5' fill='currentColor' />
        <circle cx='18' cy='12' r='1.5' fill='currentColor' />
    </svg>
);

const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StaffIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21V19C23 17.9391 22.5786 16.9217 21.8284 16.1716C21.0783 15.4214 20.0609 15 19 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.1147 19.0078 7C19.0078 7.8853 18.7122 8.74608 18.1676 9.44768C17.623 10.1493 16.8604 10.6497 16 10.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PatientsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 19.5C5 19.5 7.5 17 12 17C16.5 17 19 19.5 19 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ServicesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.7 6.3C15.1 5.9 15.1 5.2 14.7 4.8L13.2 3.3C12.8 2.9 12.1 2.9 11.7 3.3L10.2 4.8C9.8 5.2 9.8 5.9 10.2 6.3L14.7 6.3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 16.5C21 15.7 20.3 15 19.5 15H17V13.5C17 12.7 16.3 12 15.5 12H13.5C12.7 12 12 12.7 12 13.5V15H4.5C3.7 15 3 15.7 3 16.5V21H21V16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.22 2H11.78C11.37 2 11.08 2.29 11.05 2.7L10.89 4.31C10.5 4.45 10.14 4.64 9.8 4.88L8.27 4.19C7.89 4.02 7.42 4.09 7.11 4.4L6.8 4.71C6.49 5.02 6.42 5.49 6.59 5.86L7.28 7.39C7.04 7.73 6.85 8.1 6.71 8.49L5.1 8.65C4.69 8.68 4.4 8.97 4.4 9.38V9.82C4.4 10.23 4.69 10.52 5.1 10.55L6.71 10.71C6.85 11.1 7.04 11.47 7.28 11.81L6.59 13.34C6.42 13.71 6.49 14.18 6.8 14.49L7.11 14.8C7.42 15.11 7.89 15.18 8.27 15.01L9.8 14.32C10.14 14.56 10.5 14.75 10.89 14.89L11.05 16.5C11.08 16.91 11.37 17.2 11.78 17.2H12.22C12.63 17.2 12.92 16.91 12.95 16.5L13.11 14.89C13.5 14.75 13.86 14.56 14.2 14.32L15.73 15.01C16.11 15.18 16.58 15.11 16.89 14.8L17.2 14.49C17.51 14.18 17.58 13.71 17.41 13.34L16.72 11.81C16.96 11.47 17.15 11.1 17.29 10.71L18.9 10.55C19.31 10.52 19.6 10.23 19.6 9.82V9.38C19.6 8.97 19.31 8.68 18.9 8.65L17.29 8.49C17.15 8.1 16.96 7.73 16.72 7.39L17.41 5.86C17.58 5.49 17.51 5.02 17.2 4.71L16.89 4.4C16.58 4.09 16.11 4.02 15.73 4.19L14.2 4.88C13.86 4.64 13.5 4.45 13.11 4.31L12.95 2.7C12.92 2.29 12.63 2 12.22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="9.6" r="2.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AuditIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.05 11C3.2428 9.07663 4.0762 7.28315 5.4243 5.89796C6.77241 4.51276 8.5587 3.59379 10.5134 3.28014C12.4682 2.96649 14.4795 3.27557 16.2413 4.16112C18.0032 5.04666 19.4184 6.45863 20.269 8.18182" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.95 13C20.7572 14.9234 19.9238 16.7169 18.5757 18.102C17.2276 19.4872 15.4413 20.4062 13.4866 20.7199C11.5318 21.0335 9.52055 20.7244 7.7587 19.8389C5.99684 18.9533 4.58162 17.5414 3.73102 15.8182" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 8H16V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16H8V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UpcomingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TodayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.9101 4.6705 15.6637 5.7909 17.031L3 21L6.969 18.2091C8.3363 19.3295 10.0899 20 12 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DisplacedIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

const PendingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12V15L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const navigationGroups = [
    {
        title: 'Overview',
        items: [{ icon: <HomeIcon />, name: 'Dashboard', path: '/' }],
    },
    {
        title: 'Global Appointments',
        items: [
            { icon: <PendingIcon />, name: 'Approvals Inbox', path: '/registry/pending' },
            { icon: <DisplacedIcon />, name: 'Rescheduling Queue', path: '/registry/displaced' },
            { icon: <GridIcon />, name: 'Global Schedule', path: '/registry/upcoming' },
            { icon: <TodayIcon />, name: "Today's Attendance", path: '/registry/today' },
            { icon: <HistoryIcon />, name: 'Clinical History', path: '/registry/history' },
        ],
    },
    {
        title: 'Clinic Management',
        items: [
            { icon: <PatientsIcon />, name: 'Patient Database', path: '/patients' },
            { icon: <UserCircleIcon />, name: 'Doctor Profiles', path: '/doctors' },
            { icon: <StaffIcon />, name: 'Staff Management', path: '/staff' },
            { icon: <ServicesIcon />, name: 'Services Catalog', path: '/services' },
        ],
    },
    {
        title: 'System & Logs',
        items: [
            { icon: <MailIcon />, name: 'Message Logs', path: '/message-activity' },
            { icon: <MailIcon />, name: 'Email Templates', path: '/email-templates' },
            { icon: <AuditIcon />, name: 'Audit Trail', path: '/audit-logs' },
            { icon: <SettingsIcon />, name: 'Clinic Configuration', path: '/settings' },
        ],
    },
    {
        title: 'Identity',
        items: [{ icon: <UserIcon />, name: 'Admin Account', path: '/profile' }],
    },
];

const AdminSidebar = () => {
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
            className={`fixed flex flex-col top-0 px-5 pb-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 transition-all duration-300 ease-in-out z-50 border-r border-gray-200 overflow-hidden
                ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
                ${isMobileOpen ? 'translate-x-0 h-[calc(100vh-64px)] mt-16' : '-translate-x-full lg:translate-x-0 h-screen lg:mt-0'}
            `}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo */}
            <div className={`py-6 lg:py-8 flex w-full transition-all duration-300 pl-[13px]`}>
                <Link to='/' className="flex items-center min-h-[40px]">
                    <div className="flex items-center">
                        <span className="text-2xl font-black text-brand-500 font-outfit min-w-[24px] flex justify-center">S</span>
                        <span className={`sidebar-text-base text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-outfit ${isExpanded || isHovered || isMobileOpen ? 'opacity-100 max-w-[200px] visible' : 'opacity-0 max-w-0 invisible ml-0'}`}>
                            amson <span className='text-brand-500'>Dental</span>
                        </span>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <div className={`flex flex-col flex-1 min-h-0 duration-300 ease-linear sidebar-scroll-container ${isExpanded || isHovered || isMobileOpen ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden no-scrollbar'}`}>
                {navigationGroups.map((group, idx) => (
                    <nav key={group.title} className={idx === navigationGroups.length - 1 ? 'mb-2' : 'mb-6'}>
                        <div className='flex flex-col'>
                            <h2 className={`mb-4 text-[10px] font-black uppercase flex items-center leading-[20px] text-gray-400 pl-[13px] transition-all duration-300 tracking-widest`}>
                                <div className={`flex items-center transition-all duration-300 ${isExpanded || isHovered || isMobileOpen ? 'opacity-0 scale-50 w-0 overflow-hidden' : 'opacity-100 scale-100 w-[24px]'}`}>
                                    <HorizontalDots className='size-6' />
                                </div>
                                <span className={`sidebar-text-base ${isExpanded || isHovered || isMobileOpen ? 'opacity-100 max-w-[200px] visible' : 'opacity-0 max-w-0 invisible ml-0'}`}>
                                    {group.title}
                                </span>
                            </h2>
                            <ul className='flex flex-col gap-1'>
                                {group.items.map((nav) => (
                                    <li key={nav.name}>
                                        <Link
                                            to={nav.path}
                                            className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'}`}
                                        >
                                            <span className={`menu-item-icon-size shrink-0 ${isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}`}>
                                                {nav.icon}
                                            </span>
                                            <span className={`sidebar-text-base ${isExpanded || isHovered || isMobileOpen ? 'sidebar-text-expanded' : 'sidebar-text-collapsed'}`}>
                                                {nav.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>
                ))}
            </div>

            {/* Sidebar Footer */}
            <div className='mt-auto pt-4 border-t border-gray-100 dark:border-gray-800'>
                <ul className='flex flex-col gap-1'>
                    <li className='px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center'>
                        <span className={`${isExpanded || isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>v1.1.0</span>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default AdminSidebar;
