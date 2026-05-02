import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { settings, loading } = useClinicSettings();
    const heroRef = useRef(null);
    const bgRef = useRef(null);
    const contentRef = useRef(null);

    // Helper to split text into spans for per-letter animation
    const splitText = (text, className = 'hero-letter', extraClasses = '') => {
        if (!text) return null;
        return text.split('').map((char, i) => (
            <span
                key={i}
                className={`${className} ${extraClasses} inline-block will-change-transform`}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    useEffect(() => {
        if (loading || !settings) return;

        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                delay: 0.7,
                defaults: { ease: 'expo.out', duration: 1.4 },
            });

            // Line 1: Letter animation (Rising out of mask)
            tl.from('.hero-letter-1', {
                y: '110%',
                opacity: 0,
                stagger: 0.02,
                force3D: true,
            });

            // Line 2: Letter animation (Rising out of mask)
            tl.from(
                '.hero-letter-2',
                {
                    y: '110%',
                    opacity: 0,
                    stagger: 0.02,
                    force3D: true,
                },
                '-=1.1',
            );

            // Initial load animation for subtext, buttons, etc.
            tl.from(
                '.hero-anim',
                {
                    y: 30,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.1,
                    clearProps: 'all',
                },
                '-=1',
            );

            // Parallax effect with smoothing (scrub: 1.5) and hardware acceleration
            gsap.to(bgRef.current, {
                y: '20%',
                ease: 'none',
                force3D: true,
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5, // Smooth "catch-up" lag
                },
            });

            // Smooth fade out of content while scrolling down
            gsap.to(contentRef.current, {
                opacity: 0,
                y: -100,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'center top',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }, heroRef);

        return () => ctx.revert();
    }, [loading, settings]);

    if (loading) return <div className="min-h-svh bg-slate-950 animate-pulse" />;

    return (
        <section
            ref={heroRef}
            className='relative min-h-svh flex items-center overflow-hidden bg-slate-950'
        >
            {/* Background with overlay */}
            <div
                ref={bgRef}
                className='absolute inset-0 z-0 h-[125%] -top-[10%]'
            >
                <img
                    src='/images/home/hero-bg.jpg'
                    alt='Dental Office'
                    className='w-full h-full object-cover object-center'
                />
                <div className='absolute inset-0 bg-black/20 backdrop-blur-[1px]' />
                <div className='absolute inset-0 bg-linear-to-r from-slate-900/40 via-slate-900/10 to-transparent' />
            </div>

            <div
                ref={contentRef}
                className='relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-between items-center'
            >
                <div className='max-w-3xl flex flex-col items-start gap-6 sm:gap-8 pt-32 pb-24 sm:pt-40 lg:pt-48 lg:pb-40'>
                    {/* Headline - fluid typography taking full advantage of clamp */}
                    <h1 className='text-[clamp(2rem,5vw+1rem,4rem)] font-extrabold tracking-tight text-white leading-[1.05]'>
                        <span className='block overflow-hidden pb-1'>
                            {splitText('Unlock a World of', 'hero-letter-1')}
                        </span>
                        <span className='block overflow-hidden pb-2'>
                            {splitText(
                                'Radiant Smiles.',
                                'hero-letter-2',
                                'text-white drop-shadow-md',
                            )}
                        </span>
                    </h1>

                    {/* Subheading - fluid typography */}
                    <p className='hero-anim text-[clamp(0.875rem,1.5vw+0.25rem,1.125rem)] text-slate-300 leading-relaxed max-w-2xl font-medium'>
                        Exceptional Dental Care Powered by Expertise, Innovation and Advanced Technology. Trusted by companies and individuals for over 60 years.
                    </p>

                    <div className='hero-anim flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2'>
                        <button
                            onClick={() => navigate(user ? '/patient/book' : '/book')}
                            className='group inline-flex items-center justify-center px-6 py-3 text-[clamp(0.875rem,1vw+0.25rem,1rem)] font-bold text-white transition-all duration-300 ease-out bg-red-700/80 backdrop-blur-md rounded-2xl border border-red-500/30 hover:bg-red-600/90 hover:shadow-[0_8px_30px_rgba(220,38,38,0.25)] hover:-translate-y-1 w-full sm:w-auto'
                        >
                            Make an Appointment
                            <svg
                                className='w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => navigate('/services')}
                            className='inline-flex items-center justify-center px-6 py-3 text-[clamp(0.875rem,1vw+0.25rem,1rem)] font-bold transition-all duration-300 ease-out bg-slate-800/40 backdrop-blur-md border-[1.5px] border-white/10 text-slate-200 rounded-2xl hover:bg-slate-700/50 hover:border-white/20 hover:text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] focus:outline-none w-full sm:w-auto hover:-translate-y-1'
                        >
                            Explore Services
                        </button>
                    </div>

                    {/* Social Proof */}
                    <div className='hero-anim flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5 w-full max-w-xl'>
                        <div className='flex -space-x-3'>
                            {[
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
                                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
                            ].map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    className='w-12 h-12 rounded-full border-[3px] border-slate-900 object-cover shadow-sm ring-1 ring-white/10 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:z-10 hover:shadow-md hover:scale-110 relative grayscale-[20%]'
                                    alt='Reviewer'
                                />
                            ))}
                        </div>
                        <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-1 text-red-500/80'>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <svg
                                        key={s}
                                        className='w-5 h-5 fill-current drop-shadow-sm'
                                        viewBox='0 0 20 20'
                                    >
                                        <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
                                    </svg>
                                ))}
                            </div>
                            <p className='text-[clamp(0.75rem,1vw+0.25rem,0.875rem)] text-slate-400 font-medium'>
                                Trusted by <span className='font-bold text-white'>2,000+</span>{' '}
                                Happy Patients
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Doctor Image - Transparent background - Moved outside contentRef to remove parallax */}
            <div className='hidden lg:flex w-[45%] absolute bottom-0 right-0 xl:right-[5%] h-[90%] z-10 hero-anim pointer-events-none items-end justify-center'>
                {/* Doctor Image */}
                <img
                    src='https://pngimg.com/uploads/doctor/doctor_PNG15988.png'
                    alt='Professional Dentist'
                    className='w-auto h-[95%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative z-10'
                />
            </div>

            {/* Wave Divider at bottom */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 h-[150px] pointer-events-none">
                {/* Layer 1 (Back wave, starts very high on left, wavy) */}
                <svg className="absolute bottom-0 left-0 block w-[calc(100%+1.3px)] h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 1440 320">
                    <path fill="currentColor" className="text-white dark:text-slate-950" d="M0,40 C180,140 360,0 540,100 C720,200 900,60 1080,140 C1260,220 1350,60 1440,40 L1440,320 L0,320 Z"></path>
                </svg>
                {/* Layer 2 (Middle wave, criss-crosses, wavy) */}
                <svg className="absolute bottom-0 left-0 block w-[calc(100%+1.3px)] h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 1440 320">
                    <path fill="currentColor" className="text-white dark:text-slate-950" d="M0,90 C200,190 400,30 600,130 C800,230 1000,90 1200,170 C1300,210 1400,130 1440,90 L1440,320 L0,320 Z"></path>
                </svg>
                {/* Layer 3 (Front solid wave, thicker overall, wavy, swoops high on right) */}
                <svg className="absolute bottom-0 left-0 block w-[calc(100%+1.3px)] h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                    <path fill="currentColor" className="text-white dark:text-slate-950" d="M0,160 C180,260 360,60 540,160 C720,260 900,100 1080,200 C1260,300 1350,120 1440,60 L1440,320 L0,320 Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default Hero;
