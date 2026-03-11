// Authentication utilities to handle token conflicts

export const clearAllAuthData = () => {
  console.log('🧹 Clearing all auth data...');
  
  // Clear user data
  localStorage.removeItem('cinema_user');
  localStorage.removeItem('cinema_user_token');
  
  // Clear admin data
  localStorage.removeItem('cinema_admin');
  localStorage.removeItem('cinema_admin_token');
  
  // Clear legacy data
  localStorage.removeItem('admin_token');
  localStorage.removeItem('user_token');
  
  console.log('✅ All auth data cleared');
};

export const clearUserAuthData = () => {
  console.log('🧹 Clearing user auth data...');
  localStorage.removeItem('cinema_user');
  localStorage.removeItem('cinema_user_token');
  console.log('✅ User auth data cleared');
};

export const clearAdminAuthData = () => {
  console.log('🧹 Clearing admin auth data...');
  localStorage.removeItem('cinema_admin');
  localStorage.removeItem('cinema_admin_token');
  console.log('✅ Admin auth data cleared');
};

export const getCurrentAuthType = () => {
  const hasUserToken = localStorage.getItem('cinema_user_token');
  const hasAdminToken = localStorage.getItem('cinema_admin_token');
  
  if (hasAdminToken && hasUserToken) {
    return 'conflict'; // Both exist - problematic
  } else if (hasAdminToken) {
    return 'admin';
  } else if (hasUserToken) {
    return 'user';
  } else {
    return 'none';
  }
};

export const getAuthToken = (forceType = null) => {
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath.startsWith('/admin');
  
  if (forceType === 'admin' || isAdminPage) {
    return localStorage.getItem('cinema_admin_token');
  } else if (forceType === 'user' || !isAdminPage) {
    return localStorage.getItem('cinema_user_token');
  }
  
  // Fallback - this should rarely be used
  return localStorage.getItem('cinema_admin_token') || 
         localStorage.getItem('cinema_user_token');
};

export const validateAuthState = () => {
  const authType = getCurrentAuthType();
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath.startsWith('/admin');
  
  if (authType === 'conflict') {
    console.warn('⚠️ Authentication conflict detected! Both user and admin tokens exist.');
    // Note: We no longer auto-clear tokens, let both coexist
  }
  
  return getCurrentAuthType();
};

export const hasAdminAccess = () => {
  // Check if user has admin access through either context
  
  // Check admin context
  const adminToken = localStorage.getItem('cinema_admin_token');
  const adminUser = localStorage.getItem('cinema_admin');
  
  if (adminToken && adminUser) {
    try {
      const admin = JSON.parse(adminUser);
      if (admin.role === 'admin') return true;
    } catch (error) {
      console.warn('Error parsing admin user:', error);
    }
  }
  
  // Check user context with admin role  
  const userToken = localStorage.getItem('cinema_user_token');
  const userData = localStorage.getItem('cinema_user');
  
  if (userToken && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'admin') return true;
    } catch (error) {
      console.warn('Error parsing user data:', error);
    }
  }
  
  return false;
};

export const getCurrentUserData = () => {
  // Return current user data, preferring admin context
  
  // Check admin context first
  const adminUser = localStorage.getItem('cinema_admin');
  if (adminUser) {
    try {
      return JSON.parse(adminUser);
    } catch (error) {
      console.warn('Error parsing admin user:', error);
    }
  }
  
  // Fallback to user context
  const userData = localStorage.getItem('cinema_user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.warn('Error parsing user data:', error);
    }
  }
  
  return null;
};