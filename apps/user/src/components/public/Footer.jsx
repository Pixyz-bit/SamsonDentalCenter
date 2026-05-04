import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className='bg-[#0B1120] text-slate-50 py-16 sm:py-24 lg:py-32 relative overflow-hidden'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20 md:mb-24'>
                    <div className='col-span-1 md:col-span-2 lg:col-span-1'>
                        <div className='flex items-center gap-3 mb-8'>
                            <div className='w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm'>
                                <svg
                                    viewBox='0 0 100 100'
                                    className='w-6 h-6 fill-current'
                                >
                                    <path d='M50 5 C25 5 20 40 20 60 C20 85 40 95 50 95 C60 95 80 85 80 60 C80 40 75 5 50 5 Z' />
                                </svg>
                            </div>
                            <span className='font-bold text-xl tracking-tighter text-white uppercase'>
                                Samson <span className='text-slate-200'>Dental Center</span>
                            </span>
                        </div>
                        <p className='text-sm leading-relaxed mb-10 max-w-sm text-slate-200'>
                            Empowering communities with world-class dental solutions and
                            compassionate care since 2008. Your journey to a perfect smile starts
                            here.
                        </p>
                        <div className='flex gap-4'>
                            {[1, 2, 3].map((i) => (
                                <a
                                    key={i}
                                    href='#'
                                    className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'
                                >
                                    <div className='w-4 h-4 border-2 border-current rounded-xs'></div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className='font-bold text-white text-sm mb-8 tracking-wide uppercase opacity-90'>
                            Quick Links
                        </h4>
                        <ul className='space-y-4 text-sm font-semibold text-slate-200'>
                            <li>
                                <Link
                                    to='/'
                                    className='hover:text-white transition-colors duration-200'
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/about'
                                    className='hover:text-white transition-colors duration-200'
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/services'
                                    className='hover:text-white transition-colors duration-200'
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/contact'
                                    className='hover:text-white transition-colors duration-200'
                                >
                                    Contacts
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className='font-bold text-white text-sm mb-8 tracking-wide uppercase opacity-90'>
                            Specialties
                        </h4>
                        <ul className='space-y-4 text-sm font-semibold text-slate-200'>
                            <li className='hover:text-white transition-colors cursor-default'>
                                General Dentistry
                            </li>
                            <li className='hover:text-white transition-colors cursor-default'>
                                Orthodontics
                            </li>
                            <li className='hover:text-white transition-colors cursor-default'>
                                Oral Surgery
                            </li>
                            <li className='hover:text-white transition-colors cursor-default'>
                                Pediatric Care
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className='font-bold text-white text-sm mb-8 tracking-wide uppercase opacity-90'>
                            Newsletter
                        </h4>
                        <p className='text-sm mb-8 leading-relaxed text-slate-200'>
                            Stay updated with dental tips and exclusive offers.
                        </p>
                        <div className='relative group'>
                            <input
                                type='email'
                                placeholder='Your email'
                                className='w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-white/35 focus:ring-2 focus:ring-white/15 transition-all placeholder:text-slate-300 text-white'
                            />
                            <button className='absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 rounded-lg hover:bg-slate-800 transition-all duration-200 ease-in-out shadow-sm active:scale-95 flex items-center justify-center'>
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

                <div className='pt-12 border-t border-white/12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold tracking-widest uppercase text-slate-300'>
                    <p>© {new Date().getFullYear()} Samson Dental Center. All Rights Reserved.</p>
                    <div className='flex gap-8'>
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
