const Movie = require('../models/Movie');

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Movie.countDocuments(query);
    
    res.json({
      success: true,
      data: movies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMovies: total,
        hasNext: skip + movies.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Get movie by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new movie
const createMovie = async (req, res) => {
  try {
    const movieData = req.body;
    console.log('📥 Received movie data:', JSON.stringify(movieData, null, 2));
    
    // Validate required fields
    const requiredFields = ['title', 'overview', 'release_date', 'runtime', 'genre'];
    const missingFields = requiredFields.filter(field => !movieData[field]);
    console.log('🔍 Required fields check:');
    requiredFields.forEach(field => {
      console.log(`  ${field}: ${movieData[field] ? '✅' : '❌'} (${movieData[field]})`);
    });
    console.log('🔍 Missing fields:', missingFields);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const movie = new Movie(movieData);
    await movie.save();
    
    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    console.error('Create movie error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update movie
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete movie
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get movies by status
const getMoviesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const movies = await Movie.find({ status }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Get movies by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search movies
const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { overview: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } }
      ]
    }).sort({ vote_average: -1 }).limit(20);
    
    res.json({
      success: true,
      data: movies
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get movie statistics
const getMovieStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const showingMovies = await Movie.countDocuments({ status: 'showing' });
    const upcomingMovies = await Movie.countDocuments({ status: 'upcoming' });
    const endedMovies = await Movie.countDocuments({ status: 'ended' });
    
    res.json({
      success: true,
      data: {
        totalMovies,
        showingMovies,
        upcomingMovies,
        endedMovies
      }
    });
  } catch (error) {
    console.error('Get movie stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMoviesByStatus,
  searchMovies,
  getMovieStats
};