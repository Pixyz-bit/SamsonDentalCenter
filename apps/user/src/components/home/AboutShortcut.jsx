import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CASES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=600&auto=format&fit=crop", // Close up smile
    title: "Teeth Whitening"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1654373535457-383a0a4d00f9?q=80&w=600&auto=format&fit=crop", // Teeth whitening case
    title: "Veneers"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1660300110427-c4a6efdf18b5?q=80&w=600&auto=format&fit=crop", // Dental close up
    title: "Restoration"
  }
];

const AboutShortcut = () => {
  const navigate = useNavigate();
  const [activeCase, setActiveCase] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gsap-animate', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleMove = useCallback((clientX) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPosition(percent);
    }
  }, []);

  const onMouseDown = () => setIsDragging(true);
  const onTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  // Global mouse event listeners for smooth dragging outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e) => {
        if (isDragging) handleMove(e.clientX);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, handleMove]);

  const currentCase = CASES[activeCase];

  return (
    <section ref={sectionRef} className="py-6 md:py-12 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-6 md:mb-10 gsap-animate">
              <h2 className="text-3xl md:text-4xl font-brand font-black text-slate-900 uppercase tracking-tight flex flex-col sm:block">
                  <span className="sm:mr-2">Real Results.</span>
                  <span className="text-sky-500">Real Smiles.</span>
              </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Text Content Side */}
              <div className="order-2 lg:order-1 space-y-8">
                  <p className="text-slate-600 text-lg leading-relaxed gsap-animate">
                      Our professionals use advanced technologies to achieve impressive results. Your teeth will become <span className="font-bold text-slate-900 bg-sky-500/20 px-1 rounded">8+ shades lighter</span>, and the cavity treatment procedure is not only pain-free but also 100% effective. <span className="text-sky-500 font-bold">Your smile will be your pride!</span>
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed gsap-animate">
                      At Samson Dental Center, we are committed to helping you achieve the perfect smile with the latest in dental technology and personalized care. Our clinic <span className="font-bold text-slate-900">combines years of experience with innovative techniques</span> to ensure that every visit is as comfortable and efficient as possible.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 gsap-animate">
                          <p className="text-3xl md:text-4xl font-black text-slate-900 mb-1">98%</p>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Satisfaction Rate</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 gsap-animate">
                          <p className="text-3xl md:text-4xl font-black text-slate-900 mb-1">85%</p>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Faster Recovery</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 gsap-animate">
                          <p className="text-3xl md:text-4xl font-black text-slate-900 mb-1">100%</p>
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Transformations</p>
                      </div>
                  </div>
                  
                  <div className="pt-4 gsap-animate">
                    <button 
                      onClick={() => navigate('/about')}
                      className="inline-flex items-center space-x-2 text-sky-500 font-bold uppercase tracking-widest text-xs hover:text-sky-600 transition-colors"
                    >
                      <span>Learn More About Us</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </button>
                  </div>
              </div>

              {/* Slider Content Side */}
              <div className="order-1 lg:order-2">
                  <div 
                    ref={containerRef}
                    className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden cursor-ew-resize select-none shadow-2xl border-4 border-slate-100 ring-1 ring-slate-200 gsap-animate"
                    onMouseDown={onMouseDown}
                    onTouchMove={onTouchMove}
                  >
                        {/* After Image (Background) - Simulated 'Clean/Bright' via filter */}
                        <img 
                            src={currentCase.image} 
                            alt="After" 
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none filter brightness-110 contrast-105 saturate-105"
                        />
                         <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 pointer-events-none z-10 shadow-lg uppercase tracking-wider">After</div>

                        {/* Before Image (Foreground) - Simulated 'Stained' via filter - Clipped */}
                        <img 
                            src={currentCase.image} 
                            alt="Before" 
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none filter sepia-[0.4] brightness-95 contrast-90"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} 
                        />
                        {/* Only show "Before" label if not fully revealed to avoid overlapping */}
                        <div 
                          className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 pointer-events-none z-10 shadow-lg uppercase tracking-wider"
                          style={{ opacity: sliderPosition > 10 ? 1 : 0 }}
                        >
                          Before
                        </div>

                        {/* Slider Handle Line */}
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            {/* Circle Handle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-slate-50">
                                <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                            </div>
                        </div>
                  </div>

                  {/* Thumbnails Navigation */}
                  <div className="flex items-center justify-center gap-6 mt-8">
                       <button 
                        onClick={() => setActiveCase(c => (c - 1 + CASES.length) % CASES.length)}
                        className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-2xl hover:bg-sky-500 hover:text-white transition-all active:scale-95 text-slate-400"
                       >
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                       </button>

                       <div className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide">
                           {CASES.map((c, idx) => (
                               <div 
                                key={c.id} 
                                onClick={() => setActiveCase(idx)}
                                className={`relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform ${activeCase === idx ? 'ring-4 ring-sky-500 ring-offset-2 ring-offset-white scale-105' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}
                               >
                                   <img src={c.image} className="w-full h-full object-cover" alt="" />
                               </div>
                           ))}
                       </div>

                       <button 
                         onClick={() => setActiveCase(c => (c + 1) % CASES.length)}
                         className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-2xl hover:bg-sky-500 hover:text-white transition-all active:scale-95 text-slate-400"
                       >
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                       </button>
                  </div>
              </div>
          </div>
      </div>
    </section>
  );
};

export default AboutShortcut;
