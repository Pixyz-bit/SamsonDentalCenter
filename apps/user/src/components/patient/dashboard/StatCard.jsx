import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'brand', link = null, loading = false }) => {
    const valueRef = useRef(null);
    const [displayValue, setDisplayValue] = useState('0');
    const prevValue = useRef(0);

    const colorClasses = {
        brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
        success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        warning: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
        info: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400',
    };

    useEffect(() => {
        if (!loading && typeof value === 'string' && !isNaN(value)) {
            const target = parseInt(value, 10);
            const obj = { val: prevValue.current };
            
            gsap.to(obj, {
                val: target,
                duration: 1,
                ease: "power2.out",
                onUpdate: () => {
                    setDisplayValue(Math.floor(obj.val).toString());
                }
            });
            prevValue.current = target;
        } else if (!loading) {
            setDisplayValue(value);
        }
    }, [value, loading]);

    if (loading) {
        return (
            <div className='relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4 p-4 min-h-[100px] animate-pulse'>
                <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0' />
                <div className='flex-grow space-y-2'>
                    <div className='h-6 w-12 bg-gray-100 dark:bg-gray-800 rounded' />
                    <div className='h-4 w-20 bg-gray-50 dark:bg-gray-800/50 rounded' />
                </div>
            </div>
        );
    }

    return (
        <div className='relative rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-3 sm:gap-4 px-4 py-3.5 min-h-[70px] sm:min-h-[90px] h-full transition-all hover:shadow-md'>
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 ${colorClasses[color] || colorClasses.brand}`}>
                {Icon && <Icon size={18} className="sm:w-[22px] sm:h-[22px]" />}
            </div>

            {/* Content */}
            <div className='flex-grow min-w-0 flex flex-col justify-center'>
                <span className='text-[12px] sm:text-[13px] text-gray-700 dark:text-gray-400 font-medium truncate mb-0.5'>
                    {title}
                </span>
                <div className='flex items-center justify-between gap-1'>
                    <h4 className='text-xl sm:text-2xl lg:text-[26px] font-medium text-gray-900 dark:text-white truncate leading-tight tabular-nums tracking-tight'>
                        {displayValue}
                    </h4>
                    {link && (
                        <div className='hidden sm:flex items-center justify-center w-8 h-8 text-gray-300 group-hover:text-brand-500 transition-all shrink-0'>
                            <ArrowUpRight size={20} strokeWidth={2.5} />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile tap overlay for linked cards */}
            {link && (
                <Link to={link} className='absolute inset-0 sm:hidden z-10' aria-label={`View ${title}`} />
            )}
        </div>
    );
};

export default StatCard;
