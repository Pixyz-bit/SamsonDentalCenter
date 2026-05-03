import React from 'react';
import { Button } from '../../ui';
import { getFriendlyAction } from '../../../utils/auditUtils';
import { 
    Plus, 
    RefreshCw, 
    Trash2, 
    User, 
    Shield, 
    Activity,
    ChevronRight,
    Lock
} from 'lucide-react';

// ── Sample Data ──
const SAMPLE_LOGS = [
    {
        id: '1',
        action: 'UPDATE_GLOBAL_SCHEDULE',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T22:30:00Z',
        resource_name: 'dentist_schedule: 7a05774c-5073-4b02-9e5c-02a934e62c3e'
    },
    {
        id: '2',
        action: 'UPDATE_GLOBAL_SCHEDULE',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T22:20:00Z',
        resource_name: 'dentist_schedule: 7a05774c-5073-4b02-9e5c-02a934e62c3e'
    },
    {
        id: '3',
        action: 'UPDATE_GLOBAL_SCHEDULE',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T22:20:00Z',
        resource_name: 'dentist_schedule: 7a05774c-5073-4b02-9e5c-02a934e62c3e'
    },
    {
        id: '4',
        action: 'UPDATE_GLOBAL_SCHEDULE',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T22:18:00Z',
        resource_name: 'dentist_schedule: 7a05774c-5073-4b02-9e5c-02a934e62c3e'
    },
    {
        id: '5',
        action: 'UPDATE_GLOBAL_SCHEDULE',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T22:16:00Z',
        resource_name: 'dentist_schedule: 7a05774c-5073-4b02-9e5c-02a934e62c3e'
    },
    {
        id: '6',
        action: 'DELETE_CLINIC_HOLIDAY',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T21:03:00Z',
        resource_name: 'holidays: 635ab42c-4037-422d-ad61-8bfccc25f21f'
    },
    {
        id: '7',
        action: 'ADD_CLINIC_HOLIDAY',
        actor_name: 'Clinic Admin',
        actor_role: 'admin',
        created_at: '2026-05-03T20:55:00Z',
        resource_name: 'holidays: 635ab42c-4037-422d-ad61-8bfccc25f21f'
    }
];

const AuditLogTable = ({ onViewDetails, loading }) => {
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const getActionTheme = (action) => {
        if (action.includes('CREATE')) return { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/5', border: 'border-emerald-100 dark:border-emerald-500/10', icon: <Plus size={14} /> };
        if (action.includes('UPDATE')) return { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/5', border: 'border-blue-100 dark:border-blue-500/10', icon: <RefreshCw size={14} /> };
        if (action.includes('DELETE')) return { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/5', border: 'border-rose-100 dark:border-rose-500/10', icon: <Trash2 size={14} /> };
        return { color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-500/5', border: 'border-slate-100 dark:border-slate-500/10', icon: <Activity size={14} /> };
    };

    if (loading) {
        return (
            <div className='grow flex items-center justify-center py-20'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-8 h-8 border-[3px] border-slate-200 border-t-brand-500 rounded-full animate-spin' />
                    <p className='text-[11px] text-slate-400 font-bold uppercase tracking-widest'>Syncing Logs</p>
                </div>
            </div>
        );
    }

    const logs = SAMPLE_LOGS;

    return (
        <div className='grow relative pt-4 pb-12 sm:px-2'>
            {/* Minimalist Timeline Rail - Hidden on mobile for more space */}
            <div className='absolute left-[24px] top-0 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block' />

            <div className='space-y-4'>
                {logs.map((log) => {
                    const theme = getActionTheme(log.action);
                    return (
                        <div key={log.id} className='relative flex items-center gap-4 sm:gap-6 group'>
                            {/* Precise Timeline Node - Responsive sizing */}
                            <div className='relative z-10 hidden sm:block shrink-0'>
                                <div className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border ${theme.border} shadow-sm transition-all duration-300`}>
                                    <div className={`${theme.color}`}>
                                        {theme.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Neat Row Card - Fluid layout */}
                            <div className='grow flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200 gap-4 sm:gap-6'>
                                
                                {/* Section 1: Identity & Time */}
                                <div className='flex items-center gap-3 sm:gap-4 min-w-0 md:min-w-[200px]'>
                                    <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0'>
                                        <User size={18} className='text-slate-400 sm:size-[20px]' />
                                    </div>
                                    <div className='flex flex-col min-w-0'>
                                        <span className='text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white leading-none truncate'>
                                            {log.actor_name || 'System'}
                                        </span>
                                        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2'>
                                            <span className='text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0'>
                                                {log.actor_role || 'Auto'}
                                            </span>
                                            <div className='w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-slate-200 dark:bg-slate-700' />
                                            <span className='text-[10px] font-medium text-slate-400 truncate'>
                                                {formatTimestamp(log.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Action Details - Improved flow */}
                                <div className='grow flex flex-col gap-1.5 px-0 md:px-4'>
                                    <div className='flex items-center gap-2'>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${theme.bg} ${theme.color} ${theme.border}`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className='flex flex-wrap items-center gap-x-2 text-[12px] sm:text-[13px]'>
                                        <span className='text-slate-600 dark:text-slate-400 font-medium'>
                                            {getFriendlyAction(log.action)}
                                        </span>
                                        <span className='text-slate-300 dark:text-slate-600 font-black uppercase text-[9px]'>for</span>
                                        <span className='text-[11px] font-mono text-brand-600 dark:text-brand-400 bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10 break-all w-full mt-1 sm:w-auto sm:mt-0' title={log.resource_name}>
                                            {log.resource_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Section 3: Action Button - Adaptive width */}
                                <div className='shrink-0 mt-2 md:mt-0'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => onViewDetails(log)}
                                        className='h-10 sm:h-9 w-full md:w-auto px-6 rounded-xl sm:rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 text-slate-600 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2'
                                    >
                                        Details
                                        <ChevronRight size={14} className='opacity-40' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AuditLogTable;
