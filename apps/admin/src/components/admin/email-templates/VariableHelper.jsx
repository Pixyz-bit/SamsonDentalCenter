import React from 'react';
import { Info, Copy, Check, Tag, Globe, Settings } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const VariableHelper = ({ required = [], optional = [], description }) => {
    const { showToast } = useToast();
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(`{{${text}}}`);
        showToast(`Copied {{${text}}}`);
    };

    const globalVars = [
        { key: 'clinicName', desc: 'Name of the clinic' },
        { key: 'clinicAddress', desc: 'Full physical address' },
        { key: 'clinicPhone', desc: 'Official contact phone' },
        { key: 'clinicEmail', desc: 'Official contact email' },
        { key: 'clinicYear', desc: 'Current year (YYYY)' },
        { key: 'facebookUrl', desc: 'Link to Facebook' },
        { key: 'instagramUrl', desc: 'Link to Instagram' },
    ];

    return (
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-5 space-y-6">
                {/* Description Section */}
                <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        About Template
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {description || "No description provided for this template."}
                    </p>
                </div>

                <hr className="border-slate-100" />

                {/* Required Variables */}
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Tag className="w-3.5 h-3.5 text-red-500" />
                        Required Tags
                    </h4>
                    <p className="text-[10px] text-slate-500 italic">These must be present in the HTML to save.</p>
                    <div className="space-y-2">
                        {required.length > 0 ? required.map(tag => (
                            <button
                                key={tag}
                                onClick={() => copyToClipboard(tag)}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100 group hover:border-red-300 transition-all"
                            >
                                <code className="text-xs font-bold text-red-600">{"{{"}{tag}{"}}"}</code>
                                <Copy className="w-3 h-3 text-red-300 group-hover:text-red-500" />
                            </button>
                        )) : (
                            <p className="text-xs text-slate-400">No specific required tags.</p>
                        )}
                    </div>
                </div>

                {/* Optional Variables */}
                {optional.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <Settings className="w-3.5 h-3.5 text-amber-500" />
                            Context Tags
                        </h4>
                        <div className="space-y-2">
                            {optional.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => copyToClipboard(tag)}
                                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-100 group hover:border-amber-300 transition-all"
                                >
                                    <code className="text-xs font-bold text-amber-600">{"{{"}{tag}{"}}"}</code>
                                    <Copy className="w-3 h-3 text-amber-300 group-hover:text-amber-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Global Variables */}
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        Global Tags
                    </h4>
                    <div className="space-y-2">
                        {globalVars.map(item => (
                            <button
                                key={item.key}
                                onClick={() => copyToClipboard(item.key)}
                                className="w-full flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all text-left"
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <code className="text-xs font-bold text-indigo-600">{"{{"}{item.key}{"}}"}</code>
                                    <Copy className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <Info className="w-4 h-4 text-white" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-indigo-900">How to use</p>
                            <p className="text-[10px] text-indigo-700/80 leading-relaxed">
                                Click any tag to copy it. Paste it into the HTML editor. The preview will automatically fill it with sample data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default VariableHelper;
