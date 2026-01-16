import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, RefreshCcw, CheckCircle, XCircle, Trash2, Eye, MessageCircle, LayoutGrid, LayoutList, ChevronDown } from 'lucide-react';

const TemplateList = ({ templates: propTemplates, loading: propLoading, onRefresh: propOnRefresh }) => {
    const [internalTemplates, setInternalTemplates] = useState([]);
    const [internalLoading, setInternalLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // ID of template with active menu
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [showViewDropdown, setShowViewDropdown] = useState(false);

    // Filter States
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const isControlled = Array.isArray(propTemplates);
    const templates = isControlled ? propTemplates : internalTemplates;
    const loading = isControlled ? propLoading : internalLoading;

    // Derived State for Filters
    const uniqueCategories = React.useMemo(() => {
        if (!templates) return [];
        return [...new Set(templates.map(t => t.category).filter(Boolean))];
    }, [templates]);

    const filteredTemplates = React.useMemo(() => {
        if (!templates) return [];
        return templates.filter(template => {
            // Search Filter - searches across name, date, status, and category
            let matchesSearch = true;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const templateName = String(template.name || '').toLowerCase();
                const templateStatus = String(template.status || '').toLowerCase();
                const templateCategory = String(template.category || '').toLowerCase();
                const templateDate = new Date(template.created_at).toLocaleDateString().toLowerCase();

                matchesSearch = templateName.includes(query) ||
                    templateStatus.includes(query) ||
                    templateCategory.includes(query) ||
                    templateDate.includes(query);
            }

            // Date Filter
            let matchesDate = true;
            if (filterDate) {
                const templateDate = new Date(template.created_at).toISOString().split('T')[0];
                matchesDate = templateDate === filterDate;
            }

            // Status Filter
            const matchesStatus = filterStatus && filterStatus !== 'all'
                ? String(template.status).toLowerCase() === filterStatus.toLowerCase()
                : true;

            // Category Filter
            const matchesCategory = filterCategory && filterCategory !== 'all'
                ? String(template.category).toLowerCase() === filterCategory.toLowerCase()
                : true;

            return matchesSearch && matchesDate && matchesStatus && matchesCategory;
        });
    }, [templates, filterDate, filterStatus, filterCategory, searchQuery]);

    const fetchTemplates = async () => {
        if (isControlled && propOnRefresh) {
            propOnRefresh();
            return;
        }

        setInternalLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/templates');
            const data = await res.json();
            setInternalTemplates(data);
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setInternalLoading(false);
        }
    };

    useEffect(() => {
        if (!isControlled) {
            fetchTemplates();
        }
    }, [isControlled]);

    const onRefresh = () => {
        fetchTemplates();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Are you sure you want to delete this template?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/templates/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    alert("Template deleted successfully");
                    onRefresh();
                } else {
                    alert("Failed to delete template");
                }
            } catch (error) {
                console.error(error);
                alert("Error deleting template");
            }
        }
        setActiveMenu(null);
    };

    const getStatusBadge = (status) => {
        switch (String(status).toLowerCase()) {
            case 'approved': return <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-green-50 text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
            case 'pending':
            case 'submitted':
            case 'local_pending':
                return <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600"><RefreshCcw className="w-3.5 h-3.5" /> Pending</span>;
            case 'rejected':
            case 'failed_meta':
                return <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-red-50 text-red-600"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
            default: return <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    // Helper to extract components from structure
    const getTemplateComponents = (template) => {
        try {
            let structure = template.structure;
            if (typeof structure === 'string') {
                console.log("Parsing structure string:", structure); // Debug
                structure = JSON.parse(structure);
            }

            if (!Array.isArray(structure)) return { body: 'Invalid structure' };

            const header = structure.find(c => c.type === 'HEADER');
            const body = structure.find(c => c.type === 'BODY');
            const footer = structure.find(c => c.type === 'FOOTER');

            return {
                header,
                body: body ? body.text : 'No text content',
                footer: footer ? footer.text : null
            };
        } catch (e) {
            console.error("Error parsing components:", e);
            return { body: 'Error parsing content' };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-[#1a1a2e]">Your Templates</h3>
                    <button
                        onClick={onRefresh}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Refresh Status"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowViewDropdown(!showViewDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                            {viewMode === 'card' ? (
                                <>
                                    <LayoutGrid className="w-4 h-4" />
                                    Card View
                                </>
                            ) : (
                                <>
                                    <LayoutList className="w-4 h-4" />
                                    Table View
                                </>
                            )}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showViewDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10 animate-fade-in">
                                <button
                                    onClick={() => {
                                        setViewMode('card');
                                        setShowViewDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition ${viewMode === 'card'
                                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    Card View
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('table');
                                        setShowViewDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition ${viewMode === 'table'
                                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <LayoutList className="w-4 h-4" />
                                    Table View
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, status, category, date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm w-64
                        border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Date Filter */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <RefreshCcw className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Content Area - Cards or Table */}
            {viewMode === 'card' ? (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {loading ? (
                        <p className="col-span-full text-center text-sm text-slate-500">
                            Loading templates...
                        </p>
                    ) : !filteredTemplates || filteredTemplates.length === 0 ? (
                        <p className="col-span-full text-center text-sm text-slate-500">
                            {templates && templates.length > 0 ? 'No templates match your filters.' : 'No templates found.'}
                        </p>
                    ) : (
                        filteredTemplates.map((template) => {
                            const comps = getTemplateComponents(template);

                            return (
                                <div
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className="relative bg-white border border-slate-200 rounded-2xl p-6
                            cursor-pointer transition-all duration-300
                            hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {/* Decorative Corner Blob */}
                                    <div
                                        className="absolute top-0 right-0 w-20 h-20 rounded-bl-[80px] opacity-60"
                                        style={{ background: "rgba(99,102,241,0.08)" }}
                                    />

                                    {/* Card Content */}
                                    <div className="relative space-y-4">

                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="text-base font-bold text-[#1a1a2e]">
                                                    {template.name}
                                                </h4>

                                                <div className="flex gap-2 mt-2">
                                                    <span className="px-2 py-0.5 text-[11px] font-medium
                                        bg-slate-50 border border-slate-200
                                        rounded-md text-slate-600">
                                                        {template.category}
                                                    </span>
                                                    <span className="px-2 py-0.5 text-[11px] font-medium
                                        bg-slate-50 border border-slate-200
                                        rounded-md text-slate-600 uppercase">
                                                        {template.language}
                                                    </span>
                                                </div>
                                            </div>

                                            {getStatusBadge(template.status)}
                                        </div>

                                        {/* Body Preview */}
                                        <div className="bg-slate-50 border border-slate-200
                                    rounded-xl p-4 text-sm text-slate-700
                                    line-clamp-3">
                                            {comps.header?.format === "TEXT" && (
                                                <p className="font-semibold text-slate-900 mb-1">
                                                    {comps.header.text}
                                                </p>
                                            )}
                                            <p>{comps.body}</p>
                                        </div>

                                        {/* Footer */}
                                        <div className="pt-3 mt-3 flex items-center justify-between
                                    border-t border-slate-100">
                                            <span className="text-xs text-slate-400 font-medium">
                                                {new Date(template.created_at).toLocaleDateString()}
                                            </span>

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(
                                                            activeMenu === template.id ? null : template.id
                                                        );
                                                    }}
                                                    className="p-2 rounded-lg text-slate-400
                                    hover:bg-slate-100 hover:text-indigo-600
                                    transition"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>

                                                {activeMenu === template.id && (
                                                    <div
                                                        className="absolute right-0 bottom-full mb-2 w-36
                                    bg-white rounded-xl shadow-xl
                                    border border-slate-200
                                    py-2 z-10 animate-fade-in"
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedTemplate(template);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-sm
                                        flex items-center gap-2
                                        text-slate-600 hover:bg-slate-50"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            View
                                                        </button>

                                                        <button
                                                            onClick={(e) => handleDelete(e, template.id)}
                                                            className="w-full px-4 py-2 text-sm
                                        flex items-center gap-2
                                        text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) :
                //table view
                (
                    <div className="overflow-x-auto bg-white border border-gray-200">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#f9fafb] border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-2 text-left text-[14px] font-semibold text-black-700 tracking-wide">
                                        S.No
                                    </th>
                                    <th className="px-6 py-2 text-left text-[14px] font-semibold text-black-700 tracking-wide">
                                        Template
                                    </th>
                                    <th className="px-6 py-2 text-left text-[14px] font-semibold text-black-700 tracking-wide">
                                        Category
                                    </th>
                                    <th className="px-6 py-2 text-left text-[14px] font-semibold text-black-700 tracking-wide">
                                        Status
                                    </th>
                                    <th className="px-6 py-2 text-left text-[14px] font-semibold text-black-700 tracking-wide">
                                        Language
                                    </th>
                                    <th className="px-6 py-2 text-left text-[14px] font-semibold text-black-700 tracking-wide">
                                        Date
                                    </th>
                                    <th className="px-6 py-2 text-right text-[14px] font-semibold text-black-700 tracking-wide">
                                        Action
                                    </th>
                                </tr>
                            </thead>


                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center text-sm text-gray-500">
                                            Loading templates...
                                        </td>
                                    </tr>
                                ) : !filteredTemplates || filteredTemplates.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center text-sm text-gray-500">
                                            {templates && templates.length > 0 ? 'No templates match your filters.' : 'No templates found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTemplates.map((template, index) => (
                                        <tr
                                            key={template.id}
                                            className="border-b border-gray-100 hover:bg-[#f9fafb] transition"
                                        >
                                            <td className="px-5 py-4 text-sm text-black-500 font-medium">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-sm font-semibold text-[#1a1a2e]">
                                                    {template.name}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                                    {template.category}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {getStatusBadge(template.status)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex px-3 py-2 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 uppercase">
                                                    {template.language}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(template.created_at).toLocaleDateString()}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedTemplate(template)}
                                                        className="p-2 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={(e) => handleDelete(e, template.id)}
                                                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* Footer Info */}
            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <p>Showing {filteredTemplates ? filteredTemplates.length : 0} templates</p>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 border border-slate-200
                        rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        disabled
                    >
                        Previous
                    </button>
                    <button
                        className="px-4 py-2 border border-slate-200
                        rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        disabled
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedTemplate(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h3>
                            <div className="flex gap-2 mt-2">
                                {getStatusBadge(selectedTemplate.status)}
                                <span className="px-2 py-2 bg-gray-100 rounded-md text-xs font-mono text-slate-500 uppercase">{selectedTemplate.language}</span>
                                <span className="px-2 py-2 bg-gray-100 rounded-md text-xs font-medium text-slate-500 capitalize">{selectedTemplate.category}</span>
                            </div>
                            {['rejected', 'failed_meta'].includes(String(selectedTemplate.status).toLowerCase()) && selectedTemplate.rejection_reason && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 animate-fade-in">
                                    <p className="font-bold flex items-center gap-2 mb-1">
                                        <XCircle className="w-4 h-4" /> Rejection Reason:
                                    </p>
                                    <p>{selectedTemplate.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#e5ddd5] p-6 rounded-xl border border-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-slate-800 relative">
                                {/* Parse components for Modal */}
                                {(() => {
                                    const comps = getTemplateComponents(selectedTemplate);
                                    return (
                                        <>
                                            {comps.header && (
                                                <div className="mb-2">
                                                    {comps.header.format === 'TEXT' ? (
                                                        <p className="font-bold text-base">{comps.header.text}</p>
                                                    ) : (
                                                        <div className="bg-gray-100 h-32 rounded flex items-center justify-center text-slate-400 text-xs">
                                                            {comps.header.format} Header
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap">{comps.body}</p>
                                            {comps.footer && (
                                                <p className="text-[11px] text-slate-400 mt-2 pt-1 border-t border-gray-50">{comps.footer}</p>
                                            )}
                                        </>
                                    );
                                })()}
                                <div className="text-[10px] text-slate-400 text-right mt-1">12:00 PM</div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => handleDelete({ stopPropagation: () => { } }, selectedTemplate.id)}
                                className="text-red-600 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateList;
