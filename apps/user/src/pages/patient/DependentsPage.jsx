import React, { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { useDependents } from '../../hooks/useDependents';
import DependentCard from '../../components/patient/dependents/DependentCard';
import DependentSkeleton from '../../components/patient/dependents/DependentSkeleton';
import AddDependentModal from '../../components/patient/dependents/AddDependentModal';
import { Plus, Search, Users, ShieldAlert, Info } from 'lucide-react';
import ErrorState from '../../components/common/ErrorState';
import { CLINIC_CONFIG } from '../../utils/constants';

const DependentsPage = () => {
    const { 
        dependents, 
        loading, 
        error, 
        addDependent, 
        updateDependent, 
        refresh
    } = useDependents();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDependent, setEditingDependent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [relationshipFilter, setRelationshipFilter] = useState('all');

    const maxDependents = CLINIC_CONFIG.MAX_DEPENDENTS_PER_USER;
    const currentCount = dependents.length;
    const isLimitReached = currentCount >= maxDependents;

    const filteredDependents = dependents.filter(p => {
        const matchesSearch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.relationship?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRelationship = relationshipFilter === 'all' || p.relationship === relationshipFilter;
        return matchesSearch && matchesRelationship;
    });

    const handleAddClick = () => {
        if (isLimitReached) return;
        setEditingDependent(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (dependent) => {
        setEditingDependent(dependent);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        if (editingDependent) {
            await updateDependent(editingDependent.id, formData);
        } else {
            await addDependent(formData);
        }
    };

    return (
        <>
            <PageBreadcrumb pageTitle='Family Members' className="mb-4" />
            
            <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
                {error ? (
                    <ErrorState 
                        error={error} 
                        onRetry={refresh} 
                        title="Unable to load family members"
                    />
                ) : (
                    <>
                        {/* Toolbar Container */}
                        <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                            {/* Search & Add Row */}
                            <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                                <div className='relative flex-grow w-full'>
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search family members...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                                    />
                                </div>

                                <button
                                    onClick={handleAddClick}
                                    disabled={isLimitReached}
                                    className={`hidden sm:flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-md shrink-0 whitespace-nowrap ${
                                        isLimitReached
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                            : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
                                    }`}
                                >
                                    <Plus size={18} />
                                    <span>Add Family Member</span>
                                </button>
                            </div>

                            {/* Filters & Quota Row */}
                            <div className='px-4 sm:px-6 pb-5 pt-2 flex flex-wrap items-center justify-between gap-4'>
                                <div className='flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-2'>
                                    {/* Relationship Filter */}
                                    <div className='relative w-[160px] sm:w-[180px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <Users size={16} />
                                        </div>
                                        <select
                                            value={relationshipFilter}
                                            onChange={(e) => setRelationshipFilter(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer'
                                        >
                                            <option value='all' className='dark:bg-gray-900'>All Relationships</option>
                                            <option value='Child' className='dark:bg-gray-900'>Children</option>
                                            <option value='Spouse' className='dark:bg-gray-900'>Spouse</option>
                                            <option value='Parent' className='dark:bg-gray-900'>Parents</option>
                                            <option value='Sibling' className='dark:bg-gray-900'>Siblings</option>
                                            <option value='Other' className='dark:bg-gray-900'>Others</option>
                                        </select>
                                        <div className='absolute right-4 top-4 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>
                                </div>

                                {/* Quota Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black tracking-widest transition-all ${
                                    isLimitReached 
                                        ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' 
                                        : 'bg-gray-100/50 border-gray-200/50 text-gray-600 dark:bg-white/5 dark:border-white/10'
                                }`}>
                                    <span className="uppercase tracking-widest opacity-60">QUOTA:</span>
                                    <span className={isLimitReached ? 'text-rose-700 dark:text-rose-400' : 'text-gray-900 dark:text-gray-400'}>
                                        {currentCount} / {maxDependents}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-gray-50/30 dark:bg-transparent">
                            {isLimitReached && (
                                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                    <ShieldAlert className="text-amber-600 dark:text-amber-500 shrink-0" size={18} />
                                    <div className="space-y-1">
                                        <p className="text-[13px] font-bold text-amber-800 dark:text-amber-400 leading-none">
                                            Member Limit Reached
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500/70 font-medium">
                                            Maximum of {maxDependents} family members allowed.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <DependentSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredDependents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600">
                                        <Users size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                                        {searchQuery || relationshipFilter !== 'all' ? 'No matches found' : 'No family members yet'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8 font-medium">
                                        {searchQuery || relationshipFilter !== 'all'
                                            ? "Adjust your filters to find what you're looking for."
                                            : "Add family members to simplify booking and manage records in one place."}
                                    </p>
                                    {!(searchQuery || relationshipFilter !== 'all') && (
                                        <button
                                            onClick={handleAddClick}
                                            className="px-8 py-3 bg-brand-500 text-white text-sm font-black rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20"
                                        >
                                            Add First Member
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 sm:pb-6">
                                    {filteredDependents.map(dependent => (
                                        <DependentCard 
                                            key={dependent.id} 
                                            dependent={dependent} 
                                            onEdit={handleEditClick}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile FAB */}
                        {!isLimitReached && (
                            <button
                                onClick={handleAddClick}
                                className="fixed bottom-8 right-5 sm:hidden z-50 flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg shadow-2xl shadow-brand-500/40 active:scale-95 transition-all outline-none"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span className='text-xs font-bold'>New Family Member</span>
                            </button>
                        )}
                    </>
                )}
            </div>

            <AddDependentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                dependent={editingDependent}
            />
        </>
    );
};

export default DependentsPage;
