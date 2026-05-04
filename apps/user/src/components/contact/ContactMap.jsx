import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ContactMap = () => {
    const containerRef = useRef(null);
    const leftColRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                }
            });

            // Animate text column children
            tl.fromTo(
                leftColRef.current.children,
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                }
            );

            // Animate map column
            tl.fromTo(
                mapRef.current,
                { x: 30, opacity: 0, scale: 0.95 },
                {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "power2.out",
                },
                "-=0.6" // start before text finishes
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className='py-24 sm:py-32 bg-white overflow-hidden'>
            <div className='w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24' ref={containerRef}>
                <div className='grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] xl:grid-cols-[1fr_1.4fr] gap-10 lg:gap-18 xl:gap-30 items-center'>
                    
                    {/* Info Text Column */}
                    <div className='flex flex-col space-y-16' ref={leftColRef}>
                        
                        {/* Visit Us Section */}
                        <div className="space-y-6">
                            <h2 className='text-[2.5rem] font-bold text-red-500 tracking-tight'>Visit Us</h2>
                            <div className='flex items-start gap-4'>
                                <div className='mt-1 shrink-0'>
                                    <svg viewBox="0 0 384 512" fill="currentColor" className="w-[1.8rem] h-[1.8rem] text-[#CE2B37]">
                                        <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                                    </svg>
                                </div>
                                <div className='flex flex-col space-y-2.5'>
                                    <h3 className='text-[1.35rem] font-normal text-stone-800 leading-snug'>
                                        7 Himlayan Rd, Tandang Sora,<br />Quezon City, Metro Manila
                                    </h3>
                                    <p className='text-stone-500 text-[1.05rem] italic leading-relaxed'>
                                        Located near Tandang Sora Market, easily<br className="hidden sm:block" /> accessible via Commonwealth Avenue.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Operating Hours Section */}
                        <div className="space-y-6">
                            <h2 className='text-[2.5rem] font-bold text-red-500 tracking-tight'>Operating Hours</h2>
                            <div className='space-y-3.5 text-[1.2rem] text-stone-800'>
                                <div className='grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr] gap-4'>
                                    <span className="text-right pr-4">Monday - Friday</span>
                                    <span>9:00 AM - 6:00 PM</span>
                                </div>
                                <div className='grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr] gap-4'>
                                    <span className="text-right pr-4">Saturday</span>
                                    <span>8:00 AM - 5:00 PM</span>
                                </div>
                                <div className='grid grid-cols-[160px_1fr] sm:grid-cols-[180px_1fr] gap-4'>
                                    <span className="text-right pr-4">Sunday</span>
                                    <span className='font-bold'>Closed (By Appointment)</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Google Map Column */}
                    <div 
                        className='w-full h-full min-h-[450px] lg:min-h-[470px] xl:min-h-[500px] rounded-[1rem] overflow-hidden bg-white shadow-2xl shadow-stone-300/50 relative transform-gpu' 
                        ref={mapRef}
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.6993425026937!2d121.04505327575232!3d14.673003085822363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b73c4dcb7b1f%3A0xe510f845da985a75!2s7%20Himlayan%20Rd%2C%20Tandang%20Sora%2C%20Quezon%20City%2C%201116%20Metro%20Manila%2C%20Philippines!5e0!3m2!1sen!2sus!4v1707908200000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Samson Dental Center Location"
                            className="bg-stone-100"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactMap;
