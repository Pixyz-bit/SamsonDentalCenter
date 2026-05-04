import React from 'react';
import { AlertCircle, WifiOff, ServerCrash, Search } from 'lucide-react';
import { Button } from '../ui';

const PageError = ({ type = '500', message, onRetry, fullPage = false }) => {
    const errorConfigs = {
        '404': {
            icon: <Search className="text-amber-500" size={48} />,
            title: 'Page Not Found',
            description: message || "We couldn't find the resource you're looking for. It might have been moved or deleted.",
            bgColor: 'bg-amber-100 dark:bg-amber-500/10'
        },
        'network': {
            icon: <WifiOff className="text-red-500" size={48} />,
            title: 'Connection Lost',
            description: "You're offline or the server is unreachable. Please check your internet connection.",
            bgColor: 'bg-red-100 dark:bg-red-500/10'
        },
        '500': {
            icon: <ServerCrash className="text-brand-500" size={48} />,
            title: 'Server Error',
            description: message || "The server encountered an unexpected condition. Our engineers have been alerted.",
            bgColor: 'bg-brand-100 dark:bg-brand-500/10'
        }
    };

    const config = errorConfigs[type] || errorConfigs['500'];

    return (
        <div className={`flex flex-col items-center justify-center ${fullPage ? 'min-h-screen bg-white dark:bg-gray-900' : 'py-20'} px-6 text-center animate-in fade-in zoom-in duration-300`}>
            <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center mb-8 shadow-inner`}>
                {config.icon}
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                {config.title}
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 text-sm leading-relaxed font-medium">
                {config.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                {onRetry && (
                    <Button 
                        onClick={onRetry}
                        className="flex-1 h-12 bg-brand-500 text-white rounded-xl font-black shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Try Again
                    </Button>
                )}
                <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-black shadow-sm"
                >
                    Go Home
                </Button>
            </div>
        </div>
    );
};

export default PageError;
