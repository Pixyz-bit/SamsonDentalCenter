import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TeamGrid = () => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const cards = cardsRef.current.filter(Boolean);
        if (!cards.length) return;

        // Ensure cards are visible initially
        gsap.set(cards, { opacity: 1 });

        // Staggered animation triggered on scroll into viewport
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 80%',
                end: 'top 20%',
                once: true,
            },
        });

        tl.fromTo(
            cards,
            {
                opacity: 0,
                y: 50,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power2.out',
            }
        );

        // Hover animations
        cards.forEach((card) => {
            const img = card.querySelector('img');
            
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    y: -10,
                    duration: 0.3,
                    ease: 'power2.out',
                });
                if (img) {
                    gsap.to(img, {
                        scale: 1.05,
                        duration: 0.5,
                        ease: 'power2.out',
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                });
                if (img) {
                    gsap.to(img, {
                        scale: 1,
                        duration: 0.5,
                        ease: 'power2.out',
                    });
                }
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    // Original 4 doctors
    const team = [
        {
            id: 1,
            name: 'Dr. Mae Angelica Garcellano',
            role: 'Lead Dentist',
            image: '/images/about/team-dr-samson.jpg',
        },
        {
            id: 2,
            name: 'Dr Maria Cheyenne Deniece Marasigan',
            role: 'Dentist',
            image: '/images/about/team-staff.jpg',
        },
        {
            id: 3,
            name: 'Dr. Sarah Samson',
            role: 'Dentist',
            image: '/images/about/team-technicians.jpg',
        },
        {
            id: 4,
            name: 'Dr. Silvestre Samson',
            role: 'Dental Hygienist',
            image: '/images/about/team-founders.jpg',
        },
    ];

    return (
        <>
            <section ref={containerRef} className='bg-white py-10 md:py-20 relative'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
                    <div className='mb-12'>
                        <div className='text-center max-w-2xl mx-auto'>
                            <h2 className='text-3xl md:text-4xl font-brand font-black text-stone-900 mb-4'>Our Dedicated Team</h2>
                            <p className='text-stone-600'>
                                Behind every smile is a team of passionate professionals dedicated to your comfort and care.
                            </p>
                        </div>
                    </div>

                    {/* Team grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {team.map((doctor, index) => (
                            <div
                                key={doctor.id}
                                ref={(el) => (cardsRef.current[index] = el)}
                                className='group cursor-pointer transition-all duration-300'
                            >
                                <div className='aspect-[3/4] rounded-[2rem] overflow-hidden mb-6 relative border border-stone-200 group-hover:border-red-500 group-hover:shadow-xl group-hover:shadow-red-500/10 transition-all duration-300'>
                                    <img
                                        src={doctor.image}
                                        className='w-full h-full object-cover'
                                        alt={doctor.name}
                                        loading='lazy'
                                    />
                                </div>
                                <h3 className='text-lg font-brand font-bold text-stone-900 mb-1 group-hover:text-red-600 transition-colors duration-300'>{doctor.name}</h3>
                                <p className='text-sm font-bold text-red-600 uppercase tracking-widest group-hover:text-red-500 transition-colors duration-300'>{doctor.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default TeamGrid;
