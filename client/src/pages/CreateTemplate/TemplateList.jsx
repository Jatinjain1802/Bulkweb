import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, RefreshCcw, CheckCircle, XCircle, Trash2, Eye, MessageCircle, LayoutGrid, LayoutList, ChevronDown, Calendar } from 'lucide-react';
import DatePicker from '../../components/DatePicker';
import deleteImage from '../../assets/img/delete.svg';

import { showSuccessToast, showErrorToast } from "../../utils/customToast";

const TemplateList = ({ templates: propTemplates, loading: propLoading, onRefresh: propOnRefresh }) => {
    const [internalTemplates, setInternalTemplates] = useState([]);
    const [internalLoading, setInternalLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // ID of template with active menu
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    // Filter States
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(viewMode === 'table' ? 10 : 9);

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
                const d = new Date(template.created_at);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const localDate = `${year}-${month}-${day}`;
                matchesDate = localDate === filterDate;
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

    // Pagination Logic
    const totalItems = filteredTemplates?.length || 0;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
    const paginatedTemplates = filteredTemplates?.slice(startIndex, endIndex) || [];

    // Update rowsPerPage when viewMode changes
    useEffect(() => {
        setRowsPerPage(viewMode === 'table' ? 10 : 9);
        setCurrentPage(1);
    }, [viewMode]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterDate, filterStatus, filterCategory, searchQuery]);

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
        setFilterDate('');
        setFilterStatus('');
        setFilterCategory('');
        setSearchQuery('');
        fetchTemplates();
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        setTemplateToDelete(id);
        setShowDeleteModal(true);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;
        try {
            const res = await fetch(`http://localhost:5000/api/templates/${templateToDelete}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showSuccessToast("Template deleted successfully!");
                onRefresh();
            } else {
                showErrorToast("Failed to delete template");
            }
        } catch (error) {
            console.error(error);
            showErrorToast("Error deleting template");
        }
        setShowDeleteModal(false);
        setTemplateToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setTemplateToDelete(null);
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

    // Helper function to highlight search matches
    const highlightText = (text, query) => {
        if (!query || !query.trim() || !text) return text;

        const searchTerm = query.trim();
        const textStr = String(text);
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = textStr.split(regex);

        if (parts.length === 1) return text;

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 px-0.5 rounded">
                    {part}
                </span>
            ) : part
        );
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
                        border border-slate-200  outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Date Filter */}
                <DatePicker
                    value={filterDate}
                    onChange={setFilterDate}
                    placeholder="Select Date"
                />

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
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
                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
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
                        paginatedTemplates.map((template) => {
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
                                                    {highlightText(template.name, searchQuery)}
                                                </h4>

                                                <div className="flex gap-2 mt-2">
                                                    <span className="px-2 py-0.5 text-[11px] font-medium
                                        bg-slate-50 border border-slate-200
                                        rounded-md text-slate-600">
                                                        {highlightText(template.category, searchQuery)}
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
                                                {highlightText(new Date(template.created_at).toLocaleDateString(), searchQuery)}
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
                                    paginatedTemplates.map((template, index) => (
                                        <tr
                                            key={template.id}
                                            className="border-b border-gray-100 hover:bg-[#f9fafb] transition"
                                        >
                                            <td className="px-5 py-4 text-sm text-black-500 font-medium">
                                                {startIndex + index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-sm font-semibold text-[#1a1a2e]">
                                                    {highlightText(template.name, searchQuery)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                                    {highlightText(template.category, searchQuery)}
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
                                                    {highlightText(new Date(template.created_at).toLocaleDateString(), searchQuery)}
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
            <div className="mt-6 flex items-center justify-end text-sm text-gray-600 gap-6">
                {/* Rows Per Page */}
                <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <div className="relative">
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="appearance-none bg-transparent pr-5 py-1 font-medium cursor-pointer focus:outline-none"
                        >
                            {viewMode === 'table' ? (
                                <>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </>
                            ) : (
                                <>
                                    <option value={6}>6</option>
                                    <option value={9}>9</option>
                                    <option value={12}>12</option>
                                    <option value={18}>18</option>
                                </>
                            )}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Page Info */}
                <span>
                    {totalItems > 0
                        ? `${startIndex + 1}-${endIndex} of ${totalItems}`
                        : '0-0 of 0'}
                </span>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="First page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Previous Page */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Previous page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Next Page */}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Next page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Last Page */}
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title="Last page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-slate-800">Template Details</h3>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6">
                            {/* Info Grid - Row 1 */}
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                {/* Template Name */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-0.5">Template Name</p>
                                        <p className="text-sm font-semibold text-slate-800">{selectedTemplate.name}</p>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-0.5">Category</p>
                                        <p className="text-sm font-semibold text-slate-800 capitalize">{selectedTemplate.category}</p>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-0.5">Created Date</p>
                                        <p className="text-sm font-semibold text-slate-800">{new Date(selectedTemplate.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid - Row 2 */}
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                {/* Status */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-0.5">Status</p>
                                        <p className={`text-sm font-semibold capitalize ${String(selectedTemplate.status).toLowerCase() === 'approved' ? 'text-green-600' :
                                            ['pending', 'submitted', 'local_pending'].includes(String(selectedTemplate.status).toLowerCase()) ? 'text-yellow-600' :
                                                ['rejected', 'failed_meta'].includes(String(selectedTemplate.status).toLowerCase()) ? 'text-red-600' :
                                                    'text-slate-800'
                                            }`}>{selectedTemplate.status}</p>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-0.5">Language</p>
                                        <p className="text-sm font-semibold text-slate-800 uppercase">{selectedTemplate.language}</p>
                                    </div>
                                </div>

                                {/* Header Type */}
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-0.5">Header Type</p>
                                        <p className="text-sm font-semibold text-slate-800 uppercase">
                                            {(() => {
                                                const comps = getTemplateComponents(selectedTemplate);
                                                return comps.header ? comps.header.format : 'NONE';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason (if applicable) */}
                            {['rejected', 'failed_meta'].includes(String(selectedTemplate.status).toLowerCase()) && selectedTemplate.rejection_reason && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-red-600 font-semibold mb-1">Rejection Reason</p>
                                            <p className="text-sm text-red-700">{selectedTemplate.rejection_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message Content - Full Width */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <MessageCircle className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-2">Message Content</p>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                            {(() => {
                                                const comps = getTemplateComponents(selectedTemplate);
                                                return (
                                                    <>
                                                        {comps.header && (
                                                            <div className="mb-3">
                                                                {comps.header.format === 'TEXT' ? (
                                                                    <p className="font-bold text-base text-slate-800">{comps.header.text}</p>
                                                                ) : (
                                                                    <div className="bg-gray-100 h-24 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                                                                        {comps.header.format} Header
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{comps.body}</p>
                                                        {comps.footer && (
                                                            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-200">{comps.footer}</p>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3"
                    onClick={cancelDelete}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-xs shadow-2xl p-6 relative animate-fade-in-up text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Delete Illustration */}
                        <div className="flex justify-center mb-4">
                            <img src={deleteImage} alt="Delete" className="w-16 h-16" />
                        </div>

                        {/* Title */}
                        <h6 className="text-lg font-bold text-[#1a1a2e] mb-1">
                            Delete Template
                        </h6>

                        {/* Message */}
                        <p className="text-gray-500 text-sm mb-5">
                            Are you sure you want to delete?
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateList;
