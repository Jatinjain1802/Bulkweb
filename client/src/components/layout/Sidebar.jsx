import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Megaphone, MessageSquare, LogOut, Users, TrendingUp, Map } from 'lucide-react';
import VaataLogo from '../../assets/img/Vaata-logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(""); // Track open submenu

  // Get user data
  const userData = JSON.parse(localStorage.getItem("data")) || {};
  const userRole = userData.role ? userData.role.toLowerCase().replace(/\s/g, "") : "";
  const accessibleModules = userData.accessible_modules || [];

  const hasAccess = (moduleName) => {
    if (userRole === "superadmin") return true;
    return accessibleModules.includes(moduleName);
  };

  // Menu configuration
  const menuItems = [
    { path: '/dashboard/summary', label: 'Summary', icon: LayoutDashboard, module: 'dashboard' },
    {
      label: 'Template Management',
      icon: FilePlus,
      submenu: [
        { path: '/dashboard/create-template', label: 'Create Template', module: 'template' },
        { path: '/dashboard/template-list', label: 'Template List', module: 'template' },
      ],
    },
    { path: '/dashboard/create-campaign', label: 'Campaign Management', icon: Megaphone, module: 'campaign' },
    { path: '/dashboard/chat', label: 'Chat UI', icon: MessageSquare, module: 'chat' },
  ];

  return (
    <aside className="w-80 bg-gray-900 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 pb-4 border-b border-gray-700/50">
        <img src={VaataLogo} alt="Vaata Logo" className="h-10 mb-8 w-auto" />
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-2">
          Main Menu
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-4">
        {/* Dashboard Section */}
        <div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.path === '/dashboard/summary' && hasAccess(item.module)) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              );
            }
            return null;
          })}
        </div>

        {/* Employee Management Section */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">Employee Management</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.submenu && item.label === 'Template Management' && hasAccess(item.module)) {
              const anySubActive = item.submenu.some(
                (sub) => location.pathname === sub.path && hasAccess(sub.module)
              );
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenMenu(openMenu === item.label ? '' : item.label)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                      anySubActive
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="ml-auto text-xs">{openMenu === item.label ? "▲" : "▼"}</span>
                  </button>

                  {openMenu === item.label && (
                    <div className="ml-6 flex flex-col space-y-1 mt-1">
                      {item.submenu.map(
                        (sub) =>
                          hasAccess(sub.module) && (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              className={({ isActive }) =>
                                `px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? 'bg-orange-400 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          )
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Campaign & Chat Section */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">Marketing Management</p>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              if ((item.path === '/dashboard/create-campaign' || item.path === '/dashboard/chat') && hasAccess(item.module)) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                );
              }
              return null;
            })}
          </div>
        </div>
      </nav>

      {/* Profile + Logout */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold truncate">John Doe</h4>
              <p className="text-xs text-gray-400 truncate">Admin Account</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
