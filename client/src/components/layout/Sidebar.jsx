import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  Megaphone, 
  MessageSquare, 
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard/summary', label: 'Summary', icon: LayoutDashboard },
    { path: '/dashboard/create-template', label: 'Template Managment', icon: FilePlus },
    { path: '/dashboard/create-campaign', label: 'Campaign Managment', icon: Megaphone },
    { path: '/dashboard/chat', label: 'Chat UI', icon: MessageSquare },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Megaphone className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">BulkWeb</h1>
        </div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-2">
          Main Menu
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold truncate">John Doe</h4>
              <p className="text-xs text-slate-400 truncate">Admin Account</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
