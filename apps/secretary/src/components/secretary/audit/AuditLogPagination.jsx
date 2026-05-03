import React from 'react';
import { Button } from '../../ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AuditLogPagination = ({ metadata, onPageChange }) => {
    const { page, totalPages } = metadata;

    if (totalPages <= 1) return null;

    return (
        <div className='flex items-center justify-between'>

            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                Page {page} of {totalPages}
            </p>
            <div className='flex items-center gap-2'>
                <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className='h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-800'
                >
                    <ChevronLeft size={16} />
                </Button>
                <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className='h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-800'
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export default AuditLogPagination;
