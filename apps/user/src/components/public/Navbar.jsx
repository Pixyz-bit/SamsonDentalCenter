import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Settings, Bell, Calendar } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../../context/AuthContext';
import PatientNotification from '../patient/PatientNotification';
import useClickOutside from '../../hooks/useClickOutside';

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    // { name: 'Inquiries', path: '/inquiries' },
    { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const navRef = useRef(null);
    const lastScrollY = useRef(0);
    const [isVisible, setIsVisible] = useState(true);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);

            // Smart Navbar: Hide on scroll down, show on scroll up
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            // Optimized scroll handling
            const isScrolled = currentScrollY > 20;
            if (isScrolled !== navRef.current.isScrolled) {
                navRef.current.isScrolled = isScrolled;
                if (isScrolled) {
                    gsap.to(navRef.current, {
                        backgroundColor: 'rgba(23, 27, 30, 1)',
                        backdropFilter: 'blur(12px)',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        duration: 0.4,
                        ease: 'power2.out',
                    });
                } else {
                    gsap.to(navRef.current, {
                        backgroundColor: 'rgba(23, 27, 30, 0)',
                        backdropFilter: 'blur(0px)',
                        paddingTop: '1.5rem',
                        paddingBottom: '1.5rem',
                        boxShadow: '0 0px 0px 0 rgba(0, 0, 0, 0)',
                        borderBottom: '1px solid transparent',
                        duration: 0.4,
                        ease: 'power2.out',
                    });
                }
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);

        // Initialize navbar state immediately
        const initialScrollY = window.scrollY;
        setScrollY(initialScrollY);
        const initialIsServiceDetail = location.pathname.startsWith('/services/') && location.pathname !== '/services';
        const initialScrolled = initialScrollY > 20 || initialIsServiceDetail;
        navRef.current.isScrolled = initialScrolled;

        gsap.set(navRef.current, initialScrolled ? {
            backgroundColor: 'rgba(23, 27, 30, 1)',
            backdropFilter: 'blur(12px)',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        } : {
            backgroundColor: 'rgba(23, 27, 30, 0)',
            backdropFilter: 'blur(0px)',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            boxShadow: '0 0px 0px 0 rgba(0, 0, 0, 0)',
            borderBottom: '1px solid transparent',
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.nav-anim', {
                y: -20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.1,
                clearProps: 'all',
            });
        }, navRef);

        return () => ctx.revert();
    }, [location.pathname]);

    // Smart Visibility Logic
    useEffect(() => {
        gsap.to(navRef.current, {
            y: isVisible ? 0 : -100,
            duration: 0.4,
            ease: 'power2.inOut',
        });
    }, [isVisible]);

    useClickOutside(profileRef, () => {
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    });

    const isServiceDetail = location.pathname.startsWith('/services/') && location.pathname !== '/services';
    const isScrolled = scrollY > 20 || isServiceDetail;

    return (
        <>
            <nav
                ref={navRef}
                className='fixed top-0 left-0 right-0 z-[80] flex items-center'
            >
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
                    <div className='flex items-center justify-between'>
                        {/* Section 1: Mobile Hamburger / Desktop Logo */}
                        <div className='flex items-center gap-4'>
                            {/* Mobile Menu Toggle (Left on mobile) */}
                            <button
                                className='lg:hidden flex items-center justify-center rounded-full transition-all duration-300 ring-1 h-[48px] w-[48px] bg-white/10 ring-white/20 hover:ring-white/30 backdrop-blur-md text-white'
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label='Toggle Mobile Menu'
                            >
                                {isMobileMenuOpen ? (
                                    <X size={24} />
                                ) : (
                                    <Menu size={24} />
                                )}
                            </button>

                            {/* Logo Container (Hidden on mobile, flex on desktop) */}
                            <Link
                                to='/'
                                className='hidden lg:flex items-center gap-3 transition-all duration-300 group flex-shrink-0 nav-anim'
                            >
                                <div className='w-8 flex-shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110'>
                                    <img src="/images/logo/samson-logo.png" alt="Samson Dental Logo" className="w-full h-auto" />
                                </div>
                                <div className='flex flex-col items-start justify-center flex-shrink-0'>
                                    <span className='font-black text-[22px] tracking-[-0.04em] leading-none text-white whitespace-nowrap'>
                                        SAMSON
                                    </span>
                                    <span className='text-[10px] uppercase tracking-[0.28em] font-bold mt-[1px] text-red-500 whitespace-nowrap drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'>
                                        Dental Center
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Section 2: Links (Desktop Only) */}
                        <div className='hidden lg:flex items-center justify-center'>
                            <ul
                                className='flex items-center justify-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 ring-1 h-[48px] bg-white/10 ring-white/20 hover:ring-white/30 backdrop-blur-md'
                            >
                                {navLinks.map((link, index) => (
                                    <li
                                        key={index}
                                        className='relative nav-anim'
                                    >
                                        <NavLink
                                            to={link.path}
                                            className={({ isActive }) =>
                                                `font-semibold text-[15px] sm:text-base transition-all duration-300 px-5 py-2 rounded-2xl ${isActive
                                                    ? 'bg-white/20 text-white shadow-sm'
                                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                                }`
                                            }
                                        >
                                            {link.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Section 3: Profile & Notifications */}
                        <div className='flex items-center gap-2 lg:gap-4'>
                            {user && (
                                <div className='nav-anim flex items-center'>
                                    <PatientNotification />
                                </div>
                            )}

                            <div
                                className='relative nav-anim'
                                ref={profileRef}
                            >
                                {loading ? (
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isScrolled ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/10 ring-1 ring-white/20'}`}>
                                        <span className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${isScrolled ? 'bg-white/20' : 'bg-white/20'} animate-pulse`}>
                                            <svg className={`w-5 h-5 animate-spin ${isScrolled ? 'text-white/70' : 'text-white/70'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </span>
                                        <svg
                                            className={`transition-transform duration-200 flex-shrink-0 opacity-50 ${isScrolled ? 'text-white/50' : 'text-white/50'}`}
                                            width='18'
                                            height='20'
                                            viewBox='0 0 18 20'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path d='M4.3125 8.65625L9 13.3437L13.6875 8.65625' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                                        </svg>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            className='flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 h-[48px] bg-white/10 ring-1 ring-white/20 hover:ring-white/30 hover:bg-white/20 backdrop-blur-md'
                                            title={user ? (user.first_name ? `${user.last_name}, ${user.first_name}` : user.email) : 'Guest Menu'}
                                        >
                                            <span
                                                className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${user
                                                    ? 'bg-gradient-to-br from-brand-400 to-brand-600'
                                                    : isScrolled
                                                        ? 'bg-stone-400'
                                                        : 'bg-white/20'
                                                    }`}
                                            >
                                                {user ? (
                                                    user.avatar_url ? (
                                                        <img 
                                                            src={user.avatar_url} 
                                                            alt={user.first_name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        user.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase() : (user.email?.charAt(0).toUpperCase() || 'U')
                                                    )
                                                ) : (
                                                    <svg
                                                        className='w-5 h-5'
                                                        viewBox='0 0 24 24'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        strokeWidth='2.5'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    >
                                                        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                                                        <circle
                                                            cx='12'
                                                            cy='7'
                                                            r='4'
                                                        />
                                                    </svg>
                                                )}
                                            </span>
                                            <svg
                                                className={`transition-transform duration-200 flex-shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''
                                                    } text-white/70`}
                                                width='18'
                                                height='20'
                                                viewBox='0 0 18 20'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M4.3125 8.65625L9 13.3437L13.6875 8.65625'
                                                    stroke='currentColor'
                                                    strokeWidth='1.5'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </button>
        
                                        {isProfileMenuOpen && (
                                            <div className='absolute right-0 mt-3 w-[280px] rounded-3xl shadow-2xl z-50 p-4 border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200'>
                                                <div className='px-4 py-3 mb-3 bg-gray-50 dark:bg-white/5 rounded-2xl'>
                                                    <p className='truncate text-[15px] font-black text-gray-900 dark:text-white leading-tight'>
                                                        {user ? (user.first_name ? `${user.last_name}, ${user.first_name}` : 'Authorized User') : 'Guest User'}
                                                    </p>
                                                    <span className='mt-1 block text-xs truncate text-gray-500 dark:text-gray-400 font-medium'>
                                                        {user ? user.email : 'Welcome to Primera Dental'}
                                                    </span>
                                                </div>
        
                                                {!user ? (
                                                    <div className='grid grid-cols-1 gap-1 pt-2 border-t border-gray-100'>
                                                        <Link
                                                            to='/login'
                                                            state={{ from: location.pathname }}
                                                            className='flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-[14px] transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                        >
                                                            <LogOut
                                                                size={18}
                                                                className='text-gray-400'
                                                            />
                                                            Sign In
                                                        </Link>
                                                        <Link
                                                            to='/register'
                                                            className='flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-[14px] transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                        >
                                                            <Settings
                                                                size={18}
                                                                className='text-gray-400'
                                                            />
                                                            Sign Up
                                                        </Link>
                                                        <Link
                                                            to='/book'
                                                            className='flex items-center justify-center gap-3 px-4 py-3.5 mt-2 font-black rounded-xl text-sm transition-all bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 active:scale-95'
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                        >
                                                            Book as a Guest
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ul className='flex flex-col gap-1 pt-2 pb-2 border-t border-b border-gray-100'>
                                                            <li>
                                                                <Link
                                                                    to='/patient'
                                                                    className='flex items-center gap-3 px-3 py-2 font-medium rounded-lg group text-sm transition-colors text-gray-700 hover:bg-gray-100'
                                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                                >
                                                                    <Settings size={18} />
                                                                    Dashboard
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link
                                                                    to='/book'
                                                                    className='flex items-center gap-3 px-3 py-2 mt-1 font-medium rounded-lg text-sm transition-colors bg-red-600 text-white hover:bg-red-700'
                                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                                >
                                                                    <Calendar size={18} className='text-white/80' />
                                                                    Book Appointment
                                                                </Link>
                                                            </li>
                                                            {/* <li>
                                                            <Link
                                                                to='/patient/profile'
                                                                className='flex items-center gap-3 px-3 py-2 font-medium rounded-lg group text-sm transition-colors text-gray-700 hover:bg-gray-100'
                                                                onClick={() => setIsProfileMenuOpen(false)}
                                                            >
                                                                Edit Profile
                                                            </Link>
                                                        </li> */}
                                                        </ul>
                                                        <button
                                                            onClick={() => {
                                                                logout();
                                                                setIsProfileMenuOpen(false);
                                                                navigate('/');
                                                            }}
                                                            className='w-full text-left px-3 py-2 mt-2 text-sm flex items-center gap-3 rounded-lg transition-colors font-medium border border-transparent text-red-600 hover:bg-red-50 hover:border-red-100'
                                                        >
                                                            <LogOut size={18} />
                                                            Logout
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 w-[280px] sm:w-80 h-[100dvh] bg-white shadow-2xl z-[1001] transform transition-transform duration-500 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header: Logo */}
                <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
                    <Link
                        to='/'
                        className='flex items-center space-x-3 group'
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className='w-9 flex items-center justify-center transition-transform duration-500 group-hover:scale-110'>
                            <img src="/images/logo/samson-logo.png" alt="Samson Dental Logo" className="w-full h-auto" />
                        </div>
                        <div className='flex flex-col items-start justify-center'>
                            <span className='font-black text-[20px] tracking-[-0.04em] text-stone-800 uppercase leading-none'>
                                SAMSON
                            </span>
                            <span className='text-[9px] uppercase tracking-[0.28em] mt-[2px] font-bold text-red-600'>
                                Dental Center
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className='flex flex-col h-[calc(100vh-88px)] justify-between overflow-y-auto no-scrollbar'>
                    {/* Navigation Links */}
                    <div className='px-4 py-6'>
                        <h3 className='px-4 text-[10px] uppercase font-bold tracking-[0.15em] text-stone-400 mb-4'>
                            Menu
                        </h3>
                        <ul className='space-y-1'>
                            {navLinks.map((link, index) => (
                                <li key={index}>
                                    <NavLink
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${isActive
                                                ? 'bg-red-600 text-white shadow-md shadow-red-100 border border-red-600'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-red-600 border border-transparent'
                                            }`
                                        }
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sidebar Footer: Profile/Guest Actions */}
                    <div className='p-6 pb-12 border-t border-gray-100 bg-stone-50/50'>
                        {loading ? (
                            <div className='flex items-center justify-center py-4'>
                                <svg className="w-8 h-8 animate-spin text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : !user ? (
                            <div className='grid grid-cols-1 gap-3'>
                                <Link
                                    to='/login'
                                    state={{ from: location.pathname }}
                                    className='flex items-center justify-center gap-2 w-full py-2.5 font-semibold text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to='/book'
                                    className='flex items-center justify-center gap-2 w-full py-2.5 font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md shadow-red-100 transition-colors'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Book as a Guest
                                </Link>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='flex items-center gap-3 px-2'>
                                    <div className='flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 text-base font-bold text-white ring-2 ring-white dark:ring-gray-900 shrink-0'>
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.first_name} className="w-full h-full object-cover" />
                                        ) : (
                                            user?.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')
                                        )}
                                    </div>
                                    <div className='flex flex-col min-w-0'>
                                        <span className='font-bold text-sm text-stone-800 truncate'>
                                            {user.first_name ? `${user.first_name} ${user.last_name}` : 'Authorized User'}
                                        </span>
                                        <span className='text-xs text-stone-500 truncate'>
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 gap-2'>
                                    <Link
                                        to='/patient'
                                        className='flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-stone-100'
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Settings size={18} />
                                        Dashboard
                                    </Link>
                                    <Link
                                        to='/patient/notifications'
                                        className='flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-stone-100'
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Bell size={18} />
                                        Notifications
                                    </Link>
                                    <Link
                                        to='/book'
                                        className='flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md shadow-red-100 transition-colors'
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Calendar size={18} />
                                        Book Appointment
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                            navigate('/');
                                        }}
                                        className='flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors'
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
