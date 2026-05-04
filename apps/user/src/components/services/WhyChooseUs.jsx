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
        <section className='py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden'>
            {/* Background elements */}
            <div className='absolute -top-80 -left-80 w-160 h-160 bg-red-100/50 rounded-full blur-[100px] pointer-events-none'></div>
            <div className='absolute top-80 -right-80 w-160 h-160 bg-stone-200/50 rounded-full blur-[100px] pointer-events-none'></div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center'>
                    {/* Left Column: Text & Context */}
                    <div className='flex flex-col gap-6 sm:gap-8 max-w-2xl'>
                        <div className='flex flex-col gap-4'>
                            <span className='text-red-600 font-semibold tracking-wide text-sm uppercase'>
                                The Primera Difference
                            </span>
                            <h2 className='text-[clamp(2.25rem,5vw+0.5rem,3.5rem)] font-bold text-stone-900 leading-[1.15] tracking-tight'>
                                Why trust us with your <span className='text-red-600'>smile?</span>
                            </h2>
                        </div>
                        <p className='text-[clamp(1rem,1.5vw+0.5rem,1.125rem)] text-stone-600 leading-relaxed'>
                            We believe that exceptional dental care goes beyond just fixing teeth.
                            It's about combining precise medical expertise with a compassionate,
                            human touch. From the moment you walk through our doors, your comfort
                            and long-term oral health are our highest priorities.
                        </p>

                        <div className='pt-6'>
                            <div className='flex items-center gap-4 p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm w-fit'>
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
                                            className='w-12 h-12 rounded-full border-2 border-white object-cover'
                                        />
                                    ))}
                                </div>
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-1 text-amber-400'>
                                        <div className='flex items-center gap-1 text-amber-400'>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className='w-4 h-4 fill-current'
                                                    viewBox='0 0 20 20'
                                                >
                                                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <span className='text-sm font-semibold text-stone-900'>
                                        5,000+ Happy Patients
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Features Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                        {features.map((feature) => (
                            <div
                                key={feature.id}
                                className='bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-200/80 hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200 ease-in-out flex flex-col gap-4 group'
                            >
                                <div className='w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 ease-in-out'>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className='font-bold text-stone-900 text-[clamp(1.125rem,1vw+0.5rem,1.25rem)] tracking-tight mb-2'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-sm text-stone-600 leading-relaxed'>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
