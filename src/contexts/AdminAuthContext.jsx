import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Initialize admin authentication state - chỉ dùng MongoDB
  useEffect(() => {
    const initializeAdminAuth = async () => {
      try {
        // Chỉ check admin auth khi ở admin pages
        if (!window.location.pathname.startsWith('/admin')) {
          console.log('🚫 Not admin page, skipping admin auth check');
          setAdminLoading(false);
          return;
        }

        // Xóa demo data cũ
        const oldDemoAdmin = localStorage.getItem('cinema_admin');
        if (oldDemoAdmin) {
          const parsedAdmin = JSON.parse(oldDemoAdmin);
          if (parsedAdmin.id && parsedAdmin.id.toString().startsWith('admin_')) {
            console.log('🗑️ Removing old demo admin data');
            localStorage.removeItem('cinema_admin');
            localStorage.removeItem('cinema_admin_token');
          }
        }

        // Check for admin token first
        const storedAdminUser = localStorage.getItem('cinema_admin');
        const storedAdminToken = localStorage.getItem('cinema_admin_token');
        
        // Also check user token if user has admin role
        const storedUser = localStorage.getItem('cinema_user');
        const storedUserToken = localStorage.getItem('cinema_user_token');
        
        let tokenToUse = null;
        let userToUse = null;
        
        if (storedAdminUser && storedAdminToken) {
          tokenToUse = storedAdminToken;
          userToUse = JSON.parse(storedAdminUser);
        } else if (storedUser && storedUserToken) {
          // Check if user has admin role
          try {
            const user = JSON.parse(storedUser);
            if (user.role === 'admin') {
              tokenToUse = storedUserToken;
              userToUse = user;
            }
          } catch (error) {
            console.warn('Error parsing stored user:', error);
          }
        }
        
        if (tokenToUse && userToUse) {
          // Verify token với MongoDB API
          try {
            const response = await apiClient.get('/auth/profile');
            if (response.success && response.data.user.role === 'admin') {
              setAdminUser(response.data.user);
              console.log('✅ Valid admin access from MongoDB:', response.data.user.email);
            } else {
              // Token không hợp lệ hoặc không phải admin
              console.log('❌ Invalid admin access, user role:', response.data?.user?.role);
              setAdminUser(null);
            }
          } catch (error) {
            console.log('❌ Token verification failed:', error.message);
            setAdminUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing admin auth:', error);
        localStorage.removeItem('cinema_admin');
        localStorage.removeItem('cinema_admin_token');
        setAdminUser(null);
      } finally {
        setAdminLoading(false);
      }
    };

    initializeAdminAuth();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      console.log('🔐 Admin login attempt for:', email);
      setAdminLoading(true);
      
      // Chỉ dùng MongoDB API - không có demo accounts
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Kiểm tra role admin
        if (user.role !== 'admin') {
          console.log('❌ User is not admin:', user.role);
          toast.error('Tài khoản không có quyền admin!');
          return false;
        }

        console.log('✅ Admin login successful from MongoDB:', user.email);
        console.log('� Admin data:', {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          source: 'MongoDB'
        });
        
        // Lưu admin thật từ MongoDB (không clear user tokens)
        setAdminUser(user);
        localStorage.setItem('cinema_admin', JSON.stringify(user));
        localStorage.setItem('cinema_admin_token', token);
        
        toast.success('Đăng nhập admin thành công!');
        return true;
      } else {
        console.log('❌ Login failed:', response.message);
        toast.error(response.message || 'Đăng nhập thất bại!');
        return false;
      }
    } catch (error) {
      console.error('❌ Admin login error:', error.message);
      toast.error(error.message || 'Lỗi đăng nhập admin!');
      return false;
    } finally {
      setAdminLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      // Gọi API logout nếu có token
      const token = localStorage.getItem('cinema_admin_token');
      if (token) {
        try {
          await apiClient.post('/auth/logout');
          console.log('✅ Admin logout API successful');
        } catch (error) {
          console.error('❌ Logout API error:', error);
        }
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Xóa state local
      setAdminUser(null);
      localStorage.removeItem('cinema_admin');
      localStorage.removeItem('cinema_admin_token');
      console.log('🔓 Admin logged out - cleared MongoDB data');
      toast.success('Đăng xuất thành công!');
    }
  };

  const isAdminAuthenticated = !!adminUser;

  const value = {
    adminUser,
    adminLoading,
    isAdminAuthenticated,
    adminLogin,
    adminLogout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};