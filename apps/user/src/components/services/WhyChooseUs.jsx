const features = [
    {
        id: 1,
        title: 'Advanced Technology',
        description:
            'We utilize state-of-the-art 3D imaging, intraoral scanners, and modern pain-management techniques to provide accurate and comfortable care.',
        icon: (
            <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
            </svg>
        ),
    },
    {
        id: 2,
        title: 'Expert Specialists',
        description:
            'Our team comprises board-certified dentists with decades of combined experience, pursuing continuous education to stay at the forefront of dentistry.',
        icon: (
            <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
            </svg>
        ),
    },
    {
        id: 3,
        title: 'Comfort-First Approach',
        description:
            'Dental anxiety is real. We provide a spa-like environment, noise-canceling headphones, and sedation options to ensure a stress-free experience.',
        icon: (
            <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
            </svg>
        ),
    },
    {
        id: 4,
        title: 'Transparent Pricing',
        description:
            'No hidden fees or surprise bills. We provide detailed treatment plans, work with most insurance providers, and offer flexible financing.',
        icon: (
            <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
            </svg>
        ),
    },
];

const WhyChooseUs = () => {
    return (
        <section ref={containerRef} className='py-16 lg:py-24 bg-white relative overflow-hidden'>
            {/* Background elements */}
            <div className='absolute -top-80 -left-80 w-160 h-160 bg-red-100/50 rounded-full blur-[100px] pointer-events-none'></div>
            <div className='absolute top-80 -right-80 w-160 h-160 bg-stone-200/50 rounded-full blur-[100px] pointer-events-none'></div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch'>
                    {/* Left Column: Text & Context */}
                    <div className='lg:col-span-7 flex flex-col justify-center h-full'>
                        <div className='flex items-center gap-3 mb-6'>
                            <span className='h-px w-8 bg-red-600' />
                            <span className='text-red-500 font-bold uppercase tracking-widest text-[10px]'>
                                Why Trust Us
                            </span>
                        </div>
                        
                        <h2 className='text-[clamp(2.25rem,5vw,3.5rem)] font-bold text-stone-900 leading-[1.1] tracking-tight'>
                            Modern dental care <br /> 
                            <span className='text-red-600'>built on trust.</span>
                        </h2>
                        
                        <p className='mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl'>
                            We believe that exceptional dental care goes beyond just fixing teeth.
                            It's about combining precise medical expertise with a compassionate,
                            human touch.
                        </p>

                        <div className='pt-10 flex flex-wrap gap-4 items-center'>
                            <div className='flex items-center gap-4 p-4 rounded-3xl bg-white border border-stone-100 shadow-xl shadow-stone-200/50 w-fit'>
                                <div className='flex -space-x-4'>
                                    {[
                                        'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=100&h=100',
                                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100',
                                        'https://images.unsplash.com/photo-1606122017369-d782bbb78f32?auto=format&fit=crop&q=80&w=100&h=100',
                                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100',
                                    ].map((src, i) => (
                                        <img
                                            key={i}
                                            src={src}
                                            alt={`Happy patient ${i + 1}`}
                                            className='w-10 h-10 rounded-full border-2 border-white object-cover'
                                        />
                                    ))}
                                </div>
                                <div className='flex flex-col pr-2'>
                                    <div className='flex items-center gap-1 text-amber-400 mb-0.5'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className='w-2.5 h-2.5 fill-current' viewBox='0 0 20 20'>
                                                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className='text-[10px] font-bold text-stone-900'>
                                        5,000+ Happy Patients
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Features Grid */}
                    <div className='lg:col-span-5 flex flex-col justify-center h-full'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch h-full'>
                            {features.map((feature) => (
                                <div
                                    key={feature.id}
                                    className='bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 hover:shadow-xl hover:border-red-100 transition-all duration-500 flex flex-col gap-4 group h-full'
                                >
                                    <div className='w-10 h-10 rounded-2xl bg-stone-50 text-stone-900 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-500'>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className='text-sm font-bold text-stone-900 group-hover:text-red-600 transition-colors duration-300'>
                                            {feature.title}
                                        </h3>
                                        <p className='mt-1.5 text-[10px] text-stone-500 leading-relaxed'>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
