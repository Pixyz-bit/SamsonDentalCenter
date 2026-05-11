import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEAM_MEMBERS = [
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

const TeamGrid = () => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);
    const scrollContainerRef = useRef(null);
    const [activeCard, setActiveCard] = useState(0);

    const handleScroll = (e) => {
        const container = e.currentTarget;
        if (!container) return;
        
        const scrollLeft = container.scrollLeft;
        const cardWidth = container.querySelector('.group')?.clientWidth || 310;
        const gapWidth = 24;
        const stepWidth = cardWidth + gapWidth;
        
        const newIndex = Math.round(scrollLeft / stepWidth);
        setActiveCard(Math.min(Math.max(newIndex, 0), TEAM_MEMBERS.length - 1));
    };

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

                    {/* Team grid / carousel */}
                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className='flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory no-scrollbar px-4 -mx-4 sm:px-0 sm:mx-0'
                    >
                        {TEAM_MEMBERS.map((doctor, index) => (
                            <div
                                key={doctor.id}
                                ref={(el) => (cardsRef.current[index] = el)}
                                className='group cursor-pointer flex-shrink-0 w-[270px] xs:w-[310px] sm:w-auto snap-center snap-always'
                            >
                                <div className='aspect-[4/4.5] rounded-2xl overflow-hidden mb-4 relative border border-stone-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-red-500/10 transition-all duration-500 ease-in-out'>
                                    <img
                                        src={doctor.image}
                                        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                                        alt={doctor.name}
                                        loading='lazy'
                                    />
                                    {/* Subtle overlay */}
                                    <div className='absolute inset-0 bg-stone-900/5 group-hover:bg-transparent transition-colors duration-500' />
                                </div>
                                <div className='px-2'>
                                    <h3 className='text-xl sm:text-2xl font-bold text-stone-900 mb-2 leading-tight group-hover:text-red-600 transition-colors duration-300 truncate'>
                                        {doctor.name}
                                    </h3>
                                    <div className='flex items-center gap-2'>
                                        <span className='h-px w-4 bg-red-600/30' />
                                        <p className='text-[10px] font-bold text-red-600 uppercase tracking-widest'>
                                            {doctor.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carousel Indicators for Mobile View */}
                    <div className="flex sm:hidden justify-center items-center gap-2 mt-8">
                        {TEAM_MEMBERS.map((_, dotIndex) => (
                            <div 
                                key={dotIndex} 
                                className={`transition-all duration-300 rounded-full ${
                                    activeCard === dotIndex 
                                        ? 'w-4 h-1.5 bg-red-600' 
                                        : 'w-1.5 h-1.5 bg-red-600/30'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default TeamGrid;
