import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Megaphone, MessageSquare, LogOut, Users, TrendingUp, Map, ChevronDown } from 'lucide-react';
import VaataLogo from '../../assets/img/Vaata-logo.png';
import { AnimatePresence, motion } from "framer-motion";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(""); // Track open submenu
  const [activeItem, setActiveItem] = useState(""); // Track active/highlighted item

  // Get user data
  const userData = JSON.parse(localStorage.getItem("data")) || {};
  const userRole = userData.role ? userData.role.toLowerCase().replace(/\s/g, "") : "";
  const accessibleModules = userData.accessible_modules || [];

  // Auto-close submenu when navigating away from its items
  useEffect(() => {
    const menuItems = [
      {
        label: 'Template Management',
        submenu: [
          { path: '/dashboard/create-template' },
          { path: '/dashboard/template-list' },
        ],
      },
      {
        label: 'Campaign Management',
        submenu: [
          { path: '/dashboard/create-campaign' },
        ],
      },
      {
        label: 'Chat Management',
        submenu: [
          { path: '/dashboard/chat' },
        ],
      },
    ];

    // Find which menu the current path belongs to
    let currentMenuLabel = "";
    for (const item of menuItems) {
      if (item.submenu && item.submenu.some(sub => location.pathname === sub.path)) {
        currentMenuLabel = item.label;
        break;
      }
    }

    // Update active item and auto-open the correct menu
    if (currentMenuLabel) {
      setActiveItem(currentMenuLabel);
      setOpenMenu(currentMenuLabel);
    } else if (location.pathname === '/dashboard/summary') {
      setActiveItem('Summary');
      setOpenMenu(""); // Close all submenus when on Summary page
    } else {
      // Close submenu if not on any known path
      setOpenMenu("");
      setActiveItem("");
    }
  }, [location.pathname]);

  const hasAccess = (moduleName) => {
    if (userRole === "superadmin") return true;
    return accessibleModules.includes(moduleName);
  };

  // Original menu configuration
  const menuItems = [
    { path: '/dashboard/summary', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
    {
      label: 'Template Management',
      icon: FilePlus,
      submenu: [
        { path: '/dashboard/create-template', label: 'Create Template', module: 'template' },
        { path: '/dashboard/template-list', label: 'Template List', module: 'template' },
      ],
    },
    {
      label: 'Chat Management',
      icon: MessageSquare,
      module: 'chat',
      submenu: [
        { path: '/dashboard/chat', label: 'Chat UI', module: 'chat' },
      ],
    },
    {
      label: 'Campaign Management',
      icon: Megaphone,
      module: 'campaign',
      submenu: [
        { path: '/dashboard/create-campaign', label: 'Campaign Management', module: 'campaign' },
      ],
    },

  ];

  return (
    <aside className="w-72 min-h-screen text-white flex flex-col" style={{ backgroundColor: '#3d4f5f', fontFamily: "'Instrument Sans', sans-serif", fontSize: '13px' }}>
      {/* Logo */}
      <div className="px-5 py-6">
        <img src={VaataLogo} alt="Vaata Logo" style={{ width: "40%", margin: "-10px" }} />
      </div>

      {/* Dashboard Section */}
      <div className="px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.path === '/dashboard/summary' && hasAccess(item.module)) {
            const isHighlighted = activeItem === 'Summary';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setActiveItem('Summary')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isHighlighted
                  ? 'text-white shadow-md'
                  : 'text-gray-200 hover:bg-white/10'
                  }`}
                style={isHighlighted ? { backgroundColor: '#e87722' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            );
          }
          return null;
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-white-500/40"></div>
      {/* Campaign Management Section */}
      <div>
        <p className="px-5 py-2 text-xs font-medium text-gray-300  tracking-wide">
          Campaign Management
        </p>
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.submenu && item.label === 'Campaign Management' && hasAccess(item.module)) {
              const isHighlighted = activeItem === item.label;
              const isOpen = openMenu === item.label;

              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      setActiveItem(item.label);
                      setOpenMenu(openMenu === item.label ? '' : item.label);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isHighlighted
                      ? 'text-white shadow-md'
                      : 'text-gray-200 hover:bg-white/10'
                      }`}
                    style={isHighlighted ? { backgroundColor: '#e87722' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-2 ml-6 space-y-1 border-l border-gray-500/50 pl-3 overflow-hidden"
                      >
                        {item.submenu.map(
                          (sub) =>
                            hasAccess(sub.module) && (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                className="block py-2 text-sm transition-all duration-200 text-gray-300 hover:text-white"
                              >
                                {sub.label}
                              </NavLink>
                            )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-white-500/40"></div>

      {/* Employee Management Section */}
      <div>
        <p className="px-5 py-2 text-xs font-medium text-gray-300  tracking-wide">
          Template Management
        </p>
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.submenu && item.label === 'Template Management' && hasAccess(item.module)) {
              const isHighlighted = activeItem === item.label;
              const isOpen = openMenu === item.label;

              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      setActiveItem(item.label);
                      setOpenMenu(openMenu === item.label ? '' : item.label);
                    }}
                    className={`w-full flex gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isHighlighted
                      ? 'text-white shadow-md'
                      : 'text-gray-200 hover:bg-white/10'
                      }`}
                    style={isHighlighted ? { backgroundColor: '#e87722' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-2 ml-6 space-y-1 border-l border-gray-500/50 pl-3 overflow-hidden"
                      >
                        {item.submenu.map(
                          (sub) =>
                            hasAccess(sub.module) && (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                className="block py-2 text-sm transition-all duration-200 text-gray-300 hover:text-white"
                              >
                                {sub.label}
                              </NavLink>
                            )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-white-500/40"></div>


      {/* Chat Management Section */}
      <div>
        <p className="px-5 py-2 text-xs font-medium text-gray-300  tracking-wide">
          Chat Management
        </p>
        <div className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.submenu && item.label === 'Chat Management' && hasAccess(item.module)) {
              const isHighlighted = activeItem === item.label;
              const isOpen = openMenu === item.label;

              return (
                <div key={item.label}>
                  <button
                    onClick={() => {
                      setActiveItem(item.label);
                      setOpenMenu(openMenu === item.label ? '' : item.label);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isHighlighted
                      ? 'text-white shadow-md'
                      : 'text-gray-200 hover:bg-white/10'
                      }`}
                    style={isHighlighted ? { backgroundColor: '#e87722' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-2 ml-6 space-y-1 border-l border-gray-500/50 pl-3 overflow-hidden"
                      >
                        {item.submenu.map(
                          (sub) =>
                            hasAccess(sub.module) && (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                className="block py-2 text-sm transition-all duration-200 text-gray-300 hover:text-white"
                              >
                                {sub.label}
                              </NavLink>
                            )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Profile + Logout */}
      <div className="p-4 mt-auto border-t border-gray-500/40">
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md" style={{ background: 'linear-gradient(to top right, #e87722, #ef4444)' }}>
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
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
