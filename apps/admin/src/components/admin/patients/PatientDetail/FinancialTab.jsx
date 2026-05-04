import React from 'react';
import { CreditCard } from 'lucide-react';

const FinancialTab = ({ patient }) => {
    return (
        <div className='p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center py-20'>
            <CreditCard size={40} className='mx-auto text-gray-300 dark:text-gray-700 mb-4' />
            <h4 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>Billing History</h4>
            <p className='text-xs text-gray-500 mt-2'>No outstanding invoices for this patient.</p>
        </div>
    );
};

export default FinancialTab;
