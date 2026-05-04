import React from 'react';

const DoctorCard = ({ doc, onSchedule, onEdit }) => {
    return (
        <div 
            onClick={onSchedule} 
            className="p-5 sm:p-6 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl cursor-pointer hover:shadow-theme-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0 group/avatar">
                        <div className="absolute inset-0 bg-brand-500 blur-xl opacity-0 group-hover/avatar:opacity-30 transition-opacity duration-500 rounded-2xl" />
                        <div className="w-14 h-14 sm:w-16 sm:h-16 relative z-10 overflow-hidden border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xl shadow-md rounded-[1.1rem] group-hover/avatar:scale-105 transition-transform duration-500">
                            {doc.photo_url ? (
                                <img alt={doc.full_name} className="w-full h-full object-cover" src={doc.photo_url} />
                            ) : (
                                <img alt={doc.full_name} className="w-full h-full object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.id}`} />
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 tracking-tight leading-tight mb-0.5">{doc.full_name}</h3>
                        <p className="text-[11px] sm:text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                            {doc.title || (doc.tier === 'specialized' ? 'Specialist' : 'General Dentist')}
                        </p>
                    </div>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm shrink-0 ${
                    doc.is_active 
                        ? 'bg-emerald-50/80 text-emerald-600 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 group-hover:bg-emerald-100/80 dark:group-hover:bg-emerald-500/20' 
                        : 'bg-gray-50/80 text-gray-500 border-gray-200/50 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${doc.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="hidden sm:inline">{doc.is_active ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
            
            <div className="mt-5 sm:mt-6 space-y-2 relative z-10 pt-4 border-t border-gray-100/80 dark:border-gray-800/80">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all duration-300 shadow-sm border border-transparent group-hover:border-emerald-100 dark:group-hover:border-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path></svg>
                    </div>
                    <span className="font-semibold tabular-nums tracking-tight">{doc.phone || '+1 (555) 000-0000'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all duration-300 shadow-sm border border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg>
                    </div>
                    <span className="font-medium truncate">{doc.email || 'clinician@samson.com'}</span>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;
