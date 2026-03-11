import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookingAPI } from '../services/apiServices';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user bookings when component mounts or user changes
  useEffect(() => {
    if (user && (user.id || user._id)) {
      fetchUserBookings();
    } else {
      // Clear bookings if user is not logged in
      setBookings([]);
      setError(null);
    }
  }, [user]);

  // Fetch user bookings from API
  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data);
    } catch (error) {
      setError(error.message || 'Lỗi khi lấy danh sách vé đặt');
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new booking
  const addBooking = async (bookingData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.create(bookingData);
      const newBooking = response.data;
      setBookings(prevBookings => [newBooking, ...prevBookings]);
      return newBooking;
    } catch (error) {
      setError(error.message || 'Lỗi khi đặt vé');
      console.error('Error creating booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.cancel(bookingId);
      const updatedBooking = response.data;
      
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === bookingId || booking.id === bookingId
            ? { ...booking, ...updatedBooking }
            : booking
        )
      );
      return updatedBooking;
    } catch (error) {
      setError(error.message || 'Lỗi khi hủy vé');
      console.error('Error cancelling booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get booking by ID
  const getBookingById = async (bookingId) => {
    try {
      const response = await bookingAPI.getById(bookingId);
      return response.data;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      throw error;
    }
  };

  // Helper functions for filtering bookings locally
  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.bookingStatus === status);
  };

  const getBookingsByDate = (date) => {
    return bookings.filter(booking => booking.showDate === date);
  };

  const getBookingsByMovie = (movieId) => {
    return bookings.filter(booking => 
      booking.movieId?._id === movieId || booking.movieId === movieId
    );
  };

  // Calculate statistics from current bookings
  const getBookingStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    const completed = bookings.filter(b => b.bookingStatus === 'completed').length;
    
    const totalRevenue = bookings
      .filter(booking => booking.paymentStatus === 'paid')
      .reduce((total, booking) => total + booking.totalAmount, 0);
    
    const totalSeats = bookings.reduce((sum, booking) => sum + (booking.seats?.length || 0), 0);
    const averagePricePerSeat = totalSeats > 0 ? totalRevenue / totalSeats : 0;

    return {
      total,
      confirmed,
      cancelled,
      completed,
      totalRevenue,
      totalSeats,
      averagePricePerSeat
    };
  };

  const validateBookingAmount = (seats, totalAmount) => {
    const calculatedAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
    return Math.abs(totalAmount - calculatedAmount) < 1000; // Allow small difference
  };

  const value = {
    bookings,
    loading,
    error,
    addBooking,
    cancelBooking,
    getBookingById,
    getBookingsByStatus,
    getBookingsByDate,
    getBookingsByMovie,
    getBookingStats,
    validateBookingAmount,
    fetchUserBookings,
    setBookings,
    setError
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;