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
    let ctx = gsap.context(() => {
      // Reveal header
      gsap.from('.step-header', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      });

      // Animate lines drawing
      gsap.from('.step-line', {
        scaleY: 0,
        duration: 0.6,
        stagger: 0.3,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      });

      // Reveal step items
      gsap.from('.step-item', {
        x: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-10 step-header">
              {/* Tooth Icon (SVG) */}
              <div className="flex-shrink-0 text-red-600 w-12 h-12 md:w-16 md:h-16">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M7 3C4 3 3 6 3 9C3 13 4 15 6 15C6 15 5 21 8 21C11 21 11 15 12 15C13 15 13 21 16 21C19 21 18 15 18 15C20 15 21 13 21 9C21 6 20 3 17 3C15 3 13 5 12 5C11 5 9 3 7 3Z" fill="#fee2e2" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-red-600 mb-2 font-brand tracking-tight leading-tight">Your Dental Visit, Made Simple</h2>
                <p className="text-stone-800 text-[15px] sm:text-lg md:text-xl font-medium opacity-90 leading-tight">Quick and easy steps to quality care.</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-1 md:pl-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="relative mb-6 last:mb-0">
                  
                  {/* Line connecting circles (except last one) */}
                  {index !== STEPS.length - 1 && (
                    <div className="absolute left-[23px] md:left-[29px] top-12 md:top-[60px] bottom-[-24px] w-[2.5px] bg-red-600/20 origin-top step-line" />
                  )}

                  <div className="flex items-start gap-5 md:gap-8 step-item relative z-10">
                    {/* Circle with Number */}
                    <div className="flex-shrink-0 w-12 h-12 md:w-[60px] md:h-[60px] rounded-full bg-red-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold ring-4 ring-white shadow-sm z-10">
                      {step.id}
                    </div>
                    
                    {/* Text Content */}
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-1 leading-tight">{step.title}</h3>
                      <p className="text-stone-800 text-base md:text-lg leading-snug">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="hidden lg:flex justify-center items-center relative step-header">
             <div className="absolute inset-0 bg-red-100/50 rounded-full blur-[120px] -z-10 translate-x-1/4 scale-110"></div>
             <img 
               src="/images/home/dentist-action.png" 
               alt="Dentist at work" 
               className="w-full h-auto max-h-[650px] object-contain drop-shadow-2xl scale-110 translate-x-4"
             />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSteps;
