const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByStatus,
  searchMovies,
  getMovieStats
} = require('../controllers/movieController');

const router = express.Router();

// Public routes
router.get('/', getAllMovies);
router.get('/search', searchMovies);
router.get('/stats', getMovieStats);
router.get('/status/:status', getMoviesByStatus);
router.get('/:id', getMovieById);

// Test route
router.post('/test', (req, res) => {
  console.log('🧪 Test route hit with body:', req.body);
  res.json({ success: true, message: 'Test successful', receivedData: req.body });
});

// Admin only routes - temporarily disabled for demo accounts
router.post('/', createMovie);
router.put('/:id', updateMovie);  
router.delete('/:id', deleteMovie);

module.exports = router;