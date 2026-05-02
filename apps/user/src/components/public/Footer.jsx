import { Link } from 'react-router-dom';
import { useClinicSettings } from '../../hooks/useClinicSettings';

const Footer = () => {
    const { settings } = useClinicSettings();
    const clinicName = settings?.clinic_name || 'Samson Dental Center';

    return (
        <footer className='bg-[#0B1120] text-slate-50 py-10 sm:py-16 lg:py-20 relative overflow-hidden'>
            {/* Background Decor */}
            <div className='absolute bottom-0 right-0 w-150 h-150 bg-sky-500 rounded-full blur-[200px] -mr-150 -mt-150 pointer-events-none"'></div>

            <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10'>
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
                                {clinicName.split(' ')[0]} <span className='text-slate-200'>{clinicName.split(' ').slice(1).join(' ')}</span>
                            </span>
                        </div>
                        <p className='text-sm leading-relaxed mb-10 max-w-sm text-slate-200'>
                            {settings?.short_description || `Empowering communities with world-class dental solutions and compassionate care. Your journey to a perfect smile starts here at ${clinicName}.`}
                        </p>
                        <div className='flex gap-4'>
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'>
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                                </a>
                            )}
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'>
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                </a>
                            )}
                            {settings?.twitter_url && (
                                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'>
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                </a>
                            )}
                            {settings?.youtube_url && (
                                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 ease-in-out shadow-sm active:translate-y-0 hover:-translate-y-0.5'>
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </a>
                            )}
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
                    <p>© {new Date().getFullYear()} {clinicName}. All Rights Reserved.</p>
                    <div className='flex gap-8'>
                        <Link
                            to='/privacy-policy'
                            className='hover:text-white transition-colors duration-200'
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to='/terms-of-service'
                            className='hover:text-white transition-colors duration-200'
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
