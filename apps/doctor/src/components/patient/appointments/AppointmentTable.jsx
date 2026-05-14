import AppointmentTableRow from './AppointmentTableRow';
import AppointmentSkeleton from './AppointmentSkeleton';
import { Calendar } from 'lucide-react';

const AppointmentTable = ({ 
    appointments, 
    loading, 
    error, 
    user, 
    openDropdown, 
    onToggleDropdown, 
    onViewDetails,
    onStartAppointment,
    onCreateInvoice 
}) => {
    return (
        <div className='flex flex-col grow min-h-[400px] md:min-h-[285px]'>
            {/* Loading skeleton */}
            {loading && <AppointmentSkeleton />}

            {/* Error */}
            {!loading && error && (
                <div className='flex items-center justify-center py-20 px-4 text-center text-sm text-error-500'>
                    {error}
                </div>
            )}

            {/* Empty */}
            {!loading && !error && appointments.length === 0 && (
                <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
                    <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4'>
                        <Calendar size={32} />
                    </div>
                    <h4 className='text-lg font-bold text-gray-800 dark:text-white mb-1'>No appointments found</h4>
                    <p className='text-sm text-gray-500'>Your schedule is looking clear!</p>
                </div>
            )}

            {/* Data rows */}
            <div className='overflow-y-auto grow pb-14 sm:pb-0 flex flex-col'>
                {!loading && !error && appointments.map((app) => (
                    <AppointmentTableRow 
                        key={app.id} 
                        appointment={app} 
                        user={user}
                        openDropdown={openDropdown}
                        onToggleDropdown={onToggleDropdown}
                        onViewDetails={onViewDetails}
                        onStartAppointment={onStartAppointment}
                        onCreateInvoice={onCreateInvoice}
                    />
                ))}
            </div>
        </div>
    );
};


export default AppointmentTable;
