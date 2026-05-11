import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: 1,
    title: "Choose Your Service",
    description: "Choose the care that fits your needs.",
  },
  {
    id: 2,
    title: "Pick a Date & Time",
    description: "View available slots and select a schedule that works best for you.",
  },
  {
    id: 3,
    title: "Fill in Your Basic Information",
    description: "Provide your name, contact details, and any special notes for the dentist.",
  },
  {
    id: 4,
    title: "Review & Confirm Your Booking.",
    description: "You'll receive a confirmation message with your appointment details.",
  }
];

const BookingSteps = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect system preference for reduced motion to ensure high accessibility
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let ctx = gsap.context(() => {
      // Reveal the main section header with a smooth upward slide
      gsap.from('.step-section-header', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        }
      });

      // Query all timeline step containers
      const stepContainers = containerRef.current.querySelectorAll('.step-item-container');
      
      stepContainers.forEach((item) => {
        const circle = item.querySelector('.step-circle');
        const text = item.querySelector('.step-text');
        const line = item.querySelector('.step-line');
        
        // Standard non-scrub entry timeline for circles and text card components
        const entryTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        });

        if (circle) {
          entryTimeline.fromTo(circle, 
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.55, 
              ease: 'back.out(1.6)' 
            }, 
            0
          );
        }

        if (text) {
          entryTimeline.fromTo(text,
            { x: -20, opacity: 0 },
            { 
              x: 0, 
              opacity: 1, 
              duration: 0.65, 
              ease: 'power3.out' 
            },
            0.1
          );
        }

        // Custom scroll-linked "drawing" animation for timeline connector lines
        if (line) {
          gsap.fromTo(line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top 70%',   // starts drawing as circle enters viewport upper half
                end: 'bottom 60%',  // finishes as card passes viewport mid-point
                scrub: 1,           // 1s delay smooth scroll catch-up
              }
            }
          );
        }
      });

      // Spatial floating entrance and hover loop for the dentist action illustration
      gsap.fromTo('.step-img', 
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.step-image-container',
            start: 'top 80%',
          },
          onComplete: () => {
            // Infinite low-frequency hover drift
            gsap.to('.step-img', {
              y: -12,
              duration: 3,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut'
            });
          }
        }
      );

      // Ambient background glow pulse
      gsap.to('.step-glow', {
        scale: 1.12,
        opacity: 0.85,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            {/* Header */}
            <div className="flex items-center gap-4 md:gap-5 mb-12 step-section-header">
              {/* Tooth Icon (SVG) */}
              <div className="flex-shrink-0 text-red-600 w-12 h-12 md:w-16 md:h-16">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M7 3C4 3 3 6 3 9C3 13 4 15 6 15C6 15 5 21 8 21C11 21 11 15 12 15C13 15 13 21 16 21C19 21 18 15 18 15C20 15 21 13 21 9C21 6 20 3 17 3C15 3 13 5 12 5C11 5 9 3 7 3Z" fill="#fee2e2" className="dark:fill-red-950/40" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl xs:text-3xl lg:text-[1.95rem] xl:text-4xl font-black text-red-600 dark:text-red-500 mb-1 font-brand tracking-tight leading-tight lg:whitespace-nowrap">
                  Your Dental Visit, Made Simple
                </h2>
                <p className="text-stone-800 dark:text-gray-300 text-base md:text-lg font-medium opacity-90 leading-tight">
                  Quick and easy steps to quality care.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-1 md:pl-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="relative pb-10 md:pb-12 last:pb-0 group step-item-container">
                  
                  {/* Line connecting circles (except last one) */}
                  {index !== STEPS.length - 1 && (
                    <div className="absolute left-6 md:left-[30px] top-12 md:top-[60px] bottom-0 w-[2.5px] bg-red-600/25 dark:bg-red-500/20 -translate-x-1/2 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-red-600 dark:bg-red-500 origin-top step-line" style={{ transform: 'scaleY(0)' }} />
                    </div>
                  )}

                  <div className="flex items-start gap-5 md:gap-8 relative z-10">
                    {/* Circle with Number */}
                    <div className="flex-shrink-0 w-12 h-12 md:w-[60px] md:h-[60px] rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center text-white text-xl md:text-2xl font-black ring-4 ring-white dark:ring-gray-900 shadow-[0_4px_12px_rgba(225,0,17,0.25)] z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_18px_rgba(225,0,17,0.5)] step-circle">
                      {step.id}
                    </div>
                    
                    {/* Text Content Wrap (Glassmorphic Hover Effect) */}
                    <div className="flex-grow p-4 -m-4 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-white/5 hover:bg-stone-50/60 dark:hover:bg-white/[0.015] transition-all duration-300 group-hover:shadow-theme-xs step-text">
                      <h3 className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-500 mb-1 leading-tight group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-stone-800 dark:text-gray-300 text-base md:text-lg leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Floating Illustration & Pulse Ambient Glow */}
          <div className="hidden md:flex justify-center items-center relative mt-12 md:mt-0 step-image-container">
            <div className="absolute inset-0 bg-red-100/50 dark:bg-red-950/20 rounded-full blur-[80px] md:blur-[120px] -z-10 translate-x-1/4 scale-110 step-glow" />
            <img 
              src="/images/home/dentist-action.png" 
              alt="Dentist at work" 
              className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-none h-auto max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-contain drop-shadow-2xl scale-105 md:scale-110 md:translate-x-4 step-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSteps;
