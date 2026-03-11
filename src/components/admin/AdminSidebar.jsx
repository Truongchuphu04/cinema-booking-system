import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Film, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  MapPin,
  CreditCard,
  Shield
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Quản lý User', path: '/admin/users' },
    { icon: Film, label: 'Quản lý Phim', path: '/admin/movies' },
    { icon: MapPin, label: 'Rạp chiếu', path: '/admin/theaters' },
    { icon: Calendar, label: 'Lịch chiếu', path: '/admin/showtimes' },
    { icon: CreditCard, label: 'Đặt vé', path: '/admin/bookings' },
    { icon: BarChart3, label: 'Thống kê', path: '/admin/analytics' },
    { icon: Settings, label: 'Cài đặt', path: '/admin/settings' }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 transition-all duration-300 z-30 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">CineMax Admin</span>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-r-2 border-cyan-400'
                  : 'text-gray-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`} />
              {isOpen && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;