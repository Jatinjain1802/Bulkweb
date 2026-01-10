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
  {/* outer padding increased */}
  <div className="border-slate-200 p-8">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

      {/* LEFT */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
            ☀️
          </div>

          {/* 👇 HEADING BIGGER */}
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            Welcome back, John! 👋
          </h1>
        </div>

        <p className="text-sm text-slate-500 mb-2">
          Friday, 9 January 2026
        </p>

        <p className="text-slate-600 text-base max-w-2xl">
          Here's what's happening with your campaigns today.
          You have{" "}
          <span className="font-semibold text-slate-900">
            4 active campaigns
          </span>{" "}
          requiring attention.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-5 min-w-[460px]">

        {/* SMALL STATS */}
        <div className="flex gap-4">
          {[
            { label: "Employees", value: 9, icon: "👥" },
            { label: "Orders", value: 7, icon: "🛒" },
            { label: "Customers", value: 0, icon: "👤" },
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

        {/* BUTTON */}
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition text-base">
          📊 View Reports
        </button>
      </div>
    </div>
  </div>
</div>



    {/* ===== METRICS GRID (IMAGE STYLE, DATA SAME) ===== */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: 'Total Messages', value: '12,543', change: '+12.5%', icon: MessageSquare, color: 'blue' },
        { title: 'Active Campaigns', value: '8', change: '+2.4%', icon: Megaphone, color: 'green' },
        { title: 'Templates Created', value: '24', change: '+5.7%', icon: FilePlus, color: 'purple' },
        { title: 'Credits Remaining', value: '2,400', change: '-1.2%', icon: LayoutDashboard, color: 'orange' }
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
