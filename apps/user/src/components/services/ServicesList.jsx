import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SERVICES = [
  // GENERAL
  {
    title: 'Complex diagnostics',
    category: 'General',
    desc: 'Advanced imaging and diagnostic procedures for precise treatment planning.',
    image: '/images/services/gallery-consultation.jpg',
  },
  {
    title: 'Professional hygiene',
    category: 'General',
    desc: 'Deep cleaning and preventative care to maintain long-term oral health.',
    image: '/images/services/service-chair-close.jpg',
  },
  {
    title: 'Sedation and anaesthesia',
    category: 'General',
    desc: 'Comfortable treatments with advanced sedation options.',
    image: '/images/services/service-exam.jpg',
  },
  {
    title: 'Simple extraction',
    category: 'General',
    desc: 'Safe and painless removal of problematic teeth.',
    image: '/images/services/gallery-chairs-row.jpg',
  },
  {
    title: 'Teeth whitening',
    category: 'General',
    desc: 'Professional brightening for a radiant smile.',
    image: '/images/services/gallery-chair-red.jpg',
  },
  {
    title: 'Therapy',
    category: 'General',
    desc: 'General restorative treatments to bring back your smile.',
    image: '/images/services/gallery-equipment.jpg',
  },
  {
    title: 'Orthodontics',
    category: 'General',
    desc: 'Clear aligners and traditional braces for a perfectly straight smile.',
    image: '/images/services/service-chair-scenic.jpg',
  },
  {
    title: 'Periodontal care',
    category: 'General',
    desc: 'Specialized treatments for gum health and disease prevention.',
    image: '/images/services/service-lab-work.jpg',
  },
  {
    title: 'Pediatric dentistry',
    category: 'General',
    desc: 'Gentle and comprehensive dental care for children of all ages.',
    image: '/images/services/service-exam.jpg',
  },
  {
    title: 'Dental crowns',
    category: 'General',
    desc: 'Custom-crafted restorations to protect and strengthen damaged teeth.',
    image: '/images/services/gallery-chairs-row.jpg',
  },
  {
    title: 'TMJ Therapy',
    category: 'General',
    desc: 'Relief from jaw pain, clicking, and related headaches.',
    image: '/images/services/gallery-chair-red.jpg',
  },

  // SPECIALIZED
  {
    title: 'Veneers',
    category: 'Specialized',
    desc: 'Ultra-thin porcelain shells for a flawless, natural-looking smile.',
    image: '/images/services/service-chair-tree.jpg',
  },
  {
    title: 'Dental implants',
    category: 'Specialized',
    desc: 'Permanent tooth replacement solutions that feel and look like natural teeth.',
    image: '/images/services/service-chair-scenic.jpg',
  },
  {
    title: 'ALL-ON-X',
    category: 'Specialized',
    desc: 'Full-arch restoration for immediate, transformative results.',
    image: '/images/services/service-lab-work.jpg',
  },
  {
    title: 'Endodontics',
    category: 'Specialized',
    desc: 'Specialized root canal treatments to save natural teeth.',
    image: '/images/services/gallery-consultation.jpg',
  },
  {
    title: 'Surgery',
    category: 'Specialized',
    desc: 'Expert surgical care for complex oral conditions.',
    image: '/images/services/service-chair-close.jpg',
  },
  {
    title: 'Smile design',
    category: 'Specialized',
    desc: 'Digital smile planning for predictable aesthetic results.',
    image: '/images/services/service-chair-tree.jpg',
  },
  {
    title: 'Bone grafting',
    category: 'Specialized',
    desc: 'Advanced bone regeneration to build a solid foundation for implants.',
    image: '/images/services/gallery-equipment.jpg',
  },
  {
    title: 'Sinus lifts',
    category: 'Specialized',
    desc: 'Surgical elevation of the sinus cavity to allow for upper jaw implants.',
    image: '/images/services/gallery-consultation.jpg',
  },
  {
    title: 'Full mouth reconstruction',
    category: 'Specialized',
    desc: 'Comprehensive rehabilitation of your entire oral structure and aesthetic.',
    image: '/images/services/service-chair-close.jpg',
  },
  {
    title: 'Laser gum surgery',
    category: 'Specialized',
    desc: 'Minimally invasive laser therapy for periodontal disease and contouring.',
    image: '/images/services/service-chair-tree.jpg',
  },
  {
    title: 'Maxillofacial prosthetics',
    category: 'Specialized',
    desc: 'Complex prosthetic rehabilitation for congenital or acquired defects.',
    image: '/images/services/service-chair-scenic.jpg',
  }
];

const ServicesList = ({ services: dynamicServices, loading, error, variant = 'dark', onBookNow, onServiceSelect }) => {
  const isDark = variant === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'General';

  const setActiveCategory = (category) => {
    setSearchParams({ category }, { replace: true });
  };
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const navigate = useNavigate();

  // Master list is always the 22 SERVICES. Enrich them with dynamic data if available.
  const activeServices = SERVICES.map(staticS => {
    const dynamicMatch = dynamicServices?.find(ds => 
      ds.name.toLowerCase() === staticS.title.toLowerCase()
    );
    return dynamicMatch ? { ...staticS, ...dynamicMatch } : staticS;
  });

  useEffect(() => {
    if (activeServices.length === 0) return;

    let ctx;
    const timer = setTimeout(() => {
        ctx = gsap.context(() => {
            // Animate Heading Elements staggered (Masked Reveal)
            const headings = gsap.utils.toArray('.services-reveal-text');
            if (headings.length > 0) {
              gsap.from(headings, {
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
            }

            // Animate grid cards in batches
            const cards = gsap.utils.toArray('.gsap-card');
            if (cards.length > 0) {
              gsap.set(cards, { y: 40, opacity: 0, scale: 0.95 });
              ScrollTrigger.batch(cards, {
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
            }

            // Animate list items staggered robustly
            const listItemsElements = gsap.utils.toArray('.gsap-list-item');
            if (listItemsElements.length > 0) {
              gsap.fromTo(listItemsElements, 
                  { x: -20, opacity: 0 },
                  {
                      x: 0,
                      opacity: 1,
                      duration: 0.6,
                      ease: 'power3.out',
                      stagger: 0.1,
                      scrollTrigger: {
                          trigger: '.gsap-list-container',
                          start: 'top 95%',
                          once: true,
                      },
                  }
              );
            }
        }, sectionRef);

        // Force ScrollTrigger to recalculate all trigger positions now that layout is stable
        ScrollTrigger.refresh();
    }, 100);

    return () => {
        clearTimeout(timer);
        if (ctx) ctx.revert();
    };
  }, [activeCategory, activeServices.length]); // Re-run animation if activeCategory or services length change

  const handleServiceSelect = (service) => {
    if (onServiceSelect) {
      onServiceSelect(service);
    } else {
      // Use the database ID if available, otherwise use a URL-friendly name as a slug
      const identifier = service.id || (service.title || service.name).toLowerCase().replace(/\s+/g, '-');
      navigate(`/services/${identifier}`);
    }
  };

  const getGridClasses = (index) => {
    switch (index) {
        case 0:
            return 'col-span-2 md:col-span-4 h-[300px] md:h-[450px]';
        default:
            return 'col-span-1 h-[280px] md:h-[420px]';
    }
  };

  // Helper to map dynamic service properties to what the component expects
  const mapService = (s) => ({
    id: s.id,
    title: s.name || s.title,
    category: s.tier ? (s.tier.charAt(0).toUpperCase() + s.tier.slice(1)) : (s.category || 'General'),
    desc: s.description || s.desc,
    // Use the index to pick an image if s.image is missing
    image: s.image || (SERVICES.find(orig => orig.title.toLowerCase() === (s.name || '').toLowerCase())?.image) || '/images/services/service-chair-close.jpg',
  });

  const filteredServices = activeServices
    .map(mapService)
    .filter(service => service.category === activeCategory);
  
  // Design logic from HomeServices
  const gridItems = filteredServices.slice(0, 5);
  const listItems = filteredServices.slice(5);

  if (loading && (!dynamicServices || dynamicServices.length === 0)) {
      return (
          <div className="bg-[#0B1120] py-32 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium tracking-widest uppercase">Loading clinical solutions...</p>
          </div>
      );
  }

  return (
    <div ref={sectionRef} className="bg-[#0B1120] py-16 sm:py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-sky-500/5 rounded-full blur-[200px] -mr-96 -mt-96 pointer-events-none transition-all duration-700"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div ref={headingRef} className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-6 overflow-hidden">
              <div className="services-reveal-text flex items-center gap-3">
                <span className="h-px w-8 bg-sky-500"></span>
                <span className="text-sky-400 font-bold uppercase tracking-[0.4em] text-[10px]">Medical Services</span>
              </div>
            </div>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight">
              <div className="overflow-hidden">
                <span className="block services-reveal-text text-white">Clinical</span>
              </div>
              <div className="overflow-hidden mt-1 md:mt-0">
                <span className="block services-reveal-text text-sky-400">Solutions.</span>
              </div>
            </h2>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            {/* 2-choice selection navbar */}
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm self-start md:self-end">
              <button 
                onClick={() => setActiveCategory('General')}
                className={`px-6 py-3 rounded-full text-base font-bold transition-all ${activeCategory === 'General' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                General
              </button>
              <button 
                onClick={() => setActiveCategory('Specialized')}
                className={`px-6 py-3 rounded-full text-base font-bold transition-all ${activeCategory === 'Specialized' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Specialized
              </button>
            </div>
          </div>
        </div>

        {/* HomeServices Design Grid */}
        <div ref={gridRef} className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16 min-h-[100px]'>
            {gridItems.length > 0 ? (
              gridItems.map((service, idx) => (
                <div
                    key={service.title}
                    onClick={() => handleServiceSelect(service)}
                    className={`gsap-card group relative overflow-hidden rounded-2xl border transition-all duration-700 ease-out cursor-pointer ${getGridClasses(idx)} border-white/5 hover:border-sky-500/30 shadow-sm`}
                >
                    <img
                        src={service.image}
                        className='absolute inset-0 w-full h-full object-cover grayscale-30 group-hover:grayscale-0 transition-all duration-1000 ease-out group-hover:scale-105'
                        alt={service.title}
                    />

                    {/* Subtler Overlays for Dark Mode */}
                    <div className='absolute inset-0 transition-colors duration-700 ease-out bg-slate-900/40 group-hover:bg-slate-900/20'></div>
                    <div className='absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity from-black'></div>

                    <div className='absolute top-6 left-6 font-bold text-[10px] tracking-widest transition-colors text-white/50 group-hover:text-sky-400'>
                        {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className='absolute top-5 right-5 w-10 h-10 rounded-xl backdrop-blur-md border flex items-center justify-center text-white transform transition-all duration-500 ease-out group-hover:bg-sky-500 group-hover:border-sky-400 group-hover:rotate-45 bg-white/10 border-white/10'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M5 19L19 5m0 0H8m11 0v11'></path>
                        </svg>
                    </div>

                    <div className='absolute bottom-6 left-6 pr-8'>
                        <h3 className={`font-bold text-white tracking-tight leading-[1.2] drop-shadow-sm transition-all ease-out ${idx === 0 ? 'duration-500 text-2xl md:text-4xl max-w-lg mb-2' : 'duration-700 text-lg md:text-2xl max-w-40'}`}>
                            {service.title}
                        </h3>
                        <div className={`grid transition-all ease-out grid-rows-[0fr] group-hover:grid-rows-[1fr] opacity-0 group-hover:opacity-100 ${idx === 0 ? 'duration-500' : 'duration-700'}`}>
                            <div className="overflow-hidden">
                                <p className={`text-slate-300 text-sm md:text-base leading-relaxed max-w-md pt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform ease-out ${idx === 0 ? 'duration-500' : 'duration-700'}`}>
                                    {service.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">
                  No {activeCategory} services found in this tier.
                </p>
              </div>
            )}
        </div>

        {/* List View */}
        {listItems.length > 0 && (
            <div
                className={`gsap-list-container border-t divide-y ${isDark ? 'border-white/5 divide-white/5' : 'border-slate-100 divide-slate-100'}`}
            >
                {listItems.map((service, idx) => {
                    const displayIndex = idx + gridItems.length + 1;
                    return (
                        <div
                            key={service.title}
                            onClick={() => handleServiceSelect(service)}
                            className={`gsap-list-item group flex items-center justify-between py-10 md:py-14 px-4 hover:px-8 transition-all duration-700 ease-out cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/70'}`}
                        >
                            <div className='flex items-center gap-8 md:gap-20'>
                                <span
                                    className={`font-bold text-sm md:text-base transition-colors ${isDark ? 'text-white/30 group-hover:text-white/70' : 'text-slate-400 group-hover:text-blue-500'}`}
                                >
                                    {String(displayIndex).padStart(2, '0')}
                                </span>
                                <h3
                                    className={`text-xl md:text-4xl font-bold transition-colors tracking-tight ${isDark ? 'text-white/80 group-hover:text-white group-hover:translate-x-1' : 'text-slate-800 group-hover:text-slate-900 group-hover:translate-x-1'}`}
                                >
                                    {service.title}
                                </h3>
                            </div>

                            <div
                                className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border flex items-center justify-center transition-all duration-700 ease-out ${isDark ? 'bg-white/5 border-white/10 text-white/40 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20 group-hover:rotate-6' : 'bg-white border-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 shadow-sm group-hover:shadow-md group-hover:rotate-6'}`}
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
        )}
      </div>
    </div>
  );
};

export default ServicesList;
