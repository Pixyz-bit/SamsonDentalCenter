import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../common/SectionHeading';

gsap.registerPlugin(ScrollTrigger);

const BEFORE_AFTER_CASES = [
    {
        id: 1,
        title: 'Full Arch Restoration',
        type: 'All-on-4 Treatment',
        before: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=1200',
        after: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200',
    },
    {
        id: 2,
        title: 'Smile Makeover',
        type: 'Porcelain Veneers',
        before: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=1200',
        after: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200',
    },
    {
        id: 3,
        title: 'Dental Implants',
        type: 'Single Tooth Replacement',
        before: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&q=80&w=1200',
        after: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200',
    },
    {
        id: 4,
        title: 'Teeth Whitening',
        type: 'Professional Bleaching',
        before: 'https://images.unsplash.com/photo-1619451429733-285de0f595a2?auto=format&fit=crop&q=80&w=1200',
        after: 'https://images.unsplash.com/photo-1625398205254-c4a848359749?auto=format&fit=crop&q=80&w=1200',
    },
];

const BeforeAfterSlider = ({ before, after }) => {
    const containerRef = useRef(null);
    const handleRef = useRef(null);
    const beforeRef = useRef(null);
    const pulseRef = useRef(null);

    useEffect(() => {
        // Create QuickTo setters for smooth lag effect
        const xTo = gsap.quickTo(handleRef.current, 'left', { duration: 0.6, ease: 'power3.out' });

        // We use a custom object and onUpdate to animate the CSS clip-path smoothly
        const clipState = { val: 50 };
        const clipTo = gsap.quickTo(clipState, 'val', {
            duration: 0.6,
            ease: 'power3.out',
            onUpdate: () => {
                if (beforeRef.current) {
                    beforeRef.current.style.clipPath = `inset(0 ${100 - clipState.val}% 0 0)`;
                }
            },
        });

        const handleMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const relativeX = x - rect.left;
            const position = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));

            xTo(`${position}%`);
            clipTo(position);
        };

        const currentContainer = containerRef.current;
        currentContainer.addEventListener('mousemove', handleMove);
        currentContainer.addEventListener('touchmove', handleMove);

        // Interaction Feedback: Pulsing handle
        const pulse = gsap.to(pulseRef.current, {
            scale: 1.5,
            opacity: 0,
            duration: 1.8,
            repeat: -1,
            ease: 'power2.out',
        });

        return () => {
            currentContainer.removeEventListener('mousemove', handleMove);
            currentContainer.removeEventListener('touchmove', handleMove);
            pulse.kill();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className='relative w-full aspect-4/3 md:aspect-video rounded-2xl overflow-hidden cursor-ew-resize group shadow-sm border border-slate-200/80'
        >
            {/* After Image (Background) */}
            <img
                src={after}
                alt='After'
                className='absolute inset-0 w-full h-full object-cover'
            />

            {/* Before Image (Clip) */}
            <div
                ref={beforeRef}
                className='absolute inset-0 w-full h-full overflow-hidden'
                style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
                <img
                    src={before}
                    alt='Before'
                    className='absolute inset-0 w-full h-full object-cover'
                />
            </div>

            {/* Slider Handle */}
            <div
                ref={handleRef}
                className='absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none'
                style={{ left: '50%' }}
            >
                {/* Pulse feedback */}
                <div
                    ref={pulseRef}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500/40 rounded-full'
                ></div>

                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-200 z-10'>
                    <svg
                        className='w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2.5'
                            d='M8 7l-4 4m0 0l4 4m-4-4h16m-4-8l4 4m0 0l-4 4'
                        ></path>
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className='absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none'>
                Before
            </div>
            <div className='absolute top-4 right-4 bg-blue-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none'>
                After
            </div>
        </div>
    );
};

const Portfolio = ({ variant = 'light' }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const trackRef = useRef(null);
    const sectionRef = useRef(null);
    const headingRef = useRef(null);
    const gridRef = useRef(null);

    const isDark = variant === 'dark';

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Heading Masked Reveals
            gsap.from('.portfolio-reveal-text', {
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

            // Card Entrance Stagger
            gsap.from('.portfolio-card', {
                y: 50,
                opacity: 0,
                scale: 0.98,
                duration: 1.5,
                ease: 'expo.out',
                stagger: 0.15,
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 85%',
                    once: true,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const getVisibleSlidesCount = () => (window.innerWidth < 768 ? 1 : 3);

    const goToSlide = (index) => {
        const visibleSlides = getVisibleSlidesCount();
        const newIndex = Math.max(0, Math.min(index, BEFORE_AFTER_CASES.length - visibleSlides));

        setActiveIndex(newIndex);
        const gap = 24; // gap-6
        const percent = 100 / visibleSlides;

        gsap.to(trackRef.current, {
            xPercent: -newIndex * percent,
            x: -newIndex * gap,
            duration: 1.2,
            ease: 'expo.inOut',
        });
    };

    const handleNext = () => {
        goToSlide(activeIndex + 1);
    };

    const handlePrev = () => {
        goToSlide(activeIndex - 1);
    };

    const visibleSlides = getVisibleSlidesCount();
    const isPrevDisabled = activeIndex === 0;
    const isNextDisabled = activeIndex >= BEFORE_AFTER_CASES.length - visibleSlides;

    return (
        <section
            ref={sectionRef}
            className={`py-12 sm:py-16 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        >
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                <div
                    ref={headingRef}
                    className='flex flex-col lg:flex-row items-center lg:items-end justify-between mb-12 md:mb-16 gap-10'
                >
                    <div className='max-w-2xl text-center lg:text-left'>
                        <div className='overflow-hidden mb-6'>
                            <div className='portfolio-reveal-text flex items-center justify-center lg:justify-start gap-3 text-blue-600'>
                                <span className='h-px w-8 bg-current opacity-30'></span>
                                <span className='font-bold uppercase tracking-widest text-[10px]'>
                                    Transformation Gallery
                                </span>
                            </div>
                        </div>
                        <h2
                            className={`text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                        >
                            <div className='overflow-hidden'>
                                <span className='block portfolio-reveal-text'>Witness the</span>
                            </div>
                            <div className='overflow-hidden'>
                                <span className='block text-blue-600 portfolio-reveal-text'>
                                    Transformation.
                                </span>
                            </div>
                        </h2>
                    </div>

                    <div className='flex gap-3 justify-center lg:justify-end'>
                        <button
                            onClick={handlePrev}
                            disabled={isPrevDisabled}
                            className={`w-10 h-10 rounded-xl border transition-all shadow-sm active:translate-y-0 hover:-translate-y-0.5 flex items-center justify-center ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-500/50 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white'} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-inherit`}
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
                                    d='M15 19l-7-7 7-7'
                                />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled}
                            className={`w-10 h-10 rounded-xl border transition-all shadow-sm active:translate-y-0 hover:-translate-y-0.5 flex items-center justify-center ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-500/50 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white'} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-inherit`}
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
                                    d='M9 5l7 7-7 7'
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    ref={gridRef}
                    className='relative'
                >
                    <div className='overflow-hidden'>
                        <div
                            ref={trackRef}
                            className='flex gap-6 w-full shrink-0 items-start'
                        >
                            {BEFORE_AFTER_CASES.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className='w-full md:w-[calc(33.333%-16px)] shrink-0 portfolio-card'
                                >
                                    <div className='space-y-4'>
                                        <BeforeAfterSlider
                                            before={item.before}
                                            after={item.after}
                                        />
                                        <div className='px-1'>
                                            <h3 className='text-sm font-bold text-slate-900 uppercase tracking-tight'>
                                                {item.title}
                                            </h3>
                                            <p className='text-[10px] text-slate-500 font-bold uppercase tracking-widest'>
                                                {item.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className='flex gap-3 mt-10 justify-center items-center'>
                        {BEFORE_AFTER_CASES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`relative h-1 rounded-full transition-all duration-500 overflow-hidden ${activeIndex === idx ? 'w-12 bg-blue-500/20' : `w-4 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}`}
                            >
                                {activeIndex === idx && (
                                    <div className='absolute inset-0 bg-blue-600 origin-left shadow-[0_0_8px_rgba(37,99,235,0.3)]'></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Gradient Fades */}
                    <div
                        className={`absolute -left-4 top-0 bottom-0 w-24 bg-gradient-to-r pointer-events-none z-10 ${isDark ? 'from-slate-900' : 'from-white'}`}
                    ></div>
                    <div
                        className={`absolute -right-4 top-0 bottom-0 w-24 bg-gradient-to-l pointer-events-none z-10 ${isDark ? 'from-slate-900' : 'from-white'}`}
                    ></div>
                </div>
            </div>
        </section>
    );
};

export default Portfolio;
