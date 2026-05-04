import React from 'react';

const DoctorProfileHeader = ({ doctor, onBack }) => {
    if (!doctor) return null;
    return (
        <div className="p-6 border border-gray-200/60 rounded-3xl dark:border-gray-800/60 lg:p-8 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl relative group shadow-theme-sm hover:shadow-theme-md transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <button 
                onClick={onBack}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 sm:px-4 sm:py-2.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 z-20 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                <span className="hidden sm:block">Close</span>
            </button>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between relative z-10">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row xl:items-center">
                    <div className="relative shrink-0 group/avatar">
                        <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 group-hover/avatar:opacity-40 transition-opacity duration-500 rounded-full" />
                        <div className="w-24 h-24 sm:w-28 sm:h-28 relative z-10 overflow-hidden border-4 border-white dark:border-gray-900 rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-3xl shadow-xl group-hover/avatar:scale-105 transition-transform duration-500">
                            {doctor.photo_url ? (
                                <img alt={doctor.full_name} className="w-full h-full object-cover" src={doctor.photo_url} />
                            ) : (
                                <img alt={doctor.full_name} className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}`} />
                            )}
                        </div>
                    </div>
                    <div className="order-3 xl:order-2 text-center xl:text-left">
                        <h4 className="mb-1 text-[clamp(24px,2.5vw,32px)] font-bold text-gray-900 dark:text-white font-outfit tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-500">{doctor.full_name}</h4>
                        <div className="flex flex-col items-center gap-2 sm:gap-3 text-center xl:flex-row xl:text-left mt-2">
                            <span className="px-3 py-1 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 font-bold text-xs sm:text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
                                {doctor.title || (doctor.tier === 'specialized' ? 'Specialist' : 'General Dentist')}
                            </span>
                            <div className="hidden h-4 w-px bg-gray-200 dark:bg-gray-800 xl:block"></div>
                            <div className="text-[clamp(12px,1.2vw,13px)] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span>License: <span className="text-gray-900 dark:text-white font-black">{doctor.license_number || 'N/A'}</span></span>
                                <div className="h-3 w-px bg-gray-300 dark:bg-gray-700"></div>
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                    doctor.is_active 
                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${doctor.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                    {doctor.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfileHeader;
