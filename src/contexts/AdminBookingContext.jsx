import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookingAPI } from '../services/apiServices';
import { useAdminAccess } from '../hooks/useAdminAccess';

const AdminBookingContext = createContext();

export const useAdminBookings = () => {
  const context = useContext(AdminBookingContext);
  if (!context) {
    throw new Error('useAdminBookings must be used within an AdminBookingProvider');
  }
  return context;
};

export const AdminBookingProvider = ({ children }) => {
  const { hasAdminAccess } = useAdminAccess();
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug admin access
  console.log('🔑 AdminBookingProvider - hasAdminAccess:', hasAdminAccess);

  // Fetch all bookings (admin only)
  useEffect(() => {
    console.log('🔄 AdminBookingProvider useEffect triggered, hasAdminAccess:', hasAdminAccess);
    if (hasAdminAccess) {
      fetchAllBookings();
      fetchBookingStats();
    }
  }, [hasAdminAccess]);

  // Fetch all bookings from API
  const fetchAllBookings = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching all bookings for admin...');
      
      const response = await bookingAPI.getAllBookings(params);
      
      if (response.success) {
        setBookings(response.data || []);
        console.log('✅ Admin bookings loaded:', response.data?.length || 0);
        
        // Debug: Check customer info in bookings
        if (response.data && response.data.length > 0) {
          console.log('🔍 Admin booking sample data:', {
            booking: response.data[0],
            customerInfo: response.data[0]?.customerInfo,
            userId: response.data[0]?.userId
          });
        }
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      setError(error.message || 'Lỗi khi lấy danh sách đặt vé');
      console.error('Error fetching admin bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      console.log('📈 Fetching booking statistics...');
      
      const response = await bookingAPI.getStats();
      
      if (response.success) {
        setBookingStats(response.data || {});
        console.log('✅ Booking stats loaded:', response.data);
      } else {
        console.warn('Failed to fetch booking stats:', response.message);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      setBookingStats({});
    }
  };

  // Update booking status (admin only)
  const updateBookingStatus = async (bookingId, status) => {
    try {
      setLoading(true);
      setError(null);
      
      // Note: You may need to create this API endpoint
      console.log('🔄 Updating booking status:', bookingId, status);
      
      // For now, update locally and refetch
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId || booking.id === bookingId
            ? { ...booking, bookingStatus: status }
            : booking
        )
      );
      
      // Refetch to get latest data
      await fetchAllBookings();
      await fetchBookingStats();
      
    } catch (error) {
      setError(error.message || 'Lỗi khi cập nhật trạng thái đặt vé');
      console.error('Error updating booking status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get bookings by status
  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.bookingStatus === status);
  };

  // Get bookings by date range
  const getBookingsByDateRange = (startDate, endDate) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate || booking.createdAt);
      return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
    });
  };

  // Get revenue statistics
  const getRevenueStats = () => {
    const confirmedBookings = bookings.filter(b => 
      b.paymentStatus === 'paid' && (b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed')
    );
    
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = confirmedBookings.filter(b => {
      const bookingDate = new Date(b.bookingDate || b.createdAt);
      return bookingDate >= today;
    });
    
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    return {
      totalRevenue,
      todayRevenue,
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      pendingBookings: bookings.filter(b => b.bookingStatus === 'pending').length,
      cancelledBookings: bookings.filter(b => b.bookingStatus === 'cancelled').length
    };
  };

  // Search bookings
  const searchBookings = (query) => {
    if (!query) return bookings;
    
    const lowerQuery = query.toLowerCase();
    return bookings.filter(booking =>
      booking.bookingCode?.toLowerCase().includes(lowerQuery) ||
      booking.customerInfo?.name?.toLowerCase().includes(lowerQuery) ||
      booking.customerInfo?.email?.toLowerCase().includes(lowerQuery) ||
      booking.movieId?.title?.toLowerCase().includes(lowerQuery) ||
      booking.seats?.some(seat => seat.seatNumber?.toLowerCase().includes(lowerQuery))
    );
  };

  const value = {
    bookings,
    bookingStats,
    loading,
    error,
    fetchAllBookings,
    fetchBookingStats,
    updateBookingStatus,
    getBookingsByStatus,
    getBookingsByDateRange,
    getRevenueStats,
    searchBookings,
    setBookings,
    setError
  };

  return (
    <AdminBookingContext.Provider value={value}>
      {children}
    </AdminBookingContext.Provider>
  );
};

export default AdminBookingContext;