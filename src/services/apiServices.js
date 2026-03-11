import { apiClient } from './api';

// Movie API functions
export const movieAPI = {
  // Get all movies
  getAll: () => apiClient.get('/movies'),
  
  // Get movie by ID
  getById: (id) => apiClient.get(`/movies/${id}`),
  
  // Create new movie
  create: (movieData) => apiClient.post('/movies', movieData),
  
  // Update movie
  update: (id, movieData) => apiClient.put(`/movies/${id}`, movieData),
  
  // Delete movie
  delete: (id) => apiClient.delete(`/movies/${id}`),
  
  // Upload movie poster
  uploadPoster: (id, file) => {
    const formData = new FormData();
    formData.append('poster', file);
    return apiClient.upload(`/movies/${id}/poster`, formData);
  },
  
  // Get movies by status
  getByStatus: (status) => apiClient.get(`/movies?status=${status}`),
  
  // Search movies
  search: (query) => apiClient.get(`/movies/search?q=${encodeURIComponent(query)}`),
};

// User API functions
export const userAPI = {
  // Get all users (admin only)
  getAll: () => apiClient.get('/users'),
  
  // Get user by ID
  getById: (id) => apiClient.get(`/users/${id}`),
  
  // Create new user
  create: (userData) => apiClient.post('/users', userData),
  
  // Update user
  update: (id, userData) => apiClient.put(`/users/${id}`, userData),
  
  // Delete user
  delete: (id) => apiClient.delete(`/users/${id}`),
  
  // Toggle user status
  toggleStatus: (id) => apiClient.put(`/users/${id}/toggle-status`),
  
  // Get user statistics
  getStats: () => apiClient.get('/users/stats'),
  
  // Register new user
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Get current user profile
  getProfile: () => apiClient.get('/users/profile'),
  
  // Update user profile
  updateProfile: (userData) => apiClient.put('/users/profile', userData),
};

// Theater API functions
export const theaterAPI = {
  // Get all theaters
  getAll: () => apiClient.get('/theaters'),
  
  // Get theater by ID  
  getById: (id) => apiClient.get(`/theaters/${id}`),
  
  // Create new theater
  create: (theaterData) => apiClient.post('/theaters', theaterData),
  
  // Update theater
  update: (id, theaterData) => apiClient.put(`/theaters/${id}`, theaterData),
  
  // Delete theater
  delete: (id) => apiClient.delete(`/theaters/${id}`),
  
  // Get theater statistics
  getStats: () => apiClient.get('/theaters/stats'),
  
  // Get theaters by filter
  getByFilter: (filters) => apiClient.get('/theaters', { params: filters }),
  
  // Search theaters
  search: (query) => apiClient.get(`/theaters/search?q=${query}`),
  
  // Update theater status
  updateStatus: (id, status) => apiClient.patch(`/theaters/${id}/status`, { status }),
  
  // Bulk delete theaters
  bulkDelete: (theaterIds) => apiClient.delete('/theaters/bulk', { data: { ids: theaterIds } }),
  
  // Get theaters by location
  getByLocation: (location) => apiClient.get(`/theaters/location/${location}`),
  
  // Get theaters by capacity range
  getByCapacity: (minCapacity, maxCapacity) => apiClient.get(`/theaters/capacity?min=${minCapacity}&max=${maxCapacity}`),
  
  // Get theaters by status
  getByStatus: (status) => apiClient.get(`/theaters?status=${status}`),
  
  // Get active theaters only
  getActive: () => apiClient.get('/theaters?status=active')
};

// Showtime API functions  
export const showtimeAPI = {
  // Get all showtimes
  getAll: () => apiClient.get('/showtimes'),
  
  // Get showtime by ID
  getById: (id) => apiClient.get(`/showtimes/${id}`),
  
  // Create new showtime
  create: (showtimeData) => apiClient.post('/showtimes', showtimeData),
  
  // Update showtime
  update: (id, showtimeData) => apiClient.put(`/showtimes/${id}`, showtimeData),
  
  // Delete showtime
  delete: (id) => apiClient.delete(`/showtimes/${id}`),
  
  // Get showtimes by movie
  getByMovie: (movieId) => apiClient.get(`/showtimes?movieId=${movieId}`),
  
  // Get showtimes by theater
  getByTheater: (theaterId) => apiClient.get(`/showtimes?theaterId=${theaterId}`),
  
  // Get showtimes by date
  getByDate: (date) => apiClient.get(`/showtimes?date=${date}`),
  
  // Get available time slots for a specific theater, room and date
  getAvailableTimeSlots: (theaterId, roomId, date, movieId) => 
    apiClient.get(`/showtimes/available-slots?theaterId=${theaterId}&roomId=${roomId}&date=${date}&movieId=${movieId}`),
  
  // Copy showtimes from one date to another
  copyShowtimes: (fromDate, toDate, theaterId, roomId = null) => 
    apiClient.post('/showtimes/copy', { fromDate, toDate, theaterId, roomId }),
};

// Booking API functions
export const bookingAPI = {
  // Create new booking
  create: (bookingData) => apiClient.post('/bookings', bookingData),
  
  // Get user bookings
  getUserBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/bookings/my-bookings${queryString ? '?' + queryString : ''}`);
  },
  
  // Get booking by ID
  getById: (id) => apiClient.get(`/bookings/${id}`),
  
  // Get bookings by showtime ID (to check occupied seats)
  getByShowtime: (showtimeId) => apiClient.get(`/bookings/showtime/${showtimeId}`),
  
  // Cancel booking
  cancel: (id) => apiClient.patch(`/bookings/${id}/cancel`),
  
  // Admin - Get all bookings
  getAllBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/bookings/admin/all${queryString ? '?' + queryString : ''}`);
  },
  
  // Admin - Get booking statistics
  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/bookings/admin/stats${queryString ? '?' + queryString : ''}`);
  },

  // Get occupied seats for a showtime
  getOccupiedSeats: (showtimeId) => apiClient.get(`/bookings/showtime/${showtimeId}/occupied-seats`),

  // Simulate payment success
  simulatePaymentSuccess: (bookingId) => apiClient.post(`/bookings/payment/simulate-success/${bookingId}`),

  // Simulate payment failure
  simulatePaymentFailure: (bookingId) => apiClient.post(`/bookings/payment/simulate-failure/${bookingId}`),
};



// Admin API functions
export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  
  // Get revenue analytics
  getRevenueAnalytics: (period = 'month') => 
    apiClient.get(`/admin/analytics/revenue?period=${period}`),
  
  // Get user analytics
  getUserAnalytics: () => apiClient.get('/admin/analytics/users'),
  
  // Get movie analytics
  getMovieAnalytics: () => apiClient.get('/admin/analytics/movies'),
  
  // Admin login
  login: (credentials) => apiClient.post('/auth/admin-login', credentials),
  
  // Get system settings
  getSettings: () => apiClient.get('/admin/settings'),
  
  // Update system settings
  updateSettings: (settings) => apiClient.put('/admin/settings', settings),
};