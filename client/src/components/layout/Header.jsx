import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../../context/NotificationContext';

const Header = () => {
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const { unreadCount } = useNotifications();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'dashboard': return 'Dashboard';
      case 'create-template': return 'Template Managment';
      case 'template-list': return 'Template Managment';
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
        <div className="relative">
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-slate-500 hover:text-indigo-600 transition-all focus:outline-none"
            >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    {/* Optional: number inside dot if big enough, otherwise just dot */}
                </span>
            )}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>
      </div>
    </header>
  );
};

export default Header;
