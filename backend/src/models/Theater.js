const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theater name is required'],
    trim: true,
    maxlength: [100, 'Theater name cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Theater address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      maxlength: [50, 'District name cannot exceed 50 characters']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    }
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  capacity: {
    type: Number,
    required: [true, 'Theater capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  facilities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  image: {
    type: String,
    default: '/placeholder-theater.svg'
  },
  rooms: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    type: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
theaterSchema.index({ name: 1 });
theaterSchema.index({ location: 1 });
theaterSchema.index({ status: 1 });

// Virtual for total active rooms
theaterSchema.virtual('activeRooms').get(function() {
  return this.rooms.filter(room => room.status === 'active').length;
});

module.exports = mongoose.model('Theater', theaterSchema);