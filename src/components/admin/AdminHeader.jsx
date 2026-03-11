import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Home
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminHeader = ({ sidebarOpen, setSidebarOpen, user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New user registered', time: '2 minutes ago', type: 'info' },
    { id: 2, message: 'Payment received', time: '5 minutes ago', type: 'success' },
    { id: 3, message: 'System maintenance scheduled', time: '1 hour ago', type: 'warning' }
  ]);
  const { adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-4 z-[9998]">
      <div className="flex items-center justify-between">
        
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-64"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          
          {/* Home Link */}
          <Link
            to="/"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            title="Go to Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">{user?.fullName || 'Admin'}</p>
                <p className="text-gray-400 text-xs">{user?.email || 'admin@cinema.com'}</p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-gray-600 py-2 z-50" onMouseLeave={() => setShowUserMenu(false)} >
                <div className="px-4 py-2 border-b border-gray-600">
                  <p className="text-white text-sm font-medium">{user?.fullName || 'Admin'}</p>
                  <p className="text-gray-400 text-xs">{user?.email || 'admin@cinema.com'}</p>
                </div>
                
                <button className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;