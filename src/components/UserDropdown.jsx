import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  History, 
  LogOut, 
  ChevronDown, 
  KeyRound,
  UserCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      type: 'submenu',
      label: 'Tài khoản',
      icon: User,
      items: [
        {
          label: 'Thông tin tài khoản',
          icon: UserCircle,
          path: '/account/info'
        },
        {
          label: 'Đổi mật khẩu',
          icon: KeyRound,
          path: '/account/change-password'
        }
      ]
    },
    {
      type: 'link',
      label: 'Lịch sử đặt vé',
      icon: History,
      path: '/history'
    },
    {
      type: 'button',
      label: 'Đăng xuất',
      icon: LogOut,
      action: handleLogout,
      className: 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 ring-2 ring-cyan-400/30 hover:ring-cyan-400/50 shadow-lg shadow-cyan-500/25"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
          {user?.name?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-700/50">
            <p className="text-sm text-gray-300">Đăng nhập với tên</p>
            <p className="text-white font-medium truncate">
              {user?.name || user?.fullName || user?.email || 'Người dùng'}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.type === 'submenu' ? (
                  <div className="px-2">
                    {/* Submenu Header */}
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 font-medium">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    
                    {/* Submenu Items */}
                    <div className="ml-4 space-y-1">
                      {item.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 group"
                        >
                          <subItem.icon className="w-4 h-4 group-hover:text-cyan-400" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : item.type === 'link' ? (
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 mx-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors duration-200 group"
                  >
                    <item.icon className="w-4 h-4 group-hover:text-cyan-400" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    className={`flex items-center gap-3 w-full mx-2 px-3 py-2 text-left rounded-md transition-colors duration-200 group ${
                      item.className || 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;