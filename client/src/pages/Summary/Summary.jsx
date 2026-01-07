import React from 'react';
import Select from 'react-select';
import { MessageSquare, Megaphone, FilePlus, LayoutDashboard, MoreVertical } from 'lucide-react';

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

const Summary = () => (
  <div className="space-y-8 animate-fade-in-up">
    {/* Welcome Banner */}
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white shadow-xl shadow-indigo-200">
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h2>
        <p className="text-indigo-100 max-w-xl">
          Here's what's happening with your campaigns today. You have <span className="font-semibold text-white">4 active campaigns</span> requiring attention.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg shadow-black/5">
            View Reports
          </button>
          <button className="bg-indigo-500/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-500/40 transition-colors border border-white/10">
            Manage Settings
          </button>
        </div>
      </div>
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-20 -mb-20 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl"></div>
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[ 
        { title: 'Total Messages', value: '12,543', change: '+12.5%', icon: MessageSquare, color: 'blue' },
        { title: 'Active Campaigns', value: '8', change: '+2.4%', icon: Megaphone, color: 'green' },
        { title: 'Templates Created', value: '24', change: '+5.7%', icon: FilePlus, color: 'purple' },
        { title: 'Credits Remaining', value: '2,400', change: '-1.2%', icon: LayoutDashboard, color: 'orange' }
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3.5 rounded-2xl ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
              stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              'bg-orange-50 text-orange-600'
            } group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              stat.change.startsWith('+') 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-red-500 bg-red-50'
            }`}>
              {stat.change}
            </span>
          </div>
          <div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Analytics & Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Campaign Performance</h3>
            <p className="text-sm text-slate-500 mt-1">Message delivery stats over the last 7 days</p>
          </div>
          <Select 
            options={timeRangeOptions} 
            defaultValue={timeRangeOptions[0]}
            styles={customStyles}
            isSearchable={false}
            components={{ IndicatorSeparator: () => null }}
          />
        </div>
        
        {/* CSS-only Bar Chart */}
        <div className="flex-1 min-h-[300px] flex items-end justify-between gap-4 px-2 pb-4">
          {[65, 45, 75, 55, 85, 40, 70].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
              <div className="relative w-full rounded-t-xl bg-indigo-50 overflow-hidden" style={{ height: '100%' }}>
                 <div 
                   className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-xl transition-all duration-500 group-hover:opacity-90"
                   style={{ height: `${height}%` }}
                 >
                   <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded-lg transition-opacity whitespace-nowrap z-10 mb-2">
                     {height * 12} msgs
                     <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                   </div>
                 </div>
              </div>
              <span className="text-xs text-slate-400 text-center mt-3 font-medium">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </span>
            </div>
          ))}
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
          {[
            { text: 'Campaign "Summer Sale" started', time: '2 mins ago', type: 'campaign', color: 'bg-green-500' },
            { text: 'New template approved', time: '2 hours ago', type: 'template', color: 'bg-blue-500' },
            { text: '1,500 messages delivered', time: '5 hours ago', type: 'message', color: 'bg-purple-500' },
            { text: 'Account balance topped up', time: '1 day ago', type: 'billing', color: 'bg-orange-500' }
          ].map((item, i) => (
            <div key={i} className="relative pl-10 group cursor-default">
              <div className={`absolute left-[14px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all ${item.color}`}></div>
              <div className="group-hover:translate-x-1 transition-transform duration-200">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                  {item.text}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 text-slate-600 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
          View All Activity
        </button>
      </div>
    </div>
  </div>
);

export default Summary;
