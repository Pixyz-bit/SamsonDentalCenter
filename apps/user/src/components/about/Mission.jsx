import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Mission = () => {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const valuesRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Animate image from left
        gsap.fromTo(
            imageRef.current,
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

        // Animate values from right with stagger
        gsap.fromTo(
            valuesRef.current.filter(Boolean),
            { opacity: 0, x: 50 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                stagger: 0.15,
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

    // Reference-inspired content (update anytime)
    const image = {
        src: '/images/about/mission-staff.jpg',
        alt: 'Dentist providing care to a patient',
    };

    const values = [
        {
            number: '01',
            title: 'Patient-centered care',
            description:
                'Our patients are at the heart of everything we do. We listen to your concerns, understand your needs, and create personalized treatment plans that prioritize your health and comfort.',
        },
        {
            number: '02',
            title: 'Excellence in dentistry',
            description:
                'Our team uses the latest technology and techniques to ensure you receive the most effective treatments for optimal results.',
        },
        {
            number: '03',
            title: 'Integrity and transparency',
            description:
                'We believe in honesty and transparency in all aspects of our practice. From clear communication about your treatment options to ethical business practices, we strive to build trust with our patients.',
        },
    ];

    return (
        <section ref={containerRef} className='py-10 sm:py-12 bg-white'>
            <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch'>
                    {/* Left: Image card with overlay content */}
                    <div ref={imageRef} className='lg:col-span-7'>
                        <div className='relative h-full overflow-hidden rounded-3xl bg-stone-900 shadow-xl'>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className='absolute inset-0 h-full w-full object-cover'
                                loading='lazy'
                            />

                            {/* light dark overlay for readability (matches reference) */}
                            <div className='absolute inset-0 bg-stone-950/50' />

                            <div className='relative p-8 sm:p-10 flex flex-col h-full min-h-[400px]'>
                                <div className='grow'>
                                    <p className='text-xs font-semibold tracking-widest text-white/90 uppercase'>
                                        Our Services
                                    </p>
                                    <h2 className='mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight max-w-md'>
                                        From the way we interact with our patients to the care we
                                        provide.
                                    </h2>
                                    <p className='mt-4 text-sm text-white/80 leading-relaxed max-w-md'>
                                        These values are the foundation of our practice, ensuring
                                        that each patient receives the best possible dental care in
                                        a welcoming environment.
                                    </p>
                                </div>

                                <div className='mt-6 shrink-0'>
                                    <button
                                        type='button'
                                        className='inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/70'
                                    >
                                        Meet our team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Numbered value list */}
                    <div className='lg:col-span-5'>
                        <div className='h-full rounded-3xl border border-stone-200/80 bg-white px-8 py-8 sm:px-9 sm:py-9 shadow-sm'>
                            <div className='flex flex-col justify-center h-full'>
                                {values.map((item, idx) => (
                                    <div
                                        key={item.number}
                                        ref={(el) => (valuesRef.current[idx] = el)}
                                        className={idx !== 0 ? 'mt-7' : ''}
                                    >
                                        <div className='text-xs font-semibold text-red-600'>
                                            {item.number}
                                        </div>
                                        <h3 className='mt-1.5 text-2xl font-semibold tracking-tight text-stone-900'>
                                            {item.title}
                                        </h3>
                                        <p className='mt-2 text-sm text-stone-600 leading-relaxed'>
                                            {item.description}
                                        </p>
                                        {idx !== values.length - 1 && (
                                            <div className='mt-7 h-px w-full bg-stone-200' />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Mission;
