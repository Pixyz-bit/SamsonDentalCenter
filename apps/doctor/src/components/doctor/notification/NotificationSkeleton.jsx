import React from 'react';

const NotificationSkeleton = ({ rows = 6 }) => {
    return (
        <div className="flex flex-col grow animate-pulse">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-4 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="hidden sm:block w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded shrink-0" />
                    <div className="hidden sm:block w-32 bg-gray-100 dark:bg-gray-800 h-4 rounded shrink-0" />
                    <div className="grow space-y-2">
                        <div className="w-1/3 bg-gray-100 dark:bg-gray-800 h-4 rounded" />
                        <div className="w-2/3 bg-gray-50 dark:bg-gray-800/50 h-3 rounded" />
                    </div>
                    <div className="hidden sm:block w-24 bg-gray-100 dark:bg-gray-800 h-3 rounded shrink-0" />
                </div>
            ))}
        </div>
    );
};

export default NotificationSkeleton;
