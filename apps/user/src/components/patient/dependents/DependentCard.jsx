import React from 'react';
import { Edit2, Calendar, User, Heart } from 'lucide-react';
import { Button } from '../../ui';

const DependentCard = ({ dependent, onEdit }) => {
    const { 
        full_name, 
        first_name, 
        last_name, 
        relationship, 
        date_of_birth, 
        sex 
    } = dependent;

    const formattedDob = date_of_birth ? new Date(date_of_birth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A';

    return (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
            {/* Header: Avatar & Name */}
            <div className="flex items-center gap-4 mb-5 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 text-lg sm:text-xl font-bold shadow-inner shrink-0 ring-1 ring-brand-100 dark:ring-brand-900/30">
                    {first_name?.[0]}{last_name?.[0]}
                </div>
                <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                        {full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100/50 dark:border-brand-900/30">
                            <Heart size={10} className="text-brand-500 fill-brand-500" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                {relationship}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 sm:mb-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Birthday</p>
                    <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                        <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{formattedDob}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">Sex</p>
                    <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                        <User size={14} className="text-gray-400 dark:text-gray-500" />
                        <span>{sex || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800/50">
                <Button 
                    onClick={() => onEdit(dependent)}
                    variant="outline"
                    className="w-full h-10 sm:h-11 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-[13px] font-bold border-gray-100 dark:border-gray-800 hover:border-brand-500 hover:text-brand-500 group-hover:bg-brand-50/30 dark:group-hover:bg-brand-500/5 transition-all shadow-theme-sm"
                >
                    <Edit2 size={15} />
                    Edit Profile
                </Button>
            </div>
        </div>
    );
};

export default DependentCard;
