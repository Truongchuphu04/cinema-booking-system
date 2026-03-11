const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: true
  },
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
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['standard', 'vip', 'couple'],
      default: 'standard'
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'momo', 'zalopay', 'banking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookingCode: {
    type: String,
    unique: true
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  showDate: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  showTime: {
    type: String, // Format: HH:MM
    required: true
  },
  qrCode: String, // QR code for ticket validation
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ showtimeId: 1 });
bookingSchema.index({ bookingCode: 1 }, { unique: true });
bookingSchema.index({ paymentStatus: 1, bookingStatus: 1 });

// Generate booking code before saving
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingCode) {
    // Generate booking code: CM + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingCode = `CM${timestamp}${random}`;
  }
  next();
});

// Virtual for formatted booking date
bookingSchema.virtual('formattedBookingDate').get(function() {
  return this.bookingDate.toLocaleDateString('vi-VN');
});

// Virtual for total seats count
bookingSchema.virtual('totalSeats').get(function() {
  return this.seats.length;
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);