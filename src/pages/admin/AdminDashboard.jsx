import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { adminUser } = useAdminAuth();
  const navigate = useNavigate();

  // Since we're already protected by AdminProtectedRoute, we don't need these checks
  // AdminProtectedRoute handles authentication verification

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          {/* Header */}
          <AdminHeader 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
            user={adminUser}
          />
          
          {/* Content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;