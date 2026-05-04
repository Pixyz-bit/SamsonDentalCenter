import React, { useState, useEffect } from 'react';
import { X, GitMerge, AlertCircle, CheckCircle2, User, ArrowRight, Loader2, Search, Info } from 'lucide-react';
import { api } from '../../../utils/api';

const MergePatientsModal = ({ isOpen, onClose, onMerged, token }) => {
    const [step, setStep] = useState('select'); // 'select' | 'confirm' | 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [sourceSearch, setSourceSearch] = useState('');
    const [targetSearch, setTargetSearch] = useState('');
    const [sourceResults, setSourceResults] = useState([]);
    const [targetResults, setTargetResults] = useState([]);
    
    const [sourcePatient, setSourcePatient] = useState(null);
    const [targetPatient, setTargetPatient] = useState(null);

    // Search Source
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (sourceSearch.length < 2) {
                setSourceResults([]);
                return;
            }
            try {
                const data = await api.get(`/admin/patients?search=${sourceSearch}`, token);
                setSourceResults(data.patients || []);
            } catch (err) {
                console.error(err);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [sourceSearch, token]);

    // Search Target
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (targetSearch.length < 2) {
                setTargetResults([]);
                return;
            }
            try {
                const data = await api.get(`/admin/patients?search=${targetSearch}`, token);
                setTargetResults(data.patients || []);
            } catch (err) {
                console.error(err);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [targetSearch, token]);

    if (!isOpen) return null;

    const handleMerge = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/admin/patients/merge', {
                source_id: sourcePatient.id,
                target_id: targetPatient.id
            }, token);
            setStep('success');
            if (onMerged) onMerged();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep('select');
        setSourcePatient(null);
        setTargetPatient(null);
        setSourceSearch('');
        setTargetSearch('');
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <GitMerge size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Merge Patient Records</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Consolidate duplicate profiles into one</p>
                        </div>
                    </div>
                    <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 'select' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                {/* Source Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source Profile (TO BE DELETED)</label>
                                    {sourcePatient ? (
                                        <div className="p-4 rounded-xl border-2 border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5 relative group">
                                            <button 
                                                onClick={() => setSourcePatient(null)}
                                                className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">{sourcePatient.full_name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{sourcePatient.full_name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{sourcePatient.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                            <input 
                                                value={sourceSearch}
                                                onChange={(e) => setSourceSearch(e.target.value)}
                                                placeholder="Search source patient..."
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition-all"
                                            />
                                            {sourceResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                                                    {sourceResults.map(p => (
                                                        <button 
                                                            key={p.id}
                                                            onClick={() => { setSourcePatient(p); setSourceResults([]); }}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-700 last:border-none flex items-center justify-between"
                                                        >
                                                            <span className="text-sm font-medium">{p.full_name}</span>
                                                            <span className="text-[10px] text-gray-400">{p.email}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 z-10">
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>

                                {/* Target Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Profile (PRIMARY)</label>
                                    {targetPatient ? (
                                        <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5 relative group">
                                            <button 
                                                onClick={() => setTargetPatient(null)}
                                                className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold">{targetPatient.full_name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{targetPatient.full_name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{targetPatient.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                            <input 
                                                value={targetSearch}
                                                onChange={(e) => setTargetSearch(e.target.value)}
                                                placeholder="Search target patient..."
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium transition-all"
                                            />
                                            {targetResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                                                    {targetResults.map(p => (
                                                        <button 
                                                            key={p.id}
                                                            onClick={() => { setTargetPatient(p); setTargetResults([]); }}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-gray-700 last:border-none flex items-center justify-between"
                                                        >
                                                            <span className="text-sm font-medium">{p.full_name}</span>
                                                            <span className="text-[10px] text-gray-400">{p.email}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl flex items-start gap-3">
                                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                                    Merging will move all appointments, records, and history from the Source patient to the Target patient. 
                                    <span className="font-bold block mt-1 uppercase text-[10px]">The source profile will be permanently deleted.</span>
                                </p>
                            </div>

                            <div className="pt-2">
                                <button 
                                    disabled={!sourcePatient || !targetPatient || sourcePatient.id === targetPatient.id}
                                    onClick={() => setStep('confirm')}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                >
                                    <span>Continue to Confirmation</span>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'confirm' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Merge Operation</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please review the details carefully before proceeding.</p>
                            </div>

                            <div className="flex items-stretch gap-4">
                                <div className="flex-1 p-4 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                                    <p className="text-[10px] font-black text-red-500 uppercase mb-2">Delete This</p>
                                    <p className="text-sm font-bold">{sourcePatient.full_name}</p>
                                    <p className="text-[10px] text-gray-500">{sourcePatient.email}</p>
                                </div>
                                <div className="flex items-center">
                                    <ArrowRight className="text-gray-300" />
                                </div>
                                <div className="flex-1 p-4 rounded-xl bg-brand-50/50 dark:bg-brand-500/5 text-center">
                                    <p className="text-[10px] font-black text-success-600 uppercase mb-2">Keep This</p>
                                    <p className="text-sm font-bold">{targetPatient.full_name}</p>
                                    <p className="text-[10px] text-gray-500">{targetPatient.email}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-900 text-white space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Items to be migrated:</p>
                                <ul className="text-xs space-y-1 text-gray-300 list-disc pl-4 font-medium">
                                    <li>All Medical Records & History</li>
                                    <li>Future & Past Appointments</li>
                                    <li>Financial Records & Invoices</li>
                                    <li>Profile Metadata & Notes</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setStep('select')}
                                    className="py-3.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleMerge}
                                    disabled={loading}
                                    className="py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
                                    <span>Execute Merge</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-500 mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Records Merged!</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-8">
                                All data has been successfully moved to <span className="font-bold text-gray-900 dark:text-white">{targetPatient?.full_name}</span>.
                            </p>
                            
                            <button 
                                onClick={resetAndClose}
                                className="w-full py-4 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
                            >
                                Finish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MergePatientsModal;
