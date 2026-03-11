const express = require('express');
const { body } = require('express-validator');
const {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
  getTheaterStats
} = require('../controllers/theaterController');

const router = express.Router();

// Validation rules
const theaterValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Theater name must be between 1-100 characters'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address must be between 1-200 characters'),
  body('location.city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be between 1-50 characters'),
  body('location.district')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('District must be between 1-50 characters'),
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location address cannot exceed 200 characters'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Status must be active, inactive, or maintenance'),
  body('facilities')
    .optional()
    .isArray()
    .withMessage('Facilities must be an array'),
  body('rooms')
    .optional()
    .isArray()
    .withMessage('Rooms must be an array')
];

// Routes
router.get('/stats', getTheaterStats);
router.get('/', getAllTheaters);
router.get('/:id', getTheaterById);
router.post('/', theaterValidation, createTheater);
router.put('/:id', theaterValidation, updateTheater);
router.delete('/:id', deleteTheater);

module.exports = router;