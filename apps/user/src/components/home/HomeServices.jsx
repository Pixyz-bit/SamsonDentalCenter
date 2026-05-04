import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useServices from '../../hooks/useServices';

gsap.registerPlugin(ScrollTrigger);

const HomeServices = ({ variant = 'light' }) => {
    const navigate = useNavigate();
    const { services, loading } = useServices();
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const gridRef = useRef(null);
    const ctaRef = useRef(null);

    const isDark = false; // forced light mode

    // GSAP Animations
    useEffect(() => {
        // We only want to animate once the content has loaded
        if (loading) return;

        let ctx;
        const timer = setTimeout(() => {
            ctx = gsap.context(() => {
                // Animate Heading Elements staggered (Masked Reveal)
                gsap.from('.services-reveal-text', {
                    x: '-100%',
                    opacity: 0,
                    duration: 1.5,
                    stagger: 0.2,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: headingRef.current,
                        start: 'top 85%',
                        once: true,
                    },
                });

                // Animate grid cards in batches
                gsap.set('.gsap-card', { y: 40, opacity: 0, scale: 0.95 });
                ScrollTrigger.batch('.gsap-card', {
                    start: 'top 95%',
                    once: true,
                    onEnter: (batch) => {
                        gsap.to(batch, {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 0.7,
                            ease: 'power3.out',
                            stagger: 0.1,
                        });
                    },
                });

                // Animate list items individually sliding from left
                gsap.utils.toArray('.gsap-list-item').forEach((item) => {
                    gsap.from(item, {
                        x: -20,
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 95%',
                            once: true,
                        },
                    });
                });

                // Animate CTA banner
                if (ctaRef.current) {
                    gsap.from(ctaRef.current, {
                        y: 40,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: ctaRef.current,
                            start: 'top 95%',
                            once: true,
                        },
                    });
                }
            }, sectionRef);

            // Force ScrollTrigger to recalculate all trigger positions now that layout is stable
            ScrollTrigger.refresh();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (ctx) ctx.revert();
        };
    }, [loading]);

    // Mapping services to include images if they don't have them
    const serviceImages = [
        '/images/services/service-chair-close.jpg',
        '/images/services/service-chair-tree.jpg',
        '/images/services/service-chair-scenic.jpg',
        '/images/services/service-lab-work.jpg',
        '/images/services/service-exam.jpg',
    ];

    const gridItems = services.slice(0, 5).map((s, idx) => ({ ...s, image: serviceImages[idx] }));
    const listItems = services.slice(5);

    const getGridClasses = (index) => {
        switch (index) {
            case 0:
                return 'col-span-2 md:col-span-4 h-[300px] md:h-[450px]';
            default:
                return 'col-span-1 h-[280px] md:h-[420px]';
        }
    };

    return (
        <section
            ref={sectionRef}
            className={`py-10 sm:py-16 lg:py-20 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0B1120]' : 'bg-white'}`}
        >
            {/* Background Decor */}
            <div
                className={`absolute top-0 right-0 w-200 h-200 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-700 pointer-events-none ${isDark ? 'bg-white/5' : 'bg-red-600/5'}`}
            ></div>

            <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10'>
                <div
                    ref={headingRef}
                    className='max-w-3xl mb-12 md:mb-20'
                >
                    <div className='overflow-hidden mb-6'>
                        <div className='services-reveal-text flex items-center gap-3'>
                            <span
                                className={`h-px w-8 ${isDark ? 'bg-white/30' : 'bg-red-600'}`}
                            ></span>
                            <span
                                className={`${isDark ? 'text-stone-300' : 'text-red-500'} font-bold uppercase tracking-widest text-[10px]`}
                            >
                                Medical Services
                            </span>
                        </div>
                    </div>
                    <h2
                        className={`text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}
                    >
                        <div className='overflow-hidden'>
                            <span className='block services-reveal-text'>Clinical</span>
                        </div>
                        <div className='overflow-hidden'>
                            <span
                                className={`block services-reveal-text ${isDark ? 'text-stone-300/70' : 'text-red-500'}`}
                            >
                                Solutions.
                            </span>
                        </div>
                    </h2>
                </div>

                {loading ? (
                    <div className='text-center text-stone-400 py-20 flex flex-col items-center justify-center gap-4 min-h-[80vh]'>
                        <div className='w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-sm font-medium tracking-wide text-stone-500'>
                            Loading pharmaceutical & clinical options...
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Image Grid (01-05) */}
                        <div
                            ref={gridRef}
                            className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16'
                        >
                            {gridItems.map((service, idx) => (
                                <div
                                    key={service.id}
                                    onClick={() => navigate(`/services/${service.id}`)}
                                    className={`gsap-card group relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${getGridClasses(idx)} ${isDark ? 'border-white/5 hover:border-red-500/30 shadow-sm' : 'border-stone-100 bg-white shadow-md hover:shadow-xl hover:shadow-red-500/10'}`}
                                >
                                    <img
                                        src={service.image}
                                        className='absolute inset-0 w-full h-full object-cover grayscale-30 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105'
                                        alt={service.name}
                                    />

                                    {/* Subtler Overlays for Light Mode */}
                                    <div
                                        className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-stone-900/40 group-hover:bg-stone-900/20' : 'bg-stone-900/20 group-hover:bg-stone-900/10'}`}
                                    ></div>
                                    <div
                                        className={`absolute inset-0 bg-linear-to-t via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity ${isDark ? 'from-black' : 'from-stone-900/80'}`}
                                    ></div>

                                    <div
                                        className={`absolute top-6 left-6 font-bold text-[10px] tracking-widest transition-colors ${isDark ? 'text-white/50 group-hover:text-red-400' : 'text-white/70 group-hover:text-white'}`}
                                    >
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>

                                    <div
                                        className={`absolute top-5 right-5 w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center text-white transform transition-all duration-300 group-hover:bg-red-600 group-hover:border-red-500 group-hover:rotate-45 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/20 border-white/20'}`}
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
                                                strokeWidth='2.5'
                                                d='M5 19L19 5m0 0H8m11 0v11'
                                            ></path>
                                        </svg>
                                    </div>

                                    <div className='absolute bottom-6 left-6 pr-8'>
                                        <h3
                                            className={`font-bold text-white tracking-tight leading-[1.2] drop-shadow-sm ${idx === 0 ? 'text-2xl md:text-4xl max-w-lg' : 'text-lg md:text-2xl max-w-40'}`}
                                        >
                                            {service.name}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* List View (06+) */}
                        <div
                            className={`gsap-list-container border-t divide-y ${isDark ? 'border-white/5 divide-white/5' : 'border-stone-100 divide-stone-100'}`}
                        >
                            {listItems.map((service, idx) => {
                                const displayIndex = idx + 6;
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => navigate(`/services/${service.id}`)}
                                        className={`gsap-list-item group flex items-center justify-between py-10 md:py-14 px-4 hover:px-8 transition-all duration-500 cursor-pointer ${isDark ? 'hover:bg-white/2' : 'hover:bg-stone-50/70'}`}
                                    >
                                        <div className='flex items-center gap-8 md:gap-20'>
                                            <span
                                                className={`font-bold text-sm md:text-base transition-colors ${isDark ? 'text-white/30 group-hover:text-white/70' : 'text-stone-400 group-hover:text-red-500'}`}
                                            >
                                                {String(displayIndex).padStart(2, '0')}
                                            </span>
                                            <h3
                                                className={`text-xl md:text-4xl font-bold transition-colors tracking-tight ${isDark ? 'text-white/80 group-hover:text-white' : 'text-stone-800 group-hover:text-stone-900 group-hover:translate-x-1'}`}
                                            >
                                                {service.name}
                                            </h3>
                                        </div>

                                        <div
                                            className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border flex items-center justify-center transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 text-white/40 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20 group-hover:rotate-6' : 'bg-white border-stone-100 text-stone-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-500 shadow-sm group-hover:shadow-md'}`}
                                        >
                                            <svg
                                                className='w-6 h-6 md:w-7 md:h-7'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth='2.5'
                                                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* CTA Banner */}
                <div
                    ref={ctaRef}
                    className={`mt-24 flex flex-col md:flex-row items-center justify-between rounded-[2.5rem] border p-6 md:p-8 group relative overflow-hidden transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-stone-200 shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-red-500/10'}`}
                >
                    <div
                        className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'bg-linear-to-r from-white/5 to-transparent' : 'bg-linear-to-r from-stone-50 to-transparent'}`}
                    ></div>

                    <div className='flex flex-col md:flex-row items-center gap-8 px-4 text-center md:text-left relative z-10'>
                        <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-500 group-hover:scale-110 ${isDark ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-red-500/20'}`}
                        >
                            <svg
                                className='w-8 h-8'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                ></path>
                            </svg>
                        </div>
                        <div>
                            <p
                                className={`font-bold text-2xl md:text-3xl tracking-tight leading-tight ${isDark ? 'text-white' : 'text-stone-900'}`}
                            >
                                Start Your Journey Today
                            </p>
                            <p
                                className={`font-medium text-xs md:text-sm mt-2 uppercase tracking-[0.2em] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}
                            >
                                Book a comprehensive 3D scan and diagnostic
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/services')}
                        className={`relative z-10 w-full md:w-auto text-white font-bold py-5 px-14 rounded-2xl text-sm transition-all duration-300 hover:-translate-y-1 mt-6 md:mt-0 ${
                            isDark
                                ? 'bg-white/10 hover:bg-white/15 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50'
                                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40'
                        }`}
                    >
                        View All Services
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HomeServices;
