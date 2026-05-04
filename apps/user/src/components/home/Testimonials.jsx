import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../common/SectionHeading';

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
    {
        id: 1,
        name: 'Marieme',
        date: '2024-05-15',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        text: "10/10 would recommend. I've never met a doctor who cares about patients as much as this clinic takes care of its patients. The attention to detail is unmatched.",
        source: 'google',
    },
    {
        id: 2,
        name: 'Alexandria Sadang',
        date: '2023-10-02',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        text: "Samson Dental Center has been my family's go to Dental Clinic ever since we found them on Facebook. It's definitely the best decision we made for our oral health.",
        source: 'google',
    },
    {
        id: 3,
        name: 'Sarah Jenkins',
        date: '2023-11-20',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        text: "Absolutely professional and clean environment. The staff made me feel very welcome and the procedure was completely painless. I'm actually looking forward to my next visit.",
        source: 'google',
    },
    {
        id: 4,
        name: 'Michael Chen',
        date: '2024-01-10',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        text: 'Best dental experience I have had. Dr. Rivera is precise and very calming. Highly recommended for nervous patients who need extra care.',
        source: 'google',
    },
];

const Testimonials = ({ variant = 'light' }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const headingRef = useRef(null);
    const isDark = false; // forced light mode

    // GSAP Animations
    useEffect(() => {
        let ctx = gsap.context(() => {
            // Heading masked reveal
            gsap.from('.testimonial-reveal-text', {
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

            // Navigation and cards stagger
            gsap.from('.testimonial-reveal-items', {
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    once: true,
                },
            });

            // Animate the cards themselves on scroll reveal
            gsap.from('.testimonial-card', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: trackRef.current, // Trigger when the card container is visible
                    start: 'top 85%',
                    once: true,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const getVisibleSlidesCount = () => (window.innerWidth < 1024 ? 1 : 2);

    const goToSlide = (index) => {
        const visibleSlides = getVisibleSlidesCount();
        // Ensure index is within bounds
        const newIndex = Math.max(0, Math.min(index, REVIEWS.length - visibleSlides));

        setActiveIndex(newIndex);
        const gap = window.innerWidth < 768 ? 24 : 32;
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
    const isNextDisabled = activeIndex >= REVIEWS.length - visibleSlides;

    return (
        <section
            ref={sectionRef}
            className={`py-12 sm:py-16 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-red-950 text-white' : 'bg-white text-stone-900'}`}
        >
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col lg:flex-row items-center gap-8 lg:gap-16'>
                    {/* Left Side: Heading */}
                    <div
                        ref={headingRef}
                        className='lg:w-1/3 text-center lg:text-left'
                    >
                        <div className='overflow-hidden mb-4'>
                            <div className='testimonial-reveal-text flex items-center justify-center lg:justify-start gap-3'>
                                <span className='h-px w-8 bg-red-400'></span>
                                <span className='text-red-400 font-bold uppercase tracking-widest text-[10px]'>
                                    Testimonials
                                </span>
                            </div>
                        </div>
                        <h2
                            className={`text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight mb-8 ${isDark ? 'text-white' : 'text-stone-900'}`}
                        >
                            <div className='overflow-hidden'>
                                <span className='block testimonial-reveal-text'>What makes</span>
                            </div>
                            <div className='overflow-hidden'>
                                <span className='block text-red-400 testimonial-reveal-text'>
                                    us smile.
                                </span>
                            </div>
                        </h2>
                        <div className='mt-8 flex justify-center lg:justify-start gap-3 testimonial-reveal-items'>
                            <button
                                onClick={handlePrev}
                                disabled={isPrevDisabled}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:translate-y-0 hover:-translate-y-0.5 group border ${
                                    isDark
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-red-600 hover:border-red-500'
                                        : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-red-600 hover:text-white hover:border-red-600'
                                } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-inherit`}
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
                                    ></path>
                                </svg>
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:translate-y-0 hover:-translate-y-0.5 group border ${
                                    isDark
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-red-600 hover:border-red-500'
                                        : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-red-600 hover:text-white hover:border-red-600'
                                } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-inherit`}
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
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Reviews Carousel */}
                    <div className='lg:w-2/3 w-full relative'>
                        <div className='overflow-hidden'>
                            <div
                                ref={trackRef}
                                className='flex gap-6 md:gap-8'
                            >
                                {REVIEWS.map((review, idx) => (
                                    <div
                                        key={`${review.id}-${idx}`}
                                        className='w-full lg:w-[calc(50%-16px)] shrink-0 testimonial-card' // Added 'testimonial-card' class
                                    >
                                        <div
                                            className={`rounded-2xl p-8 shadow-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col relative border ${isDark ? 'bg-stone-800/50 border-white/5' : 'bg-stone-50 border-stone-200/80'}`}
                                        >
                                            {/* Google Logo */}
                                            <div className='absolute top-8 right-8 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all'>
                                                <svg
                                                    className='w-6 h-6'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                                        fill='#4285F4'
                                                    />
                                                    <path
                                                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                                        fill='#34A853'
                                                    />
                                                    <path
                                                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z'
                                                        fill='#FBBC05'
                                                    />
                                                    <path
                                                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                                        fill='#EA4335'
                                                    />
                                                </svg>
                                            </div>

                                            {/* Header */}
                                            <div className='flex items-center gap-4 mb-6'>
                                                <img
                                                    src={review.avatar}
                                                    alt={review.name}
                                                    className='w-14 h-14 rounded-full object-cover ring-2 ring-white/10 shadow-sm'
                                                />
                                                <div>
                                                    <h4
                                                        className={`font-bold text-base leading-tight ${
                                                            isDark ? 'text-white' : 'text-stone-900'
                                                        }`}
                                                    >
                                                        {review.name}
                                                    </h4>
                                                    <p className='text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1'>
                                                        {review.date}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stars */}
                                            <div className='flex items-center gap-2 mb-6'>
                                                <div className='flex text-amber-500 gap-0.5'>
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className='w-4 h-4 fill-current'
                                                            viewBox='0 0 20 20'
                                                        >
                                                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <div className='w-1 h-1 bg-stone-200/20 rounded-full'></div>
                                                <svg
                                                    className='w-4 h-4 text-red-500'
                                                    viewBox='0 0 24 24'
                                                    fill='currentColor'
                                                >
                                                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                                                </svg>
                                            </div>

                                            {/* Content */}
                                            <p
                                                className={`text-sm leading-[1.5] mb-6 grow font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
                                            >
                                                &ldquo;{review.text}&rdquo;
                                            </p>

                                            <div className='pt-4 border-t border-stone-200/10'>
                                                <button className='text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors'>
                                                    Read Full Review
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Indicators */}
                        <div className='flex gap-3 mt-10 justify-center items-center'>
                            {REVIEWS.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className={`relative h-1 rounded-full transition-all duration-500 overflow-hidden ${activeIndex === idx ? 'w-12 bg-red-500/20' : `w-4 ${isDark ? 'bg-white/10' : 'bg-stone-100'}`}`}
                                >
                                    {activeIndex === idx && (
                                        <div className='absolute inset-0 bg-red-600 origin-left shadow-[0_0_8px_rgba(37,99,235,0.3)]'></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
