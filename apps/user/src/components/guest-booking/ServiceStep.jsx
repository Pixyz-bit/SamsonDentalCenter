import { useState, useEffect } from 'react';
import { ArrowRight, Stethoscope, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import useServices from '../../hooks/useServices';
import SpecializedServiceModal from './SpecializedServiceModal';

const ServiceStep = ({ selectedServiceId, onSelect, onNext, allowSpecialized = false }) => {
    const { services, loading, error: fetchError } = useServices();
    const [specializedService, setSpecializedService] = useState(null);
    const [category, setCategory] = useState('All');

    const filteredServices = services?.filter(service => {
        if (category === 'All') return true;
        return service.tier?.toLowerCase() === category.toLowerCase();
    });

    const handleServiceSelect = (service) => {
        const isSpecialized = service.tier?.toLowerCase() === 'specialized';

        if (isSpecialized && !allowSpecialized) {
            setSpecializedService(service);
        } else {
            onSelect(service.id, service.name, service.tier, service.duration_minutes);
        }
    };

    const categories = ['All', 'General', 'Specialized'];

    return (
        <div className="pb-10 sm:pb-6">
            <div className='mb-8 sm:mb-10'>
                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Choose Service
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed'>
                    Choose the dental service you'd like to book from our available options.
                </p>
            </div>

            <div className='flex items-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 bg-gray-100 dark:bg-gray-800/50 p-1.5 sm:p-2 rounded-2xl w-fit'>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all duration-300 ${category === cat
                            ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-theme-sm ring-1 ring-black/5 dark:ring-white/5'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading && (
                <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className='h-[160px] sm:h-[180px] rounded-2xl bg-gray-200 dark:bg-gray-700/60 animate-pulse border border-gray-100 dark:border-gray-800'></div>
                    ))}
                </div>
            )}

            {fetchError && (
                <div className='bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center'>
                    <p className='font-bold mb-2 text-xs'>Failed to load services</p>
                    <p className='text-sm opacity-80'>{fetchError}</p>
                </div>
            )}

            {!loading && !fetchError && filteredServices && (
                <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                    {filteredServices.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service)}
                            className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all relative group flex flex-col h-full min-h-[160px] sm:min-h-[180px] ${selectedServiceId === service.id
                                ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-500/10 shadow-theme-md'
                                : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:border-brand-300 dark:hover:border-brand-500/50 shadow-theme-sm hover:shadow-theme-lg'
                                }`}
                        >
                            <div className='flex-grow mb-4 sm:mb-5'>
                                <h3 className={`font-bold text-[13px] sm:text-sm md:text-base lg:text-lg pr-8 sm:pr-10 leading-tight mb-1 sm:mb-1.5 ${selectedServiceId === service.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-white/90'
                                    }`}>
                                    {service.name}
                                </h3>
                                <p className='text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed'>
                                    {service.description}
                                </p>
                            </div>

                            <div className='flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800'>
                                <div className='flex items-center gap-2 sm:gap-3'>
                                    <div className='flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-theme-xs'>
                                        <Clock size={12} className="sm:hidden text-brand-500" />
                                        <Clock size={14} className="hidden sm:block text-brand-500" />
                                        {service.duration_minutes}m
                                    </div>
                                    {service.tier?.toLowerCase() === 'specialized' && !allowSpecialized && (
                                        <div className='flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-400'>
                                            <ShieldCheck size={12} className="shrink-0" />
                                            <span className="hidden sm:inline">Specialized</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedServiceId === service.id
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500'
                                    }`}>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && !fetchError && (!services || services.length === 0) && (
                <div className='text-center text-gray-400 py-20'>
                    <p className='font-medium'>No services available at the moment.</p>
                </div>
            )}

            {/* Navigation */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-6 sm:pt-2 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center gap-3 w-full sm:justify-end'>
                    <button
                        onClick={onNext}
                        disabled={!selectedServiceId}
                        className='flex-1 sm:flex-none sm:min-w-[240px] bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black px-4 py-3.5 sm:px-10 sm:py-4 rounded-2xl transition-all shadow-theme-md disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-base'
                    >
                        Continue to Schedule
                        <ArrowRight size={18} className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Specialized Service Modal */}
            {specializedService && (
                <SpecializedServiceModal
                    service={specializedService}
                    onClose={() => setSpecializedService(null)}
                />
            )}
        </div>
    );
};

export default ServiceStep;
