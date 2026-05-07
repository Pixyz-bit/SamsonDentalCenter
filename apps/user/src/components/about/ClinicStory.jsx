import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClinicStory = () => {
    const containerRef = useRef(null);
    const leftContentRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Animate left content from left
        gsap.fromTo(
            leftContentRef.current,
            { opacity: 0, x: -50 },
            {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                    end: 'top 20%',
                    once: true,
                },
            }
        );

        // Animate image from right
        gsap.fromTo(
            imageRef.current,
            { opacity: 0, x: 50 },
            {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                    end: 'top 20%',
                    once: true,
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
    const image = {
        // Using a stable Unsplash image URL (direct link) to avoid loading issues.
        src: '/images/about/clinic-exterior.jpeg',
        alt: 'Modern dental clinic equipment and chair',
    };

    const tabs = [
        {
            label: 'Our Mission',
            title: 'Care that feels personal — and clinically precise.',
            body: 'At the heart of our practice are values that guide everything we do. We believe in delivering compassionate, patient-first care built on trust, transparency, and respect.',
        },
        {
            label: 'Our Vision',
            title: 'A future where every patient feels confident in their smile.',
            body: 'We’re building a modern dental experience that blends advanced technology with a calm, supportive environment — making great oral health accessible for every family we serve.',
        },
        {
            label: 'Our Value',
            title: 'Integrity, empathy, and excellence — every day.',
            body: 'We hold ourselves to global standards: honest guidance, evidence-based treatment, and a commitment to long-term outcomes, not quick fixes.',
        },
    ];

    // "Good enough" tab state without adding dependencies
    const [activeTab, setActiveTab] = React.useState(0);

    return (
        <section ref={containerRef} className='pt-16 lg:pt-24 pb-24 lg:pb-32 bg-white relative'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center'>
                    {/* Left: Headline + description + tabs + panel */}
                    <div ref={leftContentRef} className='order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center'>
                        <div className='flex items-center gap-3 mb-6'>
                            <span className='h-px w-8 bg-red-600' />
                            <span className='text-red-500 font-bold uppercase tracking-widest text-[10px]'>
                                Our Story
                            </span>
                        </div>
                        <h2 className='text-[clamp(2.25rem,5vw,3.5rem)] font-bold tracking-tight text-stone-900 leading-[1.1]'>
                            Dentistry that feels calm, clear, and genuinely premium.
                        </h2>
                        <p className='mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl'>
                            No pressure. No confusing jargon. Just a modern clinic, a friendly team,
                            and a simple plan that gets you to a healthier smile.
                        </p>

                        {/* Tabs */}
                        <div className='mt-10'>
                            <div className='flex flex-wrap gap-3'>
                                {tabs.map((t, idx) => {
                                    const isActive = idx === activeTab;
                                    return (
                                        <button
                                            key={t.label}
                                            type='button'
                                            onClick={() => setActiveTab(idx)}
                                            className={`rounded-full px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border focus:outline-none ${
                                                isActive
                                                    ? 'bg-stone-900 text-white border-stone-900 shadow-lg'
                                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab panel */}
                            <div className='mt-8 rounded-[2rem] border border-stone-200/70 bg-white p-8 sm:p-10 shadow-sm ring-1 ring-stone-900/5'>
                                <h3 className='text-xl sm:text-2xl font-bold tracking-tight text-stone-900'>
                                    {tabs[activeTab].title}
                                </h3>
                                <p className='mt-4 text-base text-stone-600 leading-relaxed'>
                                    {tabs[activeTab].body}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div ref={imageRef} className='order-1 lg:order-2 lg:col-span-5'>
                        <div className='relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-stone-900 ring-1 ring-stone-900/10 aspect-[4/5] max-h-[550px] w-full mx-auto'>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className='w-full h-full object-cover'
                                loading='lazy'
                            />
                            {/* Dark overlay filter for better aesthetic and readability */}
                            <div className='absolute inset-0 bg-stone-950/45' />

                            {/* Small caption chip to match site theme */}
                            <div className='absolute left-5 bottom-5 right-5'>
                                <div className='inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm font-semibold text-white shadow-sm'>
                                    <span className='h-2 w-2 rounded-full bg-red-400' />
                                    Elevated care, without the stress.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClinicStory;
