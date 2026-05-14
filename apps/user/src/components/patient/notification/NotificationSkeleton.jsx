import React from 'react';

const NotificationSkeleton = ({ rows = 6 }) => {
    return (
        <div className="flex flex-col bg-white dark:bg-white/[0.03] overflow-hidden">
            {[...Array(rows)].map((_, i) => (
                <div 
                    key={i} 
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 animate-pulse"
                >
                    {/* Desktop View Skeleton */}
                    <div className="hidden sm:flex items-center gap-4 w-full">
                        <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 shrink-0" /> {/* Star */}
                        <div className="w-32 lg:w-40 h-5 bg-gray-100 dark:bg-gray-800 rounded shrink-0" /> {/* Category */}
                        <div className="flex-grow h-5 bg-gray-50 dark:bg-gray-800/50 rounded" /> {/* Title */}
                        <div className="w-20 h-3 bg-gray-50 dark:bg-gray-800/30 rounded shrink-0" /> {/* Time */}
                    </div>

                    {/* Mobile View Skeleton */}
                    <div className="flex sm:hidden gap-4 w-full">
                        <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800" /> {/* Icon */}
                        <div className="flex-grow flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded" /> {/* Category */}
                                <div className="h-2 w-12 bg-gray-50 dark:bg-gray-800/30 rounded" /> {/* Time */}
                            </div>
                            <div className="h-4 w-3/4 bg-gray-50 dark:bg-gray-800/50 rounded" /> {/* Title */}
                            <div className="flex justify-between items-center">
                                <div className="h-3 w-1/2 bg-gray-50 dark:bg-gray-800/20 rounded" /> {/* Message */}
                                <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800" /> {/* Star */}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSkeleton;
