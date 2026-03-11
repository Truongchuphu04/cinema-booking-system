const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format: HH:MM
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  bookings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    seats: [String],
    bookingDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries and prevent duplicates
showtimeSchema.index({ theaterId: 1, roomId: 1, date: 1, time: 1 }, { unique: true });
showtimeSchema.index({ movieId: 1, date: 1 });
showtimeSchema.index({ date: 1, status: 1 });

// Clean up old indexes when model is loaded
showtimeSchema.statics.cleanOldIndexes = async function() {
  try {
    // Drop old conflicting indexes
    await this.collection.dropIndex('theater_1_showDate_1_showTime_1').catch(() => {});
    console.log('✅ Cleaned old theater index');
  } catch (error) {
    console.log('ℹ️ No old indexes to clean:', error.message);
  }
};

// Virtual for getting room info
showtimeSchema.virtual('roomInfo', {
  ref: 'Theater',
  localField: 'theaterId',
  foreignField: '_id',
  justOne: true,
  transform: (theater, doc) => {
    if (theater && theater.rooms) {
      return theater.rooms.find(room => room._id.toString() === doc.roomId.toString());
    }
    return null;
  }
});

// Ensure virtual fields are serialized
showtimeSchema.set('toJSON', { virtuals: true });
showtimeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Showtime', showtimeSchema);