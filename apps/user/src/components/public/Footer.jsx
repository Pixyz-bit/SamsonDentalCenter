import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone } from 'lucide-react';

const Footer = () => {
    const facebookUrl = 'https://facebook.com/samsondentalcenter';
    const email = 'samsondentalcenter@gmail.com';
    const phone = '09123456789';

    return (
        <footer className='bg-stone-950 text-stone-50 py-16 sm:py-24 lg:py-32 relative overflow-hidden'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16 mb-16 sm:mb-20 md:mb-24'>
                    {/* Brand & Socials Column */}
                    <div className='col-span-2 sm:col-span-2 lg:col-span-1'>
                        <div className='flex items-center gap-4 mb-6 sm:mb-8 group cursor-pointer w-fit'>
                            <div className='relative flex items-center justify-center w-12 h-12 z-10'>
                                <img
                                    src='/images/logo/samson-logo.png'
                                    alt='Samson Dental Center Logo'
                                    className='w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 ease-out drop-shadow-md'
                                />
                            </div>
                            <div className='flex flex-col items-start justify-center flex-shrink-0'>
                                <span className='font-black text-[20px] tracking-[-0.04em] leading-none text-white whitespace-nowrap'>
                                    SAMSON
                                </span>
                                <span className='text-[9px] uppercase tracking-[0.28em] font-bold mt-[2px] text-red-500 whitespace-nowrap drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'>
                                    Dental Center
                                </span>
                            </div>
                        </div>
                        <p className='text-sm leading-relaxed mb-8 max-w-sm text-stone-200'>
                            Empowering communities with world-class dental solutions and
                            compassionate care since 2008. Your journey to a perfect smile starts
                            here.
                        </p>
                        <div className='flex gap-4 flex-wrap'>
                            <a
                                href={facebookUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'
                                title='Facebook'
                            >
                                <Facebook className='w-5 h-5' />
                            </a>
                            <a
                                href={`mailto:${email}`}
                                className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'
                                title='Email Us'
                            >
                                <Mail className='w-5 h-5' />
                            </a>
                            <a
                                href={`tel:${phone}`}
                                className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'
                                title='Call Us'
                            >
                                <Phone className='w-5 h-5' />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className='col-span-1'>
                        <h4 className='font-bold text-white text-sm mb-5 sm:mb-8 tracking-wide uppercase opacity-90'>
                            Quick Links
                        </h4>
                        <ul className='space-y-4 text-sm font-semibold text-stone-200'>
                            <li>
                                <Link
                                    to='/'
                                    className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out inline-block'
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/about'
                                    className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out inline-block'
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/services'
                                    className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out inline-block'
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/contact'
                                    className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out inline-block'
                                >
                                    Contacts
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Specialties Column */}
                    <div className='col-span-1'>
                        <h4 className='font-bold text-white text-sm mb-5 sm:mb-8 tracking-wide uppercase opacity-90'>
                            Specialties
                        </h4>
                        <ul className='space-y-4 text-sm font-semibold text-stone-200'>
                            <li className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out cursor-default inline-block w-full'>
                                General Dentistry
                            </li>
                            <li className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out cursor-default inline-block w-full'>
                                Orthodontics
                            </li>
                            <li className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out cursor-default inline-block w-full'>
                                Oral Surgery
                            </li>
                            <li className='hover:text-white hover:translate-x-1.5 transition-all duration-300 ease-out cursor-default inline-block w-full'>
                                Pediatric Care
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className='col-span-2 sm:col-span-2 lg:col-span-1'>
                        <h4 className='font-bold text-white text-sm mb-5 sm:mb-8 tracking-wide uppercase opacity-90'>
                            Newsletter
                        </h4>
                        <p className='text-sm mb-6 sm:mb-8 leading-relaxed text-stone-200'>
                            Stay updated with dental tips and exclusive offers.
                        </p>
                        <div className='relative group max-w-sm'>
                            <input
                                type='email'
                                placeholder='Your email'
                                className='w-full bg-white/10 border border-white/20 rounded-xl pl-5 pr-16 py-4 text-sm focus:outline-none focus:border-white/35 focus:ring-2 focus:ring-white/15 transition-all placeholder:text-stone-300 text-white'
                            />
                            <button className='absolute right-2 top-2 bottom-2 bg-stone-900 text-white px-4 rounded-lg hover:bg-stone-800 transition-all duration-200 ease-in-out shadow-sm active:scale-95 flex items-center justify-center' aria-label='Subscribe'>
                                <svg
                                    className='w-5 h-5'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2.5'
                                        d='M14 5l7 7m0 0l-7 7m7-7H3'
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Meta Bar */}
                <div className='pt-10 sm:pt-12 border-t border-white/12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold tracking-widest uppercase text-stone-300'>
                    <p className='text-center md:text-left'>
                        © {new Date().getFullYear()} Samson Dental Center. All Rights Reserved.
                    </p>
                    <div className='flex flex-wrap justify-center md:justify-end gap-6 sm:gap-8'>
                        <Link
                            to='/privacy'
                            className='hover:text-white transition-colors duration-200'
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to='/terms'
                            className='hover:text-white transition-colors duration-200'
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
