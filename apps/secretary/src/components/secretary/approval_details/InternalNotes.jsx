import React from 'react';
import { StickyNote } from 'lucide-react';

const InternalNotes = ({ internalNote, setInternalNote, handleSaveNote, isSavingNote, saveSuccess }) => {
    return (
        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
            <div className='w-full'>
                <div className='flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/5'>
                    <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <StickyNote size={14} className="text-amber-500" /> Internal Staff Notes
                    </h3>
                    <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity duration-300 ${isSavingNote ? 'text-brand-500 opacity-100' : saveSuccess ? 'text-success-500 opacity-100' : 'opacity-0'}`}>
                        {isSavingNote ? 'Saving...' : 'Saved'}
                    </span>
                </div>
            </div>
            <div className="relative group">
                <textarea 
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    onBlur={handleSaveNote}
                    placeholder="Add private staff notes here (e.g. Patient prefers morning slots)..."
                    className="w-full h-28 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all resize-none shadow-theme-sm group-hover:shadow-theme-md"
                />
                <div className="absolute bottom-3 right-3 transition-opacity">
                    <button 
                        onClick={handleSaveNote}
                        className="px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/20 active:scale-95 transition-all shadow-theme-sm border border-brand-100 dark:border-brand-500/20"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InternalNotes;
