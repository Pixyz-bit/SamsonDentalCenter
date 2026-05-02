import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LocationHours = ({ variant = 'light' }) => {
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const isDark = variant === 'dark';

    // GSAP Animations
    useEffect(() => {
        let ctx = gsap.context(() => {
            // Use a single timeline for all section animations for better reliability
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%', // Trigger when section is 85% from top
                    once: true,
                },
            });

            // 1. Reveal Heading & Subtext
            tl.from('.location-reveal-text', {
                x: -30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out',
            });

            // 2. Reveal Cards (Availability, Location, Map)
            tl.from(
                '.location-card-anim',
                {
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power2.out',
                },
                '-=0.6',
            ); // Overlap with heading animation

            // Force a refresh after a short delay to account for layout shifts
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }, sectionRef.current);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className={`py-12 sm:py-20 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-50/50'}`}
        >
            {/* Minimal Background Decor */}
            <div
                className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03] -mr-48 -mt-48 pointer-events-none ${isDark ? 'bg-white' : 'bg-blue-600'}`}
            ></div>

            <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10'>
                {/* Standardized Header */}
                <div
                    ref={headingRef}
                    className='max-w-3xl mb-12 lg:mb-20'
                >
                    <div className='overflow-hidden mb-6 text-left'>
                        <div className='location-reveal-text flex items-center gap-3'>
                            <span className='h-px w-8 bg-blue-600'></span>
                            <span className='text-blue-500 font-bold uppercase tracking-widest text-[10px]'>
                                Direct Access
                            </span>
                        </div>
                    </div>
                    <h2
                        className={`text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                        <div className='overflow-hidden'>
                            <span className='block location-reveal-text'>Visit Our</span>
                        </div>
                        <div className='overflow-hidden'>
                            <span className='block text-slate-500 location-reveal-text'>
                                Clinic.
                            </span>
                        </div>
                    </h2>
                </div>

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch'>
                    {/* LEFT COLUMN: Clean Neutral Cards */}
                    <div className='lg:col-span-4 flex flex-col gap-6 lg:gap-8'>
                        {/* 1. Availability Card */}
                        <div className='location-card-anim'>
                            <div
                                className={`group p-8 lg:p-10 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}
                            >
                                <div className='flex items-center gap-4 mb-10'>
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        <svg
                                            className='w-5 h-5'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                            />
                                        </svg>
                                    </div>
                                    <h3
                                        className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                                    >
                                        Availability
                                    </h3>
                                </div>

                                <div className='space-y-5'>
                                    {[
                                        { d: 'Mon — Fri', t: '9:00 — 18:00', active: true },
                                        { d: 'Sat', t: '8:00 — 17:00' },
                                        { d: 'Sun', t: 'Appointment Only', accent: true },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className='flex justify-between items-center group/item'
                                        >
                                            <span
                                                className={`text-[13px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                                            >
                                                {item.d}
                                            </span>
                                            <div className='flex items-center gap-3'>
                                                <span
                                                    className={`text-[13px] font-bold ${item.accent ? 'text-blue-500 italic' : isDark ? 'text-white' : 'text-slate-800'}`}
                                                >
                                                    {item.t}
                                                </span>
                                                {item.active && (
                                                    <div className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse'></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Location Card */}
                        <div className='location-card-anim'>
                            <div
                                className={`group p-8 lg:p-10 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}
                            >
                                <div className='flex items-center gap-4 mb-8'>
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        <svg
                                            className='w-5 h-5'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                            />
                                        </svg>
                                    </div>
                                    <h3
                                        className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                                    >
                                        Placement
                                    </h3>
                                </div>

                                <p
                                    className={`text-2xl font-black leading-[1.2] mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                                >
                                    7 Himalayan Rd, <br />
                                    Tandang Sora, QC.
                                </p>
                                <p
                                    className={`text-[13px] font-medium leading-relaxed mb-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                                >
                                    Accessible via Commonwealth Ave. <br />
                                    Near major Metro Manila transit links.
                                </p>

                                <a
                                    href='https://maps.google.com/maps?q=7%20Himalayan%20Road,%20Tandang%20Sora,%20Quezon%20City'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className={`group/btn flex items-center justify-between w-full p-5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/20'}`}
                                >
                                    Initiate Directions
                                    <div
                                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-white/10' : 'bg-white/20'}`}
                                    >
                                        <svg
                                            className='w-4 h-4'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='3'
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Minimal Map Environment */}
                    <div className='lg:col-span-8 h-full min-h-[450px] lg:min-h-full location-card-anim'>
                        <div
                            className={`relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 group ${isDark ? 'border-white/5 shadow-blue-900/10' : 'border-white shadow-slate-200/60'}`}
                        >
                            {/* Repositioned Label Overlay (Doesn't obstruct search/controls) */}
                            <div
                                className={`absolute top-6 right-6 z-10 hidden sm:flex items-center gap-3 px-5 py-2.5 backdrop-blur-md rounded-2xl border shadow-xl transition-all duration-500 group-hover:translate-x-1 ${isDark ? 'bg-slate-900/90 border-white/10 shadow-black/50' : 'bg-white/95 border-slate-100 shadow-slate-200/50'}`}
                            >
                                <div className='flex flex-col text-right'>
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                    >
                                        Samson Dental
                                    </span>
                                    <span
                                        className={`text-[9px] font-bold uppercase tracking-widest opacity-40 ${isDark ? 'text-white' : 'text-slate-900'}`}
                                    >
                                        Official Clinical Site
                                    </span>
                                </div>
                                <div className='w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,1)] animate-pulse'></div>
                            </div>

                            <iframe
                                src='https://maps.google.com/maps?q=7%20Himalayan%20Road,%20Tandang%20Sora,%20Quezon%20City&t=&z=15&ie=UTF8&iwloc=&output=embed'
                                width='100%'
                                height='100%'
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading='lazy'
                                className={`absolute inset-0 w-full h-full grayscale-[15%] transition-all duration-1000 ease-in-out scale-100 hover:scale-[1.02] ${isDark ? 'opacity-80 invert contrast-[90%] brightness-[80%]' : ''}`}
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LocationHours;
