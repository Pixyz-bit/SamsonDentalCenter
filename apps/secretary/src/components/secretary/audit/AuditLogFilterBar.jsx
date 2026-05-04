import React from 'react';
import { Input, Label } from '../../ui';

const AuditLogFilterBar = ({ filters, onFilterChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    return (
        <div className='w-full'>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='space-y-1'>
                    <Label className='text-[10px] uppercase font-bold text-gray-400'>Action Type</Label>
                    <select
                        name='action'
                        value={filters.action}
                        onChange={handleChange}
                        className='w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20'
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="LOGIN">LOGIN</option>
                    </select>
                </div>

                <div className='space-y-1'>
                    <Label className='text-[10px] uppercase font-bold text-gray-400'>Resource Type</Label>
                    <select
                        name='resource_type'
                        value={filters.resource_type}
                        onChange={handleChange}
                        className='w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20'
                    >
                        <option value="">All Resources</option>
                        <option value="appointments">Appointments</option>
                        <option value="profiles">Profiles</option>
                        <option value="dentists">Dentists</option>
                        <option value="dentist_schedule">Schedules</option>
                        <option value="services">Services</option>
                    </select>
                </div>

                <div className='space-y-1'>
                    <Label className='text-[10px] uppercase font-bold text-gray-400'>From Date</Label>
                    <Input
                        type='date'
                        name='date_from'
                        value={filters.date_from}
                        onChange={handleChange}
                        className='h-10 text-sm'
                    />
                </div>

                <div className='space-y-1'>
                    <Label className='text-[10px] uppercase font-bold text-gray-400'>To Date</Label>
                    <Input
                        type='date'
                        name='date_to'
                        value={filters.date_to}
                        onChange={handleChange}
                        className='h-10 text-sm'
                    />
                </div>
            </div>
        </div>
    );
};

export default AuditLogFilterBar;
