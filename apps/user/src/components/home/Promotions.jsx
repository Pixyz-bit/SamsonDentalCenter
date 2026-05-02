import { forwardRef, useRef, useState, useEffect } from 'react';
//import SectionHeading from '../common/SectionHeading';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BANNER_IMAGES = [
    { id: 1, src: '/banners/promo1.png', alt: 'Dental Promotion 1' },
    { id: 2, src: '/banners/promo2.png', alt: 'Dental Promotion 2' },
    { id: 3, src: '/banners/promo3.png', alt: 'Dental Promotion 3' },
];

const Promotions = forwardRef(({ variant = 'light' }, ref) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const headingRef = useRef(null);
    const bannerRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const isDark = variant === 'dark';

    // GSAP Animations
    useEffect(() => {
        let ctx = gsap.context(() => {
            // Heading masked reveal
            gsap.from('.promo-reveal-text', {
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

            // Banner showcase reveal
            gsap.from('.promo-banner-reveal', {
                y: 60,
                opacity: 0,
                duration: 1.2,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: bannerRef.current,
                    start: 'top 90%',
                    once: true,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const goToSlide = (index) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setActiveIndex(index);

        gsap.to(trackRef.current, {
            xPercent: -index * 100,
            duration: 1,
            ease: 'expo.inOut',
            onComplete: () => setIsAnimating(false),
        });
    };

    const nextSlide = () => {
        const next = (activeIndex + 1) % BANNER_IMAGES.length;
        goToSlide(next);
    };

    const prevSlide = () => {
        const prev = (activeIndex - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length;
        goToSlide(prev);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(interval);
    }, [activeIndex, isAnimating]);

    return (
        <section
            ref={sectionRef}
            className={`py-12 sm:py-16 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        >
            {/* Background Decor - Minimal */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div
                    className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] ${isDark ? 'bg-blue-600/10' : 'bg-blue-50/50'}`}
                ></div>
            </div>

            <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10'>
                {/* Header Row: Title & Navigation (Matched to HomeServices) */}
                <div
                    ref={headingRef}
                    className='flex flex-col lg:flex-row items-center lg:items-end justify-between mb-12 md:mb-16 gap-10'
                >
                    <div className='max-w-3xl text-center lg:text-left'>
                        <div className='overflow-hidden mb-6'>
                            <div className='promo-reveal-text flex items-center justify-center lg:justify-start gap-3'>
                                <span className='h-px w-8 bg-blue-600'></span>
                                <span className='text-blue-600 font-bold uppercase tracking-widest text-[10px]'>
                                    Special Perks
                                </span>
                            </div>
                        </div>
                        <h2
                            className={`text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                        >
                            <div className='overflow-hidden'>
                                <span className='block promo-reveal-text'>Exclusive</span>
                            </div>
                            <div className='overflow-hidden'>
                                <span className='block text-blue-600 promo-reveal-text'>
                                    Dental Offers.
                                </span>
                            </div>
                        </h2>
                    </div>

                    <div className='flex gap-2.5 justify-center lg:justify-end promo-banner-reveal'>
                        <button
                            onClick={prevSlide}
                            className={`w-10 h-10 rounded-xl border transition-all shadow-sm flex items-center justify-center ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-500/50 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white'}`}
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
                            onClick={nextSlide}
                            className={`w-10 h-10 rounded-xl border transition-all shadow-sm flex items-center justify-center ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-500/50 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-white'}`}
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

                {/* Ultra-Compact Banner Showcase */}
                <div
                    ref={bannerRef}
                    className='relative group promo-banner-reveal'
                >
                    <div
                        className={`relative overflow-hidden rounded-[2rem] shadow-lg border h-[180px] sm:h-[240px] md:h-[260px] lg:h-[280px] ${isDark ? 'border-white/5 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}
                    >
                        {/* Carousel Track */}
                        <div
                            ref={trackRef}
                            className='flex h-full w-full will-change-transform'
                            style={{ width: `${BANNER_IMAGES.length * 100}%` }}
                        >
                            {BANNER_IMAGES.map((banner) => (
                                <div
                                    key={banner.id}
                                    className='relative h-full w-full flex-shrink-0'
                                >
                                    <img
                                        src={banner.src}
                                        alt={banner.alt}
                                        className='absolute inset-0 w-full h-full object-cover'
                                    />
                                    <div
                                        className={`absolute inset-0 ${isDark ? 'bg-gradient-to-tr from-slate-900/40 to-transparent' : 'bg-gradient-to-tr from-slate-900/5 to-transparent'}`}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unified Progress Indicators - Centered under the banner */}
                    <div className='flex gap-3 mt-8 justify-center items-center'>
                        {BANNER_IMAGES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`relative h-1 rounded-full transition-all duration-500 overflow-hidden ${activeIndex === idx ? 'w-12 bg-blue-500/20' : `w-4 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}`}
                            >
                                {activeIndex === idx && (
                                    <div className='absolute inset-0 bg-blue-600 origin-left animate-[progress_6s_linear_infinite] shadow-[0_0_8px_rgba(37,99,235,0.3)]'></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `,
                }}
            />
        </section>
    );
});

Promotions.displayName = 'Promotions';
export default Promotions;
