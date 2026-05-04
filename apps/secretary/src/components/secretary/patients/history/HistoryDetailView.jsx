import React from 'react';
import { User, Clock, Phone, ClipboardList, StickyNote, CircleCheckBig, ChevronLeft } from 'lucide-react';

const HistoryDetailView = ({ historyItem, patient, onBack }) => {
    if (!historyItem || !patient) return null;

    // Sample procedures if not provided
    const procedures = historyItem.procedures || [
        { name: 'Consultation', type: 'General' },
        { name: 'Endodontic Treatment', type: 'Specialized' },
        { name: 'Oral Prophylaxis', type: 'General' }
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header / Top Action Bar */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 shrink-0">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-white/[0.05] text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all shadow-theme-xs active:scale-95"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Clinical Record</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white font-outfit truncate">{historyItem.date}</span>
                </div>
                <div className="w-10 h-10"></div>
            </div>

            <div className="grow overflow-y-auto no-scrollbar">
                <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Patient & Visit Overview Card */}
                    <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] overflow-hidden shadow-sm">
                        <div className="p-5 flex items-start justify-between gap-4 border-b border-gray-50 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img 
                                        alt={patient.full_name} 
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover" 
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.full_name)}&background=random`}
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white font-outfit text-lg sm:text-xl truncate">{patient.full_name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <User size={12} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Patient</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Attending Doctor</span>
                                <p className="text-sm font-bold text-gray-900 dark:text-white font-outfit uppercase">{historyItem.doctor}</p>
                            </div>
                        </div>

                        {/* Visit Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-gray-50 dark:divide-white/5 bg-white dark:bg-gray-800/20">
                            <div className="p-4 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={10} /> Start
                                </span>
                                <span className="text-sm font-bold text-[#0B1120] dark:text-white font-outfit">{historyItem.startTime}</span>
                            </div>
                            <div className="p-4 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={10} /> End
                                </span>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-outfit">{historyItem.endTime}</span>
                            </div>
                            <div className="p-4 flex flex-col gap-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 border-gray-50 dark:border-white/5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Phone size={10} /> Contact
                                </span>
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-mono">{historyItem.phone || '+63 945 987 6543'}</span>
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="p-4 bg-brand-50/20 dark:bg-brand-500/[0.02] border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Main Service:</span>
                                <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{historyItem.service}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status:</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    historyItem.status === 'Completed' 
                                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30' 
                                        : 'bg-error-100 text-error-700 dark:bg-error-900/30'
                                }`}>
                                    {historyItem.status || 'Completed'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Summary */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-2">
                            <label className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                                <ClipboardList size={14} className="text-brand-500" />
                                Clinical Summary
                            </label>
                            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-100/50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full">
                                {procedures.length} Procedures
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            {procedures.map((proc, idx) => (
                                <div 
                                    key={idx}
                                    className="flex-1 min-w-[160px] flex items-center gap-3 p-4 pr-5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all group shadow-sm hover:shadow-md"
                                >
                                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                                        <CircleCheckBig size={12} strokeWidth={3} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-col">
                                            <p className="text-[14px] sm:text-[15px] font-bold text-gray-800 dark:text-white/90 leading-tight mb-1">{proc.name}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${proc.type === 'Specialized' ? 'text-amber-500' : 'text-brand-500/70'}`}>
                                                {proc.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clinician's Notes */}
                    <div className="space-y-3 pb-2">
                        <label className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                            <StickyNote size={14} className="text-amber-500" />
                            Clinician's Notes
                        </label>
                        <div className="p-4 bg-amber-50/40 dark:bg-amber-500/[0.02] border border-amber-100/30 dark:border-amber-500/10 rounded-2xl shadow-inner">
                            <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed italic font-medium">
                                "{historyItem.notes || 'Procedure completed without complications. Patient advised to return in 2 weeks for the final crown placement. Prescribed Ibuprofen 400mg for post-op discomfort.'}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailView;
