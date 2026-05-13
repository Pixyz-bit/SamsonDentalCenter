import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const Carousel = ({ className }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselImages = [
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className={cn(
                'hidden md:flex md:w-1/2 lg:w-[45%] flex-shrink-0 relative bg-stone-950 overflow-hidden min-h-full',
                className,
            )}
        >
            {carouselImages.map((img, idx) => (
                <img
                    key={idx}
                    src={img}
                    className={cn(
                        'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out',
                        currentImageIndex === idx ? 'opacity-40' : 'opacity-0',
                    )}
                    alt='Clinic'
                />
            ))}

            {/* Gradient Overlay - Improved visibility */}
            <div className='absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30 z-10' />

            {/* Content Overlay */}
            <div className='relative z-20 w-full p-8 lg:p-12 flex flex-col h-full justify-between text-left'>
                {/* Brand */}
                <div className='flex items-center gap-3 transition-all duration-300 group flex-shrink-0'>
                    <div className='w-8 flex-shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110'>
                        <img
                            src='/images/logo/samson-logo.png'
                            alt='Samson Dental Logo'
                            className='w-full h-auto'
                        />
                    </div>
                    <div className='flex flex-col items-start justify-center flex-shrink-0'>
                        <span className='font-black text-[22px] tracking-[-0.04em] leading-none text-white whitespace-nowrap'>
                            SAMSON
                        </span>
                        <span className='text-[10px] uppercase tracking-[0.28em] font-bold mt-[1px] text-red-600 whitespace-nowrap drop-shadow-[0_0_12px_rgba(203,0,16,0.5)]'>
                            Dental Center
                        </span>
                    </div>
                </div>

                {/* Bottom Content */}
                <div className='flex flex-col items-start'>
                    <div className='inline-flex px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-full backdrop-blur-md shadow-sm mb-3'>
                        <span className='text-[11px] font-bold text-white uppercase tracking-widest'>
                            Admin Portal
                        </span>
                    </div>

                    <div className='space-y-4 max-w-md'>
                        <h1 className='text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight'>
                            Modern Care,
                            <br />
                            Perfect Smiles.
                        </h1>
                        <p className='text-slate-300 text-base leading-relaxed font-medium'>
                            Access your premium dental portal to manage visits and records
                            effortlessly.
                        </p>
                    </div>

                    {/* Indicators */}
                    <div className='flex gap-3 pt-8'>
                        {carouselImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'h-1.5 rounded-full transition-all duration-500 ease-out',
                                    currentImageIndex === idx
                                        ? 'w-8 bg-red-600 shadow-[0_0_12px_rgba(203,0,16,0.5)]'
                                        : 'w-2 bg-white/20 hover:bg-white/40',
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carousel;




