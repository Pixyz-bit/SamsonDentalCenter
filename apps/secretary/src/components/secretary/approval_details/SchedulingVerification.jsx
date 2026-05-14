import React from 'react';
import { ShieldCheck, OctagonAlert, Check, X, Info } from 'lucide-react';

const SchedulingVerification = ({ isConflict, busySlots, slotPosition, timeStr }) => {
    return (
        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
            <div className='w-full space-y-5 sm:space-y-6'>
                {/* Standardized Header */}
                <div>
                    <div className='flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/5'>
                        <h3 className='text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest'>
                            Scheduling Verification
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isConflict ? 'bg-error-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isConflict ? 'text-error-500' : 'text-success-500'}`}>
                                {isConflict ? 'Conflict' : 'Clear'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status Card - Styled like Patient Note for consistency */}
                <div className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-500 ${
                    isConflict 
                        ? 'bg-error-50/50 dark:bg-error-500/5 border-error-100 dark:border-error-500/20 shadow-sm' 
                        : 'bg-success-50/50 dark:bg-success-500/5 border-success-100 dark:border-success-500/20'
                }`}>
                    <div className={`p-2 rounded-lg shadow-sm border shrink-0 ${
                        isConflict ? 'bg-white dark:bg-gray-800 border-error-100 dark:border-error-500/10' : 'bg-white dark:bg-gray-800 border-success-100 dark:border-success-500/10'
                    }`}>
                        {isConflict ? <X className="size-4 text-error-500" strokeWidth={3} /> : <Check className="size-4 text-success-500" strokeWidth={3} />}
                    </div>
                    <div className="space-y-1">
                        <span className={`block text-[10px] font-black uppercase tracking-widest ${isConflict ? 'text-error-700/60 dark:text-error-500/60' : 'text-success-700/60 dark:text-success-500/60'}`}>
                            {isConflict ? 'Automatic Conflict Alert' : 'Verification Success'}
                        </span>
                        <p className={`text-[13px] sm:text-sm font-bold leading-relaxed ${isConflict ? 'text-error-900/80 dark:text-error-200/70' : 'text-success-900/80 dark:text-success-200/70'}`}>
                            {isConflict 
                                ? "Conflict detected! The assigned Doctor has an existing commitment at this exact time." 
                                : "No scheduling conflict detected. This request is clear for administrative approval."}
                        </p>
                    </div>
                </div>

                {/* Interactive Schedule Bar */}
                <div className="pt-2 pb-6">
                    <div className="relative h-14 bg-gray-50/50 dark:bg-gray-950 rounded-2xl flex items-center overflow-visible border border-gray-100 dark:border-gray-800/50 shadow-inner px-6">
                        {busySlots.map((pos, idx) => {
                            const isSlotConflict = Math.abs(pos - slotPosition) < 8;
                            return (
                                <div 
                                    key={`busy-${idx}`}
                                    className={`absolute h-full top-0 w-[8%] border-x flex items-center justify-center transition-colors ${
                                        isSlotConflict 
                                            ? 'bg-error-500/20 dark:bg-error-500/30 border-error-500/50 z-10 animate-pulse' 
                                            : 'bg-gray-200/30 dark:bg-gray-800/40 border-white/5 dark:border-gray-700/10 grayscale'
                                    }`}
                                    style={{ left: `${pos}%` }}
                                >
                                    <span className={`text-[6px] font-black uppercase tracking-tighter hidden sm:block ${isSlotConflict ? 'text-error-600 dark:text-error-400' : 'text-gray-400'}`}>
                                        {isSlotConflict ? 'Conflict' : 'Busy'}
                                    </span>
                                </div>
                            );
                        })}
                        {slotPosition >= 0 && slotPosition <= 95 && (
                            <div 
                                className={`absolute h-[120%] top-[-10%] w-[12%] rounded-xl flex flex-col items-center justify-center shadow-theme-lg z-20 border-2 border-white dark:border-gray-900 transition-all duration-500 ${
                                    isConflict 
                                        ? 'bg-error-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                        : 'bg-brand-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                }`}
                                style={{ left: `${slotPosition}%` }}
                            >
                                <span className="text-[9px] font-black tabular-nums tracking-tighter leading-none">{timeStr}</span>
                                <span className="text-[6px] font-black uppercase opacity-60 mt-0.5 hidden sm:block">Req</span>
                            </div>
                        )}
                        <div className="absolute -bottom-5 left-0 w-full flex justify-between px-4">
                            {[9,11,1,3,5].map(h => (
                                <span key={h} className="text-[8px] font-bold text-gray-300 dark:text-gray-600 tracking-tighter tabular-nums uppercase">
                                    {h}{h > 8 && h < 12 ? 'am' : 'pm'}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-2 px-1 opacity-60">
                        <Info size={12} className="text-gray-400" />
                        <p className="text-[10px] font-medium text-gray-400">
                            The bar above visualizes the doctor's current bookings to prevent double-scheduling.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulingVerification;
