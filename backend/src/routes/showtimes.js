const express = require('express');
const router = express.Router();
const {
  getAllShowtimes,
  getShowtimesDebug,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getAvailableTimeSlots,
  copyShowtimes
} = require('../controllers/showtimeController');

// Get all showtimes
router.get('/', getAllShowtimes);

// Debug endpoint để xem raw data
router.get('/debug', getShowtimesDebug);

// Cleanup endpoint để xóa bad data
router.delete('/cleanup', async (req, res) => {
  try {
    const Showtime = require('../models/Showtime');
    
    // Xóa documents với null values
    const result = await Showtime.deleteMany({
      $or: [
        { theaterId: null },
        { roomId: null }, 
        { date: null },
        { time: null },
        { movieId: null }
      ]
    });
    
    console.log('🧹 Cleanup result:', result);
    
    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} documents bị lỗi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available time slots for a specific theater/room/date
router.get('/available-slots', getAvailableTimeSlots);

// Copy showtimes from one date to another
router.post('/copy', copyShowtimes);

// Get showtime by ID
router.get('/:id', getShowtimeById);

// Create new showtime
router.post('/', createShowtime);

// Update showtime
router.put('/:id', updateShowtime);

// Delete showtime
router.delete('/:id', deleteShowtime);

module.exports = router;