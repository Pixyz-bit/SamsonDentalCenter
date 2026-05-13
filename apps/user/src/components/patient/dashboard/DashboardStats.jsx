import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';
import StatCard from './StatCard';
import { formatDate, formatTime } from '../../../hooks/useAppointments';
import { Link } from 'react-router-dom';

const DashboardStats = ({ appointments = [], totalAppointments = 0, loading = false }) => {
    const scrollRef = React.useRef(null);
    const [scrolled, setScrolled] = React.useState(false);

    const handleScroll = () => {
        if (scrollRef.current) {
            setScrolled(scrollRef.current.scrollLeft > 20);
        }
    };

    // Latest Appointment — most recently created
    const latestAppt = [...appointments]
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))[0];

    const pendingCount = appointments.filter(a => (a.status || '').toUpperCase() === 'PENDING').length;
    const approvedCount = appointments.filter(a => {
        const s = (a.status || '').toUpperCase();
        const as = (a.approval_status || '').toLowerCase();
        const isApproved = s === 'CONFIRMED' || as === 'approved';
        const isInactive = ['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'RESCHEDULED'].includes(s);
        return isApproved && !isInactive;
    }).length;

    const serviceName = loading ? '…' : (latestAppt ? latestAppt.service?.name || latestAppt.service : null);

    return (
        <div className='flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-5 min-w-0'>
            {/* ── Card 1: Latest Appointment (Compact & High-Hierarchy) ── */}
            <div className='lg:col-span-3 group relative rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.02] transition-all duration-300 hover:shadow-lg hover:border-brand-500/30 overflow-hidden'>
                <div className='relative flex items-center w-full px-5 sm:px-6 py-4 sm:py-4.5 gap-4 sm:gap-6'>
                    {/* Compact Icon */}
                    <div className='shrink-0'>
                        <div className='flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/10 group-hover:scale-105 transition-transform'>
                            <Calendar size={24} strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Hierarchy-focused Content */}
                    <div className='flex-grow min-w-0'>
                        <p className='text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5'>
                            Upcoming Session
                        </p>
                        <h3 className='text-[17px] sm:text-[22px] font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-brand-500 transition-colors'>
                            {loading ? 'Loading...' : (serviceName || 'No Scheduled Visit')}
                        </h3>
                        
                        {latestAppt && !loading && (
                            <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5 font-medium'>
                                <span className='text-[12px] sm:text-[14px] text-gray-900 dark:text-white'>{formatDate(latestAppt.date)}</span>
                                <div className='hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20 shrink-0' />
                                <span className='text-[12px] sm:text-[14px] text-brand-500'>
                                    {formatTime(latestAppt.start_time)} - {formatTime(latestAppt.end_time)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* View Action - Discreet but visible */}
                    {latestAppt && !loading && (
                        <div className="shrink-0 text-gray-300 group-hover:text-brand-500 transition-all transform group-hover:translate-x-1">
                            <ArrowUpRight size={22} strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                {/* Overlay Link */}
                {latestAppt && !loading && (
                    <Link to={`/patient/appointments/${latestAppt.id}`} className='absolute inset-0 z-10' />
                )}
            </div>

            {/* ── Cards 2-3: Secondary Stats (Balanced Compactness) ── */}
            <div className='lg:col-span-2 grid grid-cols-2 gap-4 sm:gap-5'>
                <StatCard
                    title='Pending'
                    value={pendingCount.toString()}
                    icon={AlertCircle}
                    color='warning'
                    loading={loading}
                />
                <StatCard
                    title='Approved'
                    value={approvedCount.toString()}
                    icon={CheckCircle2}
                    color='success'
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default DashboardStats;
