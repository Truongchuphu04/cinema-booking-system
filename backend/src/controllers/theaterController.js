const Theater = require('../models/Theater');
const { validationResult } = require('express-validator');

// Get all theaters
const getAllTheaters = async (req, res) => {
  try {
    const { status, location } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const theaters = await Theater.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters
    });
  } catch (error) {
    console.error('Error fetching theaters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching theaters',
      error: error.message
    });
  }
};

// Get single theater
const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(200).json({
      success: true,
      data: theater
    });
  } catch (error) {
    console.error('Error fetching theater:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching theater',
      error: error.message
    });
  }
};

// Create new theater
const createTheater = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const theaterData = {
      ...req.body,
      createdBy: req.user?.id // Assuming you have user auth middleware
    };

    const theater = await Theater.create(theaterData);
    await theater.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Theater created successfully',
      data: theater
    });
  } catch (error) {
    console.error('Error creating theater:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Theater with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating theater',
      error: error.message
    });
  }
};

// Update theater
const updateTheater = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const theater = await Theater.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'username email');

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theater updated successfully',
      data: theater
    });
  } catch (error) {
    console.error('Error updating theater:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating theater',
      error: error.message
    });
  }
};

// Delete theater
const deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theater deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting theater:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting theater',
      error: error.message
    });
  }
};

// Get theater statistics
const getTheaterStats = async (req, res) => {
  try {
    const stats = await Theater.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          avgCapacity: { $avg: '$capacity' }
        }
      }
    ]);

    const totalTheaters = await Theater.countDocuments();
    const totalCapacity = await Theater.aggregate([
      { $group: { _id: null, total: { $sum: '$capacity' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalTheaters,
        totalCapacity: totalCapacity[0]?.total || 0,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Error fetching theater stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching theater statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
  getTheaterStats
};