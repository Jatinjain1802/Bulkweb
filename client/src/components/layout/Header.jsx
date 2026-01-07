import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        switch(path) {
            case 'summary': return 'Summary';
            case 'create-template': return 'Template Managment';
            case 'create-campaign': return 'Campaign Managment';
            case 'chat': return 'Chat UI';
            default: return 'Dashboard';
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-600 outline-none" 
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-indigo-500 transition-colors" />
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-slate-500 hover:text-indigo-600 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
    );
};

export default Header;
