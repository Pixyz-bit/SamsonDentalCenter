import React from 'react';

const SettingsSkeleton = () => {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden animate-pulse">
            <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 w-full">
                {/* 1. Notifications Section Skeleton */}
                <div className="mb-5 sm:mb-8">
                    <div className="px-4 sm:px-0 mb-4 space-y-2">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                    </div>
                    <div className="h-16 w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl" />
                </div>

                {/* 2. Account Security Section Skeleton */}
                <div className="mb-5 sm:mb-8">
                    <div className="px-4 sm:px-0 mb-4 space-y-2">
                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="h-3 w-56 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                    </div>
                    <div className="h-16 w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl" />
                </div>

                {/* 3. Danger Zone Section Skeleton */}
                <div className="mb-5 sm:mb-8">
                    <div className="px-4 sm:px-0 mb-4 space-y-2">
                        <div className="h-3 w-20 bg-red-100 dark:bg-red-900/20 rounded-full" />
                        <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                    </div>
                    <div className="h-16 w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export default SettingsSkeleton;
