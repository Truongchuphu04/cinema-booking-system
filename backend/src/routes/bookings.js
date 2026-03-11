const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getBookingStats,
  getAllBookings,
  getOccupiedSeats,
  simulatePaymentSuccess,
  simulatePaymentFailure
} = require('../controllers/bookingController');

const router = express.Router();

// User routes
router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getUserBookings);
router.get('/:id', auth, getBookingById);

// Debug endpoint để xem booking data
router.get('/:id/debug', async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('movieId')
      .populate('theaterId')
      .populate('showtimeId');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    res.json({
      success: true,
      data: booking,
      debug: {
        moviePopulated: !!booking.movieId,
        theaterPopulated: !!booking.theaterId,
        showtimePopulated: !!booking.showtimeId,
        movieTitle: booking.movieId?.title,
        theaterName: booking.theaterId?.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.patch('/:id/cancel', auth, cancelBooking);

// Admin routes
router.get('/admin/all', auth, getAllBookings);
router.get('/admin/stats', auth, getBookingStats);

// Get occupied seats for a showtime
router.get('/showtime/:showtimeId/occupied-seats', getOccupiedSeats);

// Payment simulation routes
router.post('/payment/simulate-success/:bookingId', auth, simulatePaymentSuccess);
router.post('/payment/simulate-failure/:bookingId', auth, simulatePaymentFailure);

module.exports = router;