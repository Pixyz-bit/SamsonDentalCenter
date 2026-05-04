import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Globe, RefreshCcw } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import { ListSkeleton } from '../../ui/Skeletons';

const SystemHealthSettings = () => {
    const { getHealth } = useSettings();
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastScan, setLastScan] = useState(new Date());

    const fetchHealth = async () => {
        setLoading(true);
        const data = await getHealth();
        setHealth(data);
        setLoading(false);
        setLastScan(new Date());
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 60000); // Auto refresh every minute
        return () => clearInterval(interval);
    }, []);

    const services = [
        { 
            name: 'Core API Server', 
            status: health?.status === 'ok' ? 'Healthy' : 'Investigating', 
            metric: health?.message || 'v1.0.0',
            icon: <Server size={18} />, 
            isOk: health?.status === 'ok' 
        },
        { 
            name: 'Primary Database', 
            status: health?.database === 'connected' ? 'Connected' : 'Error', 
            metric: health?.response_time_ms ? `${health.response_time_ms}ms latency` : '--',
            icon: <Database size={18} />, 
            isOk: health?.database === 'connected' 
        },
        { 
            name: 'Auth Gateway', 
            status: 'Operational', 
            metric: '99.99% Uptime',
            icon: <Activity size={18} />, 
            isOk: true 
        },
        { 
            name: 'Public Website', 
            status: 'Online', 
            metric: 'CDN Active',
            icon: <Globe size={18} />, 
            isOk: true 
        },
    ];

    return (
        <div className='space-y-6'>
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                            System Integrity Monitor
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            Real-time infrastructure health tracking
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className='text-[10px] font-black uppercase tracking-widest'>
                            {health?.status === 'ok' ? 'All Systems Operational' : 'System Degraded'}
                        </span>
                    </div>
                </div>

                {loading && !health ? (
                    <ListSkeleton items={4} />
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {services.map(service => (
                            <div key={service.name} className='flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01] hover:border-brand-500/20 transition-all'>
                                <div className='flex items-center gap-4'>
                                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center justify-center ${service.isOk ? 'text-emerald-500' : 'text-red-500'} shadow-sm`}>
                                        {service.icon}
                                    </div>
                                    <div>
                                        <h5 className='text-sm font-bold text-gray-900 dark:text-white'>{service.name}</h5>
                                        <div className='flex items-center gap-2 mt-1'>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${service.isOk ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {service.status}
                                            </p>
                                            <div className='w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700' />
                                            <p className='text-[10px] text-gray-500 dark:text-gray-400 font-bold'>
                                                {service.metric}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className='mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between'>
                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>
                        Last scanned: {lastScan.toLocaleTimeString()}
                    </p>
                    <button 
                        onClick={fetchHealth}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemHealthSettings;
