import React, { createContext, useContext, useState, useEffect } from 'react';
import { showtimeAPI } from '../services/apiServices';

const ShowtimeContext = createContext();

export const useShowtimes = () => {
  const context = useContext(ShowtimeContext);
  if (!context) {
    throw new Error('useShowtimes must be used within a ShowtimeProvider');
  }
  return context;
};

export const ShowtimeProvider = ({ children }) => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch showtimes from API
  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await showtimeAPI.getAll();
      setShowtimes(response.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi tải danh sách lịch chiếu');
      console.error('Error fetching showtimes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load showtimes on component mount
  useEffect(() => {
    fetchShowtimes();
  }, []);

  const addShowtime = async (showtimeData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await showtimeAPI.create(showtimeData);
      const newShowtime = response.data;
      setShowtimes(prevShowtimes => [...prevShowtimes, newShowtime]);
      return newShowtime;
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = errorData?.message || 'Lỗi khi tạo lịch chiếu';
      
      // If there's conflict information, format it nicely
      if (errorData?.conflict) {
        errorMessage = `❌ Khung giờ bị trùng!\n\n` +
          `🎬 Phim đang chiếu: "${errorData.conflict.movieTitle}"\n` +
          `⏰ Thời gian: ${errorData.conflict.time}\n` +
          `⏱️ Thời lượng: ${errorData.conflict.duration} phút\n\n` +
          `💡 Vui lòng chọn khung giờ khác hoặc sử dụng tính năng "Chọn khung giờ" để xem các slot khả dụng.`;
      }
      
      setError(errorMessage);
      console.error('Error creating showtime:', error);
      
      // Return the error with conflict info for frontend handling
      const customError = new Error(errorMessage);
      customError.conflict = errorData?.conflict;
      throw customError;
    } finally {
      setLoading(false);
    }
  };

  const updateShowtime = async (showtimeId, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await showtimeAPI.update(showtimeId, updatedData);
      const updatedShowtime = response.data;
      setShowtimes(prevShowtimes =>
        prevShowtimes.map(showtime =>
          showtime._id === showtimeId || showtime.id === showtimeId
            ? updatedShowtime
            : showtime
        )
      );
      return updatedShowtime;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật lịch chiếu';
      setError(errorMessage);
      console.error('Error updating showtime:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteShowtime = async (showtimeId) => {
    try {
      setLoading(true);
      setError(null);
      await showtimeAPI.delete(showtimeId);
      setShowtimes(prevShowtimes => 
        prevShowtimes.filter(showtime => 
          showtime._id !== showtimeId && showtime.id !== showtimeId
        )
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi xóa lịch chiếu';
      setError(errorMessage);
      console.error('Error deleting showtime:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getShowtimesByMovie = (movieId) => {
    return showtimes.filter(showtime => showtime.movieId === parseInt(movieId));
  };

  const getShowtimesByTheater = (theaterId) => {
    return showtimes.filter(showtime => showtime.theaterId === parseInt(theaterId));
  };

  const getShowtimesByDate = (date) => {
    return showtimes.filter(showtime => showtime.date === date);
  };

  const bookSeats = (showtimeId, numberOfSeats) => {
    setShowtimes(prevShowtimes =>
      prevShowtimes.map(showtime =>
        showtime.id === showtimeId
          ? { 
              ...showtime, 
              availableSeats: Math.max(0, showtime.availableSeats - numberOfSeats)
            }
          : showtime
      )
    );
  };

  // Get available time slots
  const getAvailableTimeSlots = async (theaterId, roomId, date, movieId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await showtimeAPI.getAvailableTimeSlots(theaterId, roomId, date, movieId);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy khung giờ khả dụng';
      setError(errorMessage);
      console.error('Error getting available time slots:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Copy showtimes
  const copyShowtimes = async (fromDate, toDate, theaterId, roomId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await showtimeAPI.copyShowtimes(fromDate, toDate, theaterId, roomId);
      // Refresh showtimes after copy
      await fetchShowtimes();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi sao chép lịch chiếu';
      setError(errorMessage);
      console.error('Error copying showtimes:', error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    showtimes,
    loading,
    error,
    addShowtime,
    updateShowtime,
    deleteShowtime,
    getShowtimesByMovie,
    getShowtimesByTheater,
    getShowtimesByDate,
    bookSeats,
    setShowtimes,
    fetchShowtimes,
    getAvailableTimeSlots,
    copyShowtimes,
    setError
  };

  return (
    <ShowtimeContext.Provider value={value}>
      {children}
    </ShowtimeContext.Provider>
  );
};

export default ShowtimeContext;