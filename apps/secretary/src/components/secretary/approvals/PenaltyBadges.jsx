import { OctagonAlert, CalendarX, ShieldAlert, ShieldCheck } from 'lucide-react';

const PenaltyBadges = ({ 
    noShowCount = 0, 
    cancellationCount = 0, 
    completedCount = 0,
    isBookingRestricted = false,
    minimal = false
}) => {
    if (minimal) {
        return (
            <div className="flex items-center gap-1.5">
                <div title={`${completedCount} Completed`} className={`p-1.5 rounded-lg bg-success-50 text-success-600 border border-success-100 ${completedCount === 0 ? 'opacity-30' : ''}`}>
                    <ShieldCheck className="size-3" />
                </div>
                <div title={`${noShowCount} No-Shows`} className={`p-1.5 rounded-lg ${noShowCount > 0 ? 'bg-error-50 text-error-600 border border-error-100' : 'bg-gray-50 text-gray-400'}`}>
                    <OctagonAlert className="size-3" />
                </div>
                <div title={`${cancellationCount} Cancellations`} className={`p-1.5 rounded-lg ${cancellationCount > 0 ? 'bg-warning-50 text-warning-600 border border-warning-100' : 'bg-gray-50 text-gray-400'}`}>
                    <CalendarX className="size-3" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-success-50 text-success-600 border border-success-100 ${
                completedCount === 0 ? 'opacity-50 grayscale' : ''
            }`}>
                <ShieldCheck className="size-3.5" />
                <span>{completedCount} Completed</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                noShowCount > 0 ? 'bg-error-50 text-error-600 border border-error-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
            }`}>
                <OctagonAlert className="size-3.5" />
                <span>{noShowCount} No-Shows</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                cancellationCount > 0 ? 'bg-warning-50 text-warning-600 border border-warning-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
            }`}>
                <CalendarX className="size-3.5" />
                <span>{cancellationCount} Cancellations</span>
            </div>
            {isBookingRestricted && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
                    <ShieldAlert className="size-3.5" />
                    <span>Booking Restricted</span>
                </div>
            )}
        </div>
    );
};

export default PenaltyBadges;
