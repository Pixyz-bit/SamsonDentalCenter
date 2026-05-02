import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Send, CornerDownRight } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { api } from '../../../../utils/api';
import PageBreadcrumb from '../../../../components/common/PageBreadcrumb';

// Mock data kept as fallback/demonstration as requested by user
const MOCK_LOGS = [
    { id: 'm1', channel: 'email', recipient: 'john@example.com', purpose: 'OTP', status: 'delivered', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'm2', channel: 'email', recipient: 'jane@example.com', purpose: 'CONFIRMATION', status: 'opened', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 'm3', channel: 'sms', recipient: '+639123456789', purpose: 'REMINDER_24H', status: 'sent', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'm4', channel: 'email', recipient: 'bounced@example.com', purpose: 'OTP', status: 'bounced', error_details: 'Invalid email address', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: 'm5', channel: 'email', recipient: 'spam@example.com', purpose: 'REMINDER_48H', status: 'complained', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'm6', channel: 'sms', recipient: '+639000000000', purpose: 'OTP', status: 'failed', error_details: 'Number inactive', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

const MessageActivityPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/message-logs');
            const realLogs = response.data.logs || [];
            
            // Prepend real logs to mock logs so the user can see both for now
            // Once real data builds up, we can remove MOCK_LOGS
            setLogs([...realLogs, ...MOCK_LOGS]);
        } catch (err) {
            console.error('Error fetching logs:', err);
            showToast('Failed to fetch real message logs. Showing demo data instead.', 'warning');
            setLogs(MOCK_LOGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'delivered': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'opened': return <CheckCircle size={14} className="text-blue-500" />;
            case 'clicked': return <CornerDownRight size={14} className="text-purple-500" />;
            case 'sent': return <Send size={14} className="text-indigo-500" />;
            case 'queued': return <Clock size={14} className="text-amber-500" />;
            case 'bounced': 
            case 'failed': return <XCircle size={14} className="text-red-500" />;
            case 'complained': return <AlertCircle size={14} className="text-orange-500" />;
            default: return <Clock size={14} className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const base = "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit";
        switch(status) {
            case 'delivered': return <span className={`${base} bg-emerald-50 text-emerald-600 border border-emerald-100`}>{getStatusIcon(status)} Delivered</span>;
            case 'opened': return <span className={`${base} bg-blue-50 text-blue-600 border border-blue-100`}>{getStatusIcon(status)} Opened</span>;
            case 'clicked': return <span className={`${base} bg-purple-50 text-purple-600 border border-purple-100`}>{getStatusIcon(status)} Clicked</span>;
            case 'sent': return <span className={`${base} bg-indigo-50 text-indigo-600 border border-indigo-100`}>{getStatusIcon(status)} Sent</span>;
            case 'queued': return <span className={`${base} bg-amber-50 text-amber-600 border border-amber-100`}>{getStatusIcon(status)} Queued</span>;
            case 'bounced': return <span className={`${base} bg-red-50 text-red-600 border border-red-100`}>{getStatusIcon(status)} Bounced</span>;
            case 'failed': return <span className={`${base} bg-red-50 text-red-600 border border-red-100`}>{getStatusIcon(status)} Failed</span>;
            case 'complained': return <span className={`${base} bg-orange-50 text-orange-600 border border-orange-100`}>{getStatusIcon(status)} Complained</span>;
            default: return <span className={`${base} bg-gray-100 text-gray-600 border border-gray-200`}>{getStatusIcon(status)} Unknown</span>;
        }
    };

    return (
        <div className='flex flex-col h-full'>
            <div className='sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6'>
                <div className='py-4'>
                    <PageBreadcrumb pageTitle="Message Activity" />
                </div>
            </div>

            <div className='space-y-6 flex-grow'>
                <div className='p-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-8 bg-white dark:bg-white/[0.03] shadow-sm'>
                    <div className='flex items-center justify-between mb-8'>
                        <div>
                            <h4 className='text-xl font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                                Communication logs
                            </h4>
                            <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-black'>
                                Real-time delivery status of automated emails and SMS
                            </p>
                        </div>
                        <div className='flex gap-3'>
                            <button 
                                onClick={fetchLogs}
                                disabled={loading}
                                className='flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50'
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className='border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left border-collapse'>
                                <thead>
                                    <tr className='bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800'>
                                        <th className='p-5 text-[10px] font-black text-gray-400 uppercase tracking-wider'>Time</th>
                                        <th className='p-5 text-[10px] font-black text-gray-400 uppercase tracking-wider'>Channel</th>
                                        <th className='p-5 text-[10px] font-black text-gray-400 uppercase tracking-wider'>Recipient</th>
                                        <th className='p-5 text-[10px] font-black text-gray-400 uppercase tracking-wider'>Purpose</th>
                                        <th className='p-5 text-[10px] font-black text-gray-400 uppercase tracking-wider'>Status</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                                    {loading && logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <RefreshCw size={24} className="animate-spin text-brand-500" />
                                                    <span className="text-sm font-bold text-gray-500">Loading activity logs...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Mail size={24} className="text-gray-300" />
                                                    <span className="text-sm font-bold text-gray-500">No message activity found.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className='bg-white dark:bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors'>
                                                <td className='p-5 text-xs font-bold text-gray-500 whitespace-nowrap'>
                                                    {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className='p-5 whitespace-nowrap'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className={`p-1.5 rounded-lg ${log.channel === 'email' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' : 'bg-brand-50 text-brand-500 dark:bg-brand-500/10'}`}>
                                                            {log.channel === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                                                        </div>
                                                        <span className='text-[10px] font-black uppercase text-gray-700 dark:text-gray-300'>{log.channel}</span>
                                                    </div>
                                                </td>
                                                <td className='p-5'>
                                                    <span className='text-sm font-black text-gray-900 dark:text-white font-outfit'>
                                                        {log.recipient}
                                                    </span>
                                                </td>
                                                <td className='p-5 whitespace-nowrap'>
                                                    <span className='text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1 rounded-md'>
                                                        {log.purpose.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className='p-5 whitespace-nowrap'>
                                                    <div className="flex flex-col gap-1">
                                                        {getStatusBadge(log.status)}
                                                        {log.error_details && (
                                                            <span className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate font-medium" title={log.error_details}>
                                                                {log.error_details}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className='mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' />
                                <span className='text-[10px] font-black uppercase tracking-widest text-gray-500'>Live monitoring active</span>
                            </div>
                            <span className='text-gray-200 dark:text-gray-800'>|</span>
                            <p className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Showing latest 50 messages</p>
                        </div>
                        <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 italic'>
                            Statuses are updated via webhooks from Resend/PhilSMS providers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageActivityPage;
