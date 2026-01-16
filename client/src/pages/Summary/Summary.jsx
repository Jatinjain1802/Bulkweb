import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { MessageSquare, Megaphone, FilePlus, LayoutDashboard, MoreVertical, Users, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const timeRangeOptions = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f9fafb',
    borderColor: state.isFocused ? '#6366f1' : 'transparent',
    borderRadius: '0.75rem',
    padding: '2px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': { borderColor: '#6366f1' },
    minWidth: '160px',
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
  const [loading, setLoading] = useState(true);
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

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/summary');
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
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const maxChartValue = Math.max(...(stats.chartData?.map(d => d.sent) || [0]), 10);

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

  if (loading) {
     return <div className="flex items-center justify-center p-20 text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ===== WELCOME HEADER ===== */}
      <div
        className="card mb-6"
        style={{
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <div className="border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
  
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                  ☀️
                </div>
  
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  Welcome back, {userName}! 👋
                </h1>
              </div>
  
              <p className="text-sm text-slate-500 mb-2">
                {today}
              </p>
  
              <p className="text-slate-600 text-base max-w-2xl">
                Here's what's happening with your campaigns today.
                You have{" "}
                <span className="font-semibold text-slate-900">
                  {stats.metrics?.activeCampaigns || 0} active campaigns
                </span>{" "}
                requiring attention.
              </p>
            </div>
  
            {/* RIGHT */}
            <div className="flex flex-col gap-5 min-w-[460px]">
  
              {/* SMALL STATS */}
              <div className="flex gap-4">
                {[
                  { label: "Total Msgs", value: stats.metrics?.totalMessages, icon: "📤" },
                  { label: "Contacts", value: stats.metrics?.totalContacts, icon: "👥" },
                  { label: "Templates", value: stats.metrics?.templatesCreated, icon: "📄" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border border-slate-200 rounded-2xl px-4 py-3 bg-white w-full"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 leading-none">
                        {item.label}
                      </p>
                      <p className="text-xl font-bold text-slate-900 leading-tight">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
  
              
            </div>
          </div>
        </div>
      </div>
  
      {/* ===== METRICS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Messages', value: stats.metrics?.totalMessages?.toLocaleString(), change: '+0%', icon: MessageSquare, color: 'blue' },
          { title: 'Active Campaigns', value: stats.metrics?.activeCampaigns, change: '+0%', icon: Megaphone, color: 'green' },
          { title: 'Templates Created', value: stats.metrics?.templatesCreated, change: '+0%', icon: FilePlus, color: 'purple' },
          { title: 'Total Contacts', value: stats.metrics?.totalContacts?.toLocaleString(), change: '+0%', icon: Users, color: 'orange' }
        ].map((stat, i) => (
          <div
            key={i}
            className="relative bg-white rounded-2xl border border-slate-200 p-6 overflow-hidden
                   transition-all duration-300 cursor-pointer
                   hover:-translate-y-1 hover:shadow-xl hover:border-slate-300"
          >
            {/* soft corner glow */}
            <div
              className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br
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
            <p className="text-sm font-medium text-slate-500 mb-1">
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
              <p className="text-sm text-slate-500 mt-1">Message delivery trends & volume</p>
            </div>
             <Select
              options={timeRangeOptions}
              defaultValue={timeRangeOptions[0]}
              styles={customStyles}
              isSearchable={false}
              components={{ IndicatorSeparator: () => null }}
            />
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
                        {stats.chartData.reduce((acc, curr) => acc + (curr.sent || 0), 0).toLocaleString()}
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
                />
                <Area 
                  type="monotone" 
                  dataKey="delivered" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorDelivered)" 
                  name="Delivered"
                />
                <Area 
                    type="monotone" 
                    dataKey="failed" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    fill="transparent" 
                    name="Failed" 
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 text-slate-600 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
                View All Activity
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
