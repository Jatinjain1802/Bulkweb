import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, RefreshCcw, CheckCircle, XCircle, Trash2, Eye, LayoutGrid, LayoutList, ChevronDown, Calendar, Megaphone, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../../components/DatePicker';

const CampaignList = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // ID of campaign with active menu
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
    const [showViewDropdown, setShowViewDropdown] = useState(false);

    // Filter States
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Derived State for Filters
    const filteredCampaigns = React.useMemo(() => {
        if (!campaigns) return [];
        return campaigns.filter(campaign => {
            // Search Filter - searches across name and date
            let matchesSearch = true;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const name = String(campaign.name || '').toLowerCase();
                const template = String(campaign.template_name || '').toLowerCase();
                const status = String(campaign.status || '').toLowerCase();
                const date = new Date(campaign.created_at).toLocaleDateString().toLowerCase();

                matchesSearch = name.includes(query) ||
                    template.includes(query) ||
                    status.includes(query) ||
                    date.includes(query);
            }

            // Date Filter
            let matchesDate = true;
            if (filterDate) {
                const d = new Date(campaign.created_at);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const localDate = `${year}-${month}-${day}`;
                matchesDate = localDate === filterDate;
            }

            // Status Filter
            const matchesStatus = filterStatus && filterStatus !== 'all'
                ? String(campaign.status).toLowerCase() === filterStatus.toLowerCase()
                : true;

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [campaigns, filterDate, filterStatus, searchQuery]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/campaigns');
            const data = await res.json();
            if (res.ok) {
                setCampaigns(data);
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const onRefresh = () => {
        setFilterDate('');
        setFilterStatus('');
        setSearchQuery('');
        fetchCampaigns();
    };

    // TODO: Implement Delete API if available
    const handleDelete = async (e, id) => {
        e.stopPropagation(); 
        if (window.confirm("Are you sure you want to delete this campaign?")) {
            // Assuming this endpoint exists, or we might need to skip strict delete implementation if unknown
             try {
                const res = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    alert("Campaign deleted successfully");
                    onRefresh();
                } else {
                    alert("Failed to delete campaign");
                }
            } catch (error) {
                console.error(error);
                alert("Error deleting campaign");
            }
        }
        setActiveMenu(null);
    };

    const getStatusBadge = (status) => {
        switch (String(status).toLowerCase()) {
            case 'completed': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
            case 'processing': 
            case 'sending':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600"><RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Processing</span>;
            case 'scheduled':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600"><Calendar className="w-3.5 h-3.5" /> Scheduled</span>;
            case 'failed': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600"><XCircle className="w-3.5 h-3.5" /> Failed</span>;
            default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                         <Megaphone className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Your Campaigns</h3>
                        <p className="text-sm text-slate-500">Manage and track your WhatsApp campaigns</p>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="ml-2 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Refresh List"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowViewDropdown(!showViewDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
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
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10 animate-in fade-in zoom-in-95 duration-200">
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
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm w-64
                        border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-gray-100">
                {/* Date Filter */}
                <div className="w-full sm:w-auto">
                   <DatePicker 
                        value={filterDate} 
                        onChange={setFilterDate} 
                        placeholder="Filter by Date" 
                    />
                </div>

                {/* Status Filter */}
                <div className="relative w-full sm:w-48">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer hover:bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
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
                        <div className="col-span-full py-20 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-sm text-slate-500">Loading campaigns...</p>
                        </div>
                    ) : !filteredCampaigns || filteredCampaigns.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No campaigns found</p>
                            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or create a new campaign.</p>
                        </div>
                    ) : (
                        filteredCampaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                                    className="relative bg-white border border-slate-200 rounded-2xl p-6
                            cursor-pointer transition-all duration-300
                            hover:-translate-y-1 hover:shadow-xl group"
                                >
                                    {/* Stats Summary Top */}
                                    <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <ChevronDown className="-rotate-90 w-5 h-5 text-slate-400" />
                                    </div>

                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="pr-8">
                                            <h4 className="text-base font-bold text-slate-800 line-clamp-1" title={campaign.name}>
                                                {campaign.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                                Template: <span className="text-slate-700">{campaign.template_name || '-'}</span>
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {getStatusBadge(campaign.status)}
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-50">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-400 uppercase font-semibold">Sent</p>
                                                <p className="text-sm font-bold text-slate-700">{campaign.real_sent_count || 0}</p>
                                            </div>
                                            <div className="text-center border-l border-slate-100">
                                                <p className="text-xs text-green-500 uppercase font-semibold">Delivered</p>
                                                <p className="text-sm font-bold text-green-700">{campaign.real_delivered_count || 0}</p>
                                            </div>
                                            <div className="text-center border-l border-slate-100">
                                                <p className="text-xs text-red-500 uppercase font-semibold">Failed</p>
                                                <p className="text-sm font-bold text-red-700">{campaign.real_failed_count || 0}</p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(campaign.created_at).toLocaleDateString()}
                                            </span>
                                            
                                            {/* Actions Menu */}
                                            <div className="relative" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === campaign.id ? null : campaign.id);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>

                                                {activeMenu === campaign.id && (
                                                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 animate-in fade-in zoom-in-95">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/dashboard/campaigns/${campaign.id}`);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-xs font-medium flex items-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                                                        >
                                                            <BarChart className="w-3.5 h-3.5" />
                                                            View Report
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(e, campaign.id)}
                                                            className="w-full px-4 py-2 text-xs font-medium flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
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
                            )
                        )
                    )}
                </div>
            ) : (
                // Table View
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-slate-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Sent</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Dlvd</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Failed</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                                        <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        Loading...
                                    </td>
                                </tr>
                            ) : !filteredCampaigns || filteredCampaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                                        No campaigns found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCampaigns.map((campaign) => (
                                    <tr
                                        key={campaign.id}
                                        onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{campaign.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{campaign.template_name || 'No Template'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(campaign.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
                                            {campaign.real_sent_count || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                                            {campaign.real_delivered_count || 0}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-red-500">
                                            {campaign.real_failed_count || 0}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                            <span className="block text-[10px] text-slate-400">
                                                {new Date(campaign.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all mr-2"
                                                >
                                                    View
                                                </button>
                                                <button
                                                     onClick={(e) => handleDelete(e, campaign.id)}
                                                     className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                     title="Delete Campaign"
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
            )}

            {/* Pagination / Footer Info */}
            <div className="mt-8 flex items-center justify-between text-sm text-slate-500 border-t border-gray-100 pt-6">
                <p>Showing <span className="font-semibold text-slate-800">{filteredCampaigns.length}</span> campaigns</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 text-xs font-medium transition" disabled>
                        Previous
                    </button>
                    <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 text-xs font-medium transition" disabled>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignList;
