import AppointmentTableRow from './AppointmentTableRow';
import AppointmentSkeleton from './AppointmentSkeleton';
import { Calendar } from 'lucide-react';

const AppointmentTable = ({ appointments, loading, error, user, openDropdown, onToggleDropdown, onViewDetails }) => {
    return (
        <div className='flex flex-col grow min-h-120 md:min-h-140'>
            {/* Loading skeleton - only show on initial load with no data */}
            {loading && appointments.length === 0 && <AppointmentSkeleton />}

            {/* Error */}
            {!loading && error && appointments.length === 0 && (
                <div className='flex items-center justify-center py-20 px-4 text-center text-sm text-error-500'>
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && appointments.length === 0 && (
                <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
                    <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4'>
                        <Calendar size={32} />
                    </div>
                    <h4 className='text-lg font-bold text-gray-800 dark:text-white mb-1'>No appointments found</h4>
                    <p className='text-sm text-gray-500'>Your schedule is looking clear!</p>
                </div>
            )}

            {/* Data cards - show even if loading in background */}
            <div className='overflow-y-auto grow pb-24 sm:pb-8 flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 no-scrollbar'>
                {appointments.map((app) => (
                    <AppointmentTableRow 
                        key={app.id} 
                        appointment={app} 
                        user={user}
                        openDropdown={openDropdown}
                        onToggleDropdown={onToggleDropdown}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        </div>
    );
};

export default AppointmentTable;
