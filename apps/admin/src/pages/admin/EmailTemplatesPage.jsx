import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Save, AlertCircle, ChevronRight, Info, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import EmailTemplateEditor from '../../components/admin/email-templates/EmailTemplateEditor';
import VariableHelper from '../../components/admin/email-templates/VariableHelper';

const EmailTemplatesPage = () => {
    const { showToast } = useToast();
    const { token } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await api.get('/email-templates', token);
            setTemplates(data);
            if (data.length > 0 && !selectedKey) {
                setSelectedKey(data[0].template_key);
            }
        } catch (err) {
            showToast('Failed to load templates', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedKey) {
            fetchTemplateDetail(selectedKey);
        }
    }, [selectedKey]);

    const fetchTemplateDetail = async (key) => {
        try {
            const data = await api.get(`/email-templates/${key}`, token);
            setSelectedTemplate(data);
        } catch (err) {
            showToast('Failed to load template details', 'error');
        }
    };

    const handleSave = async (updatedData) => {
        try {
            const dataRes = await api.put(`/email-templates/${selectedKey}`, updatedData, token); 
            setSelectedTemplate(dataRes);
            showToast('Template updated successfully');
            fetchTemplates();
        } catch (err) {
            const msg = err.message || 'Failed to save template';
            showToast(msg, 'error');
        }
    };

    const handleRestore = async () => {
        if (!window.confirm('Are you sure you want to restore this template to its default state?')) return;
        
        try {
            const data = await api.post(`/email-templates/${selectedKey}/restore`, {}, token);
            setSelectedTemplate(data);
            showToast('Template restored to default');
        } catch (err) {
            showToast('Failed to restore template', 'error');
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group templates by category
    const groupedTemplates = filteredTemplates.reduce((acc, t) => {
        if (!acc[t.category]) acc[t.category] = [];
        acc[t.category].push(t);
        return acc;
    }, {});

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Email Templates</h1>
                        <p className="text-xs text-slate-500 font-medium">Manage system notifications and customer communications</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchTemplates}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Refresh list"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Selector */}
                <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search templates..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-4">
                        {loading && templates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                                <span className="text-sm text-slate-400">Loading templates...</span>
                            </div>
                        ) : Object.keys(groupedTemplates).map(category => (
                            <div key={category} className="space-y-1">
                                <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{category}</h3>
                                {groupedTemplates[category].map(t => (
                                    <button
                                        key={t.template_key}
                                        onClick={() => setSelectedKey(t.template_key)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                                            selectedKey === t.template_key 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="text-sm font-semibold truncate w-full">{t.name}</span>
                                            <span className={`text-[10px] truncate w-full ${selectedKey === t.template_key ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                {t.subject_line}
                                            </span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedKey === t.template_key ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {selectedTemplate ? (
                        <div className="flex flex-1 overflow-hidden">
                            <EmailTemplateEditor 
                                template={selectedTemplate} 
                                onSave={handleSave}
                                onRestore={handleRestore}
                            />
                            <VariableHelper 
                                required={selectedTemplate.required_variables} 
                                optional={selectedTemplate.optional_variables}
                                description={selectedTemplate.description}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-slate-900 font-bold">Select a template</h3>
                                <p className="text-sm">Choose a template from the sidebar to start editing</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default EmailTemplatesPage;
