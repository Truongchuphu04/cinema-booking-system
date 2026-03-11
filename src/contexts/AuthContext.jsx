import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra user đã đăng nhập từ localStorage và verify token
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Kiểm tra nếu đang ở trang admin thì không check user auth
        if (window.location.pathname.startsWith('/admin')) {
          console.log('🚫 Admin page detected, skipping user auth check');
          setLoading(false);
          return;
        }

        const storedUser = localStorage.getItem('cinema_user');
        const storedToken = localStorage.getItem('cinema_user_token');
        
        if (storedUser && storedToken) {
          // Verify token bằng cách gọi API profile
          try {
            const response = await apiClient.get('/auth/profile');
            if (response.success) {
              // Set user bất kể role - user có thể vừa là user vừa là admin
              setUser(response.data.user);
              console.log('✅ User token hợp lệ, user đã đăng nhập:', response.data.user.email, 'Role:', response.data.user.role);
            } else {
              // Token không hợp lệ, xóa storage
              console.log('❌ Token không hợp lệ, đang xóa storage');
              localStorage.removeItem('cinema_user');
              localStorage.removeItem('cinema_user_token');
              setUser(null);
            }
          } catch (error) {
            // Token hết hạn hoặc không hợp lệ
            console.error('❌ Lỗi verify token:', error.message);
            localStorage.removeItem('cinema_user');
            localStorage.removeItem('cinema_user_token');
            setUser(null);
          }
        } else {
          console.log('📝 Không có user hoặc token trong localStorage');
        }
      } catch (error) {
        console.error('❌ Lỗi check auth status:', error);
        localStorage.removeItem('cinema_user');
        localStorage.removeItem('cinema_user_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);



  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Đang đăng nhập với email:', email);
      
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      if (response.success) {
        const { user, token } = response.data;
        console.log('✅ Đăng nhập thành công:', user.email);
        console.log('🔑 Token nhận được:', token ? 'Yes' : 'No');
        
        // Lưu user và token vào localStorage (không clear admin tokens)
        setUser(user);
        localStorage.setItem('cinema_user', JSON.stringify(user));
        localStorage.setItem('cinema_user_token', token);
        
        toast.success('Đăng nhập thành công!');
        return { success: true };
      } else {
        console.log('❌ Đăng nhập thất bại:', response.message);
        toast.error(response.message || 'Đăng nhập thất bại!');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Lỗi đăng nhập:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi đăng nhập!';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('📝 Đang đăng ký user:', userData.email);
      
      const response = await apiClient.post('/auth/register', {
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || ''
      });

      if (response.success) {
        const { user, token } = response.data;
        console.log('✅ Đăng ký thành công:', user.email);
        
        // Lưu user và token vào localStorage
        setUser(user);
        localStorage.setItem('cinema_user', JSON.stringify(user));
        localStorage.setItem('cinema_user_token', token);
        
        toast.success('Đăng ký thành công!');
        return { success: true };
      } else {
        console.log('❌ Đăng ký thất bại:', response.message);
        toast.error(response.message || 'Đăng ký thất bại!');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Lỗi đăng ký:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi đăng ký!';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Gọi API logout nếu có token
      const token = localStorage.getItem('cinema_user_token');
      if (token) {
        try {
          await apiClient.post('/auth/logout');
          console.log('✅ Đăng xuất API thành công');
        } catch (error) {
          console.error('❌ Lỗi logout API:', error);
          // Vẫn tiếp tục logout local dù API lỗi
        }
      }
    } catch (error) {
      console.error('❌ Lỗi logout:', error);
    } finally {
      // Xóa state local bất kể API response
      setUser(null);
      localStorage.removeItem('cinema_user');
      localStorage.removeItem('cinema_user_token');
      console.log('🔓 Đã xóa user và token khỏi localStorage');
      toast.success('Đăng xuất thành công!');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const response = await apiClient.put('/auth/profile', profileData);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('cinema_user', JSON.stringify(updatedUser));
        
        toast.success('Cập nhật thông tin thành công!');
        return { success: true };
      } else {
        toast.error(response.message || 'Cập nhật thất bại!');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi cập nhật thông tin!';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.success) {
        toast.success('Đổi mật khẩu thành công!');
        return { success: true };
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại!');
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi đổi mật khẩu!';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile in auth context
  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cinema_user', JSON.stringify(updatedUser));
    console.log('✅ User profile updated in AuthContext:', updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    updateUserProfile,
    changePassword,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
