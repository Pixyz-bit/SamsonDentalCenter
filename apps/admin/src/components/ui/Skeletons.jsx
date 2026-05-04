import React from 'react';

/**
 * Base skeleton pulse effect
 */
const SkeletonBase = ({ className = '', ...props }) => (
    <div 
        className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md ${className}`} 
        {...props} 
    />
);

export const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <SkeletonBase key={i} className="h-32 w-full" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonBase className="lg:col-span-2 h-96" />
            <SkeletonBase className="h-96" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
            <SkeletonBase className="h-10 w-48" />
            <SkeletonBase className="h-10 w-32" />
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 h-12 border-b border-gray-200 dark:border-gray-800" />
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 space-x-4">
                    <SkeletonBase className="h-6 w-1/4" />
                    <SkeletonBase className="h-6 w-1/4" />
                    <SkeletonBase className="h-6 w-1/4" />
                    <SkeletonBase className="h-6 w-1/8" />
                </div>
            ))}
        </div>
    </div>
);

export const ListSkeleton = ({ items = 6 }) => (
    <div className="space-y-4">
        {[...Array(items)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                <SkeletonBase className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-4 w-3/4" />
                    <SkeletonBase className="h-3 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export const FormSkeleton = () => (
    <div className="space-y-8 max-w-2xl">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
                <SkeletonBase className="h-4 w-24" />
                <SkeletonBase className="h-12 w-full" />
            </div>
        ))}
        <div className="flex space-x-4 pt-4">
            <SkeletonBase className="h-12 w-32" />
            <SkeletonBase className="h-12 w-32" />
        </div>
    </div>
);

export default SkeletonBase;
