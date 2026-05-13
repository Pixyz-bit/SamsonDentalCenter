import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Calendar, 
    ShieldCheck, 
    Info, 
    LayoutDashboard,
    Check,
    ClipboardList,
    User,
    Home as HomeIcon,
} from 'lucide-react';

const UserRescheduleSuccess = ({ result, appointment, onReset }) => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Extract data from result (which contains the new appointment details from the API)
    const newAppt = result?.data?.new_appointment || {};
    // Fallback to appointment if newAppt is empty (though result is preferred)
    const serviceName = appointment?.service?.name || appointment?.service || 'Treatment';
    const duration = appointment?.service?.duration_minutes || 30;

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        try {
            return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) { return dateString; }
    };

    const formatTimeRange = (startTime, durationMinutes) => {
        if (!startTime) return '---';
        try {
            const [h, m] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(h, m, 0, 0);
            const endDate = new Date(startDate.getTime() + (durationMinutes || 30) * 60000);
            
            const format = (date) => {
                const hour = date.getHours();
                const min = date.getMinutes().toString().padStart(2, '0');
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${h12}:${min} ${ampm}`;
            };
            return `${format(startDate)} – ${format(endDate)}`;
        } catch (e) { return startTime; }
    };

    const getPatientName = () => {
        return newAppt.booked_for_name || appointment?.patient_name || appointment?.full_name || 'Self';
    };

    return (
        <div className="w-full max-w-[600px] mx-auto animate-in fade-in zoom-in-95 duration-1000 pb-20 sm:pb-8">
            {/* 1. Visual Confirmation */}
            <div className='mb-6 sm:mb-6 text-center px-4'>
                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-emerald-100 dark:border-emerald-500/20 shadow-theme-lg animate-in zoom-in-50 duration-700 delay-300'>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 animate-in fade-in zoom-in duration-500 delay-500">
                        <Check className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={4} />
                    </div>
                </div>
                <h2 className='text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2 sm:mb-3'>
                    Appointment Rescheduled!
                </h2>
                <p className='text-[13px] sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-sm mx-auto px-2'>
                    Your appointment has been successfully updated. We've sent the new details to <span className="text-brand-500 dark:text-brand-400 font-bold break-all">your registered email</span>.
                </p>
            </div>

            {/* 2. Request Summary Card */}
            <div className='mb-6 sm:mb-8 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden'>
                <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-brand-500" />
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">Updated Schedule</h3>
                    </div>
                    <div className="px-3 py-1.5 bg-brand-50/50 dark:bg-brand-500/10 rounded-full border border-brand-100/50 dark:border-brand-500/20 flex items-center shrink-0">
                        <span className="text-[10px] sm:text-xs font-black font-mono tracking-tighter">
                            <span className="text-brand-400 dark:text-brand-500 mr-1.5">REF</span>
                            <span className="text-brand-600 dark:text-brand-400">
                                {newAppt.id?.slice(0, 8).toUpperCase() || '#RESCHED'}
                            </span>
                        </span>
                    </div>
                </div>

                <div className="px-5 py-6 sm:px-10 sm:py-8">
                    <div className="space-y-5 sm:space-y-6">
                        {/* Service */}
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 border border-brand-100/50 dark:border-brand-800/50">
                                <ShieldCheck className="text-brand-500" size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Service</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                    {serviceName}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                                <Calendar className="text-gray-500" size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">New Date</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                    {formatDate(newAppt.date)}
                                </p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                                <Clock className="text-gray-500" size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">New Time Window</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                    {formatTimeRange(newAppt.start_time || newAppt.time, duration)}
                                </p>
                            </div>
                        </div>

                        {/* Patient */}
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                                <User className="text-gray-500" size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] sm:text-xs font-black text-gray-400 mb-1 leading-none">Patient</p>
                                <p className="text-[14px] sm:text-base font-bold text-gray-900 dark:text-white leading-tight capitalize">
                                    {getPatientName()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 sm:px-10 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-black text-gray-400 leading-none">Current Status</span>
                    {newAppt.status === 'CONFIRMED' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-100/50 dark:border-emerald-500/20 shadow-theme-xs">
                            <Check size={12} />
                            Confirmed
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-full text-[10px] sm:text-xs font-bold border border-amber-100/50 dark:border-amber-500/20 shadow-theme-xs">
                            <Clock size={12} className="animate-pulse" />
                            Awaiting Approval
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Next Steps Card */}
            <div className='mb-6 sm:mb-8 bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden'>
                <div className="px-5 pt-6 pb-5 sm:px-10 flex items-center gap-3 border-b border-brand-100/50 dark:border-brand-500/10">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                        <Info size={20} />
                    </div>
                    <h4 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                        What happens now?
                    </h4>
                </div>
                
                <div className="px-5 py-6 sm:px-10 sm:py-8">
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                            <p className="text-[12px] sm:text-[14px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                {newAppt.status === 'CONFIRMED' 
                                    ? "Your appointment is confirmed. We've updated our schedule and notified your dentist." 
                                    : "Our team will review your request and send a final confirmation within 24 hours."}
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                            <p className="text-[12px] sm:text-[14px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                                Your previous slot has been released and is now available for other patients.
                            </p>
                        </li>
                    </ul>
                </div>
            </div>

            {/* 4. Action Buttons (Sticky Footer on Mobile) */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4 sm:relative sm:bg-transparent sm:border-0 sm:p-0 sm:flex sm:flex-row gap-4 sm:mt-8 z-50">
                <div className="max-w-[600px] mx-auto flex flex-row gap-3 sm:w-full">
                    <button
                        onClick={() => { onReset(); navigate('/'); }}
                        className='flex-1 group flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all shadow-theme-xs'
                    >
                        <HomeIcon size={18} className="sm:size-[22px]" />
                        <span className="text-[11px] sm:text-base font-black uppercase tracking-widest">Home</span>
                    </button>
                    <button
                        onClick={() => { onReset(); navigate('/patient/appointments'); }}
                        className='flex-[2] flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black transition-all shadow-lg shadow-brand-500/20'
                    >
                        <LayoutDashboard size={20} className="sm:size-6" />
                        <span className="text-[11px] sm:text-lg font-black uppercase tracking-widest">Go to Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserRescheduleSuccess;
