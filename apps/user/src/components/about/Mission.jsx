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
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch'>
                    {/* Left: Image card with overlay content */}
                    <div ref={imageRef} className='lg:col-span-7'>
                        <div className='relative h-full overflow-hidden rounded-[2.5rem] bg-stone-900 shadow-xl min-h-[500px]'>
                            <img
                                src={image.src}
                                alt={image.alt}
                                className='absolute inset-0 h-full w-full object-cover'
                                loading='lazy'
                            />

                            {/* light dark overlay for readability (matches reference) */}
                            <div className='absolute inset-0 bg-stone-950/40' />

                            <div className='relative p-10 sm:p-14 flex flex-col h-full'>
                                <div className='grow'>
                                    <div className='flex items-center gap-3 mb-6'>
                                        <span className='h-px w-8 bg-red-400' />
                                        <span className='text-red-400 font-bold uppercase tracking-widest text-[10px]'>
                                            Our Services
                                        </span>
                                    </div>
                                    <h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1] max-w-lg'>
                                        From the way we interact with our patients to the care we
                                        provide.
                                    </h2>
                                    <p className='mt-6 text-base text-white/70 leading-relaxed max-w-md'>
                                        These values are the foundation of our practice, ensuring
                                        that each patient receives the best possible dental care in
                                        a welcoming environment.
                                    </p>
                                </div>

                                <div className='mt-8 shrink-0'>
                                    <button
                                        type='button'
                                        className='inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-stone-900 shadow-lg hover:bg-stone-50 transition-all duration-300'
                                    >
                                        Meet our team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Numbered value list (lg:col-span-5) */}
                    <div className='lg:col-span-5 flex flex-col justify-center'>
                        <div className='h-full rounded-[2.5rem] border border-stone-200/80 bg-white p-10 sm:p-12 shadow-sm ring-1 ring-stone-900/5'>
                            <div className='flex flex-col justify-center h-full'>
                                <h2 className='text-2xl font-bold tracking-tight text-stone-900 leading-[1.1] mb-10'>
                                    Our Core Values
                                </h2>
                                {values.map((item, idx) => (
                                    <div
                                        key={item.number}
                                        ref={(el) => (valuesRef.current[idx] = el)}
                                        className={idx !== 0 ? 'mt-10' : ''}
                                    >
                                        <div className='flex gap-5'>
                                            <div className='shrink-0 text-sm font-black text-red-600/40'>
                                                {item.number}
                                            </div>
                                            <div>
                                                <h3 className='text-lg font-bold tracking-tight text-stone-900'>
                                                    {item.title}
                                                </h3>
                                                <p className='mt-3 text-sm text-stone-600 leading-relaxed'>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                        {idx !== values.length - 1 && (
                                            <div className='mt-10 h-px w-full bg-stone-100' />
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
