import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const RealTimeClock = ({ className = "" }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800 mb-3 sm:mb-2 ${className}`}>
            <Clock size={14} className="text-brand-500 shrink-0 animate-pulse" />
            <span className="font-outfit tabular-nums tracking-tight">
                {time.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    second: '2-digit', 
                    hour12: true 
                })}
            </span>
        </div>
    );
};

export default RealTimeClock;
