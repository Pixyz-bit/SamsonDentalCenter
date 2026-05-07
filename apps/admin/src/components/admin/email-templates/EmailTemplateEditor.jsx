import React, { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, Eye, Code, Smartphone, Monitor, Info } from 'lucide-react';

const EmailTemplateEditor = ({ template, onSave, onRestore }) => {
    const [subject, setSubject] = useState('');
    const [html, setHtml] = useState('');
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview'
    const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop', 'mobile'
    const [hasChanges, setHasChanges] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (template) {
            setSubject(template.subject_line || '');
            setHtml(template.html_content || '');
            setHasChanges(false);
        }
    }, [template]);

    const handleSave = () => {
        onSave({ subject_line: subject, html_content: html });
        setHasChanges(false);
    };

    const handleHtmlChange = (e) => {
        setHtml(e.target.value);
        setHasChanges(true);
    };

    const handleSubjectChange = (e) => {
        setSubject(e.target.value);
        setHasChanges(true);
    };

    // Inject demo data for preview
    const getPreviewHtml = () => {
        let preview = html;
        const demoData = {
            name: 'John Doe',
            otpCode: '123456',
            clinicName: 'Primera Dental',
            clinicAddress: '123 Dental St, Smile City',
            clinicPhone: '+1 (555) 000-1234',
            service: 'General Consultation',
            date: '2026-05-15',
            start_time: '10:00 AM',
            end_time: '11:00 AM',
            dentist: 'Dr. Sarah Smith',
            confirmUrl: '#',
            setupUrl: '#',
            claimUrl: '#',
            hoursUntil: '24',
            timeout_minutes: '15',
            clinicYear: new Date().getFullYear(),
        };

        for (const [key, value] of Object.entries(demoData)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            preview = preview.replace(regex, value);
        }

        return preview;
    };

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-lg">
                    <button 
                        onClick={() => setViewMode('edit')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            viewMode === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Code className="w-3.5 h-3.5" />
                        Editor
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            viewMode === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {viewMode === 'preview' && (
                        <div className="flex items-center gap-1 mr-4 border-r border-slate-200 pr-4">
                            <button 
                                onClick={() => setPreviewDevice('desktop')}
                                className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setPreviewDevice('mobile')}
                                className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    
                    <button 
                        onClick={onRestore}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Defaults
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            hasChanges 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Inputs Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Subject Line</label>
                        <input 
                            type="text"
                            value={subject}
                            onChange={handleSubjectChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            placeholder="Email Subject..."
                        />
                    </div>
                </div>

                <div className="flex-1 relative bg-slate-50 overflow-hidden">
                    {viewMode === 'edit' ? (
                        <div className="absolute inset-0 p-4">
                            <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
                                    <Code className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HTML Body</span>
                                </div>
                                <textarea 
                                    value={html}
                                    onChange={handleHtmlChange}
                                    className="flex-1 w-full p-6 text-sm font-mono text-slate-600 focus:outline-none resize-none bg-white leading-relaxed"
                                    placeholder="Enter HTML content here..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-8 bg-slate-100">
                            <div 
                                className={`bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
                                    previewDevice === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
                                }`}
                            >
                                <div className="h-1 bg-indigo-600 shrink-0" />
                                <iframe 
                                    ref={iframeRef}
                                    title="Email Preview"
                                    className="w-full h-full border-none"
                                    srcDoc={getPreviewHtml()}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailTemplateEditor;
