import React from 'react';

const DependentSkeleton = () => {
    return (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col h-full animate-pulse">
            {/* Header: Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg w-1/2" />
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {[1, 2].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-800/50 rounded-full w-12" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-full" />
                    </div>
                ))}
            </div>

            {/* Action Area */}
            <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800/50">
                <div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-xl w-full" />
            </div>
        </div>
    );
};

export default DependentSkeleton;
