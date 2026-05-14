import React from 'react';

const ProfileSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Meta Card Skeleton */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
                    <div className='flex flex-col items-center w-full gap-6 xl:flex-row'>
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
                        <div className='flex flex-col items-center xl:items-start gap-3'>
                            <div className="h-6 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            <div className="flex gap-3">
                                <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full xl:w-24 h-11 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
            </div>

            {/* Info Card Skeletons */}
            {[...Array(2)].map((_, i) => (
                <div key={i} className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                    <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                        <div className="flex-1 w-full">
                            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />
                            <div className='grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8'>
                                {[...Array(i === 0 ? 6 : 4)].map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <div className="h-2.5 w-16 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-24 h-11 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfileSkeleton;
