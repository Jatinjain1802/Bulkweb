import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MessageSquare, Megaphone, FilePlus, LayoutDashboard, MoreVertical, Users, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle, Calendar, Clock, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const timeRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#fff',
    borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
    borderRadius: '0.75rem',
    padding: '2px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': { borderColor: '#6366f1' },
    minWidth: '180px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#6366f1'
    }
  })
};

const Summary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(timeRangeOptions[2]); // Default: Last 7 Days
  const [stats, setStats] = useState({
    metrics: {
      totalMessages: 0,
      activeCampaigns: 0,
      templatesCreated: 0,
      totalContacts: 0
    },
    chartData: [],
    recentActivity: []
  });

  const [userName, setUserName] = useState('User');

  // Activity Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchAllActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/activities');
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();
      setAllActivities(data);
    } catch (error) {
      console.error("Activity fetch error:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const openActivityModal = () => {
    setIsActivityModalOpen(true);
    fetchAllActivities();
  };

  useEffect(() => {
    // Get user from local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.email?.split('@')[0] || 'User');
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/dashboard/summary?timeframe=${timeRange.value}`);
        if (!res.ok) throw new Error('Failed to fetch summary');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm z-50">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="space-y-1 mb-3">
              <p className="text-indigo-600 font-medium">Sent: {data.sent}</p>
              <p className="text-emerald-600 font-medium">Delivered: {data.delivered}</p>
              <p className="text-red-600 font-medium">Failed: {data.failed}</p>
          </div>
          {(data.campaignNames || data.templateNames) && (
              <div className="border-t border-slate-100 pt-2 mt-2">
                  {data.campaignNames && (
                      <div className="mb-2">
                          <p className="text-xs font-semibold text-slate-700 mb-0.5">Campaigns:</p>
                          <p className="text-xs text-slate-500 leading-snug">{data.campaignNames}</p>
                      </div>
                  )}
                  {data.templateNames && (
                      <div>
                          <p className="text-xs font-semibold text-slate-700 mb-0.5">Templates:</p>
                          <p className="text-xs text-slate-500 leading-snug">{data.templateNames}</p>
                      </div>
                  )}
              </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Modal Container */}
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative">
            
            {/* Decorative Background Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Activity Timeline</h2>
                    <p className="text-sm text-slate-500 font-medium">History of all campaigns & updates</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="group p-2.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 border border-transparent hover:border-slate-200"
              >
                 <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-0 overflow-y-auto flex-1 custom-scrollbar scroll-smooth relative z-10 bg-slate-50/30">
              {loadingActivities ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[400px]">
                   <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-indigo-600 border-t-transparent shadow-lg shadow-indigo-100"></div>
                   <p className="text-slate-500 font-medium animate-pulse text-sm">Fetching latest updates...</p>
                </div>
              ) : allActivities.length > 0 ? (
                <div className="relative p-8 space-y-2">
                  {/* Timeline Track */}
                  <div className="absolute left-[54px] top-8 bottom-8 w-[2px] bg-indigo-100/50 rounded-full" />

                  {allActivities.map((item, i) => {
                      const status = item.status?.toLowerCase() || 'default';
                      let StatusIcon = Megaphone;
                      let statusStyles = 'bg-white text-indigo-600 border-indigo-100';
                      let dateBg = 'bg-indigo-50 text-indigo-600';
                      
                      if (status === 'completed') { 
                          StatusIcon = CheckCircle; 
                          statusStyles = 'bg-white text-emerald-600 border-emerald-100 shadow-emerald-100';
                          dateBg = 'bg-emerald-50 text-emerald-700'; 
                      } else if (status === 'failed') { 
                          StatusIcon = XCircle; 
                          statusStyles = 'bg-white text-red-600 border-red-100 shadow-red-100';
                          dateBg = 'bg-red-50 text-red-700';
                      } else if (status === 'scheduled') { 
                          StatusIcon = Clock; 
                          statusStyles = 'bg-white text-amber-500 border-amber-100 shadow-amber-100';
                          dateBg = 'bg-amber-50 text-amber-700';
                      }
                      
                      return (
                        <div key={i} className="relative pl-20 py-2 group">
                           {/* Icon Node */}
                           <div className={`absolute left-7 top-4 w-10 h-10 rounded-full border-[3px] shadow-sm flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 ${statusStyles} group-hover:shadow-md`}>
                                <StatusIcon className="w-5 h-5 stroke-[2.5]" />
                           </div>

                           {/* Card */}
                           <div className="bg-white border boundary-transparent hover:border-indigo-100 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] group-hover:-translate-x-1 cursor-default">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="text-base font-bold text-slate-800">
                                                {item.name || 'Untitled Campaign'}
                                            </h3>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${dateBg} bg-opacity-40`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        {item.templateName && (
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 hover:bg-slate-100 transition-colors">
                                                    <FilePlus className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">{item.templateName}</span>
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Date & Time */}
                                    <div className="flex flex-col items-end gap-1 min-w-fit pl-4 border-l border-slate-100">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                            {new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                            {new Date(item.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                           </div>
                        </div>
                      );
                  })}
                  
                  {/* End of Timeline Dot */}
                  <div className="absolute left-[51px] bottom-0 w-3 h-3 bg-slate-200 rounded-full ring-4 ring-white" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 opacity-60">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 inner-shadow">
                        <LayoutDashboard className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="font-semibold text-lg">No activity history yet.</p>
                    <p className="text-sm">Start a campaign to see it here!</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur z-20 flex justify-between items-center text-xs font-medium text-slate-500">
               <span>
                  Showing {allActivities.length} total entries
               </span>
               <button onClick={() => setIsActivityModalOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 hover:text-slate-900">
                  Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== WELCOME HEADER ===== */}
      <div
        className="card mb-6"
        style={{
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          overflow: "visible", // Allowed overflow for Select dropdown
        }}
      >
        <div className="border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
  
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                  ☀️
                </div>
  
                <div>
                   <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    Welcome back, {userName}! 👋
                   </h1>
                   <p className="text-sm text-slate-500 mt-1 font-medium">{today}</p>
                </div>
              </div>
  
              <p className="text-slate-600 text-base max-w-2xl mt-4">
                Here's what's happening with your campaigns today.
                You have{" "}
                <span className="font-semibold text-slate-900">
                  {stats.metrics?.activeCampaigns || 0} active campaigns
                </span>{" "}
                requiring attention.
              </p>
            </div>
  
            {/* RIGHT - Global Filter */}
            <div className="flex flex-col items-end gap-5 min-w-[300px]">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-500">Time Range:</span>
                    <Select
                        options={timeRangeOptions}
                        value={timeRange}
                        onChange={setTimeRange}
                        styles={customStyles}
                        isSearchable={false}
                        components={{ IndicatorSeparator: () => null }}
                        menuPlacement="auto"
                    />
                </div>

                {/* SMALL STATS SHORTCUTS */}
              <div className="flex gap-4 w-full justify-end">
                 {/*  Shortcuts removed or simplified to fit design better if needed, but keeping primarily as per request */}
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* ===== METRICS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Messages', value: stats.metrics?.totalMessages?.toLocaleString(), change: '+0%', icon: MessageSquare, color: 'blue', path: '/dashboard/create-campaign' },
          { title: 'Active Campaigns', value: stats.metrics?.activeCampaigns, change: '+0%', icon: Megaphone, color: 'green', path: '/dashboard/create-campaign' },
          { title: 'Templates Created', value: stats.metrics?.templatesCreated, change: '+0%', icon: FilePlus, color: 'purple', path: '/dashboard/template-list' },
          { title: 'Total Contacts', value: stats.metrics?.totalContacts?.toLocaleString(), change: '+0%', icon: Users, color: 'orange', path: '/dashboard/create-campaign' }
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => stat.path && navigate(stat.path)}
            className="relative bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden
                   transition-all duration-300 cursor-pointer
                   hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 group"
          >
            {/* soft corner glow */}
            <div
              className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-linear-to-br
            ${stat.color === 'blue' ? 'from-blue-100' :
                  stat.color === 'green' ? 'from-emerald-100' :
                    stat.color === 'purple' ? 'from-purple-100' :
                      'from-orange-100'
                } to-transparent`}
            />
  
            {/* icon bubble (right) */}
            <div
              className={`absolute top-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white
            ${stat.color === 'blue' ? 'bg-blue-500' :
                  stat.color === 'green' ? 'bg-emerald-500' :
                    stat.color === 'purple' ? 'bg-purple-500' :
                      'bg-orange-500'
                }`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
  
            {/* change badge */}
            <span
              className={`inline-block mb-3 text-xs font-bold px-2.5 py-1 rounded-full
            ${stat.change.startsWith('+')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-red-500 bg-red-50'
                }`}
            >
              {stat.change}
            </span>
  
            {/* content */}
            <p className="text-sm font-medium text-slate-500 mb-1 group-hover:text-slate-700 transition-colors">
              {stat.title}
            </p>
  
            <p className="text-3xl font-bold text-slate-800 tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
  
      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col transition-all hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Campaign Performance</h3>
              <p className="text-sm text-slate-500 mt-1">Message delivery volume & trends</p>
            </div>
            {/* Select removed from here as it is now global */}
          </div>

          {/* Quick Summary Pills for the Chart Context */}
           <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-3 min-w-fit">
                 <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <TrendingUp className="w-4 h-4" />
                 </div>
                 <div>
                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Total Sent</p>
                    <p className="text-lg font-bold text-slate-800">
                        {loading ? '...' : stats.chartData.reduce((acc, curr) => acc + (curr.sent || 0), 0).toLocaleString()}
                    </p>
                 </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-3 min-w-fit">
                 <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                 </div>
                 <div>
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Avg Delivery</p>
                    <p className="text-lg font-bold text-slate-800">
                        {(() => {
                           const total = stats.chartData.reduce((acc, curr) => acc + (curr.sent || 0), 0);
                           const del = stats.chartData.reduce((acc, curr) => acc + (curr.delivered || 0), 0);
                           return total > 0 ? ((del / total) * 100).toFixed(1) + '%' : '0%';
                        })()}
                    </p>
                 </div>
              </div>
           </div>
  
          {/* Recharts Area Chart */}
          <div className="flex-1 min-h-[350px] px-2 pb-4">
             {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Loading chart data...</div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dy={10}
                    interval={stats.chartData.length > 30 ? 'preserveStartEnd' : 0} 
                    />
                    <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    />
                    <RechartsTooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSent)" 
                    name="Sent"
                    animationDuration={1000}
                    />
                    <Area 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorDelivered)" 
                    name="Delivered"
                    animationDuration={1000}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="failed" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        fill="transparent" 
                        name="Failed" 
                        animationDuration={1000}
                    />
                </AreaChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>
  
        {/* Right Column: Activity & Top Templates */}
        <div className="space-y-8">
            {/* Top Templates Card */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-indigo-500" /> Top Performing Templates
                </h3>
                <div className="space-y-4">
                    {stats.topTemplates?.length > 0 ? stats.topTemplates.map((t, i) => (
                        <div key={i} className="group">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={t.name}>{t.name}</span>
                                 <span className="text-xs font-bold text-slate-500">{t.usage_count} sent</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500 group-hover:bg-indigo-600"
                                    style={{ width: `${(t.usage_count / Math.max(...stats.topTemplates.map(x=>x.usage_count))) * 100}%` }}
                                  ></div>
                             </div>
                             <div className="flex justify-end mt-1">
                                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                                    <ArrowUpRight className="w-3 h-3" /> 
                                    {Math.round((t.read_count / t.usage_count) * 100) || 0}% read rate
                                </span>
                             </div>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-400">No templates usage data yet.</p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                <button className="p-2 hover:bg-gray-50 rounded-xl text-slate-400 transition-colors">
                <MoreVertical className="w-5 h-5" />
                </button>
            </div>
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((item, i) => (
                        <div key={i} className="relative pl-10 group cursor-default">
                        <div className={`absolute left-[14px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all ${item.color || 'bg-blue-500'}`}></div>
                        <div className="group-hover:translate-x-1 transition-transform duration-200">
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {item.text}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                                {new Date(item.time).toLocaleString()}
                            </p>
                        </div>
                        </div>
                    ))
                ) : (
                    <div className="pl-10 text-sm text-slate-500">No recent activity</div>
                )}
            </div>
            <button 
                onClick={openActivityModal}
                className="w-full mt-8 py-3 rounded-xl border border-gray-200 text-slate-600 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
                View All Activity
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
