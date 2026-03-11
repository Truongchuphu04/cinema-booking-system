import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export const useAdminAccess = () => {
  const { user } = useAuth();
  const { adminUser } = useAdminAuth();

  // Check if current user has admin access through any context
  const hasAdminAccess = () => {
    // Direct admin context
    if (adminUser && adminUser.role === 'admin') {
      return true;
    }
    
    // User with admin role
    if (user && user.role === 'admin') {
      return true;
    }
    
    return false;
  };

  // Get current admin user data
  const getAdminUser = () => {
    if (adminUser && adminUser.role === 'admin') {
      return adminUser;
    }
    
    if (user && user.role === 'admin') {
      return user;
    }
    
    return null;
  };

  // Check if user is authenticated as admin
  const isAdminAuthenticated = hasAdminAccess();

  return {
    hasAdminAccess: hasAdminAccess(),
    isAdminAuthenticated,
    adminUser: getAdminUser(),
    loading: false // Could add loading logic if needed
  };
};