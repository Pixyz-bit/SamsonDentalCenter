import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const SuccessState = ({ createdPatient }) => {
    return (
        <div className="py-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-3xl bg-green-500 text-white flex items-center justify-center mb-8 shadow-2xl shadow-green-500/40 rotate-3 animate-in zoom-in duration-500">
                <CheckCircle2 size={48} />
            </div>
            <h4 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Registration Successful!</h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4 font-medium">
                The profile for <span className="text-gray-900 dark:text-white font-bold">{createdPatient?.full_name}</span> has been created and is ready for use.
            </p>
        </div>
    );
};

export default SuccessState;
