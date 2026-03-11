const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  overview: {
    type: String,
    required: [true, 'Movie overview is required'],
    maxlength: [2000, 'Overview cannot exceed 2000 characters']
  },
  poster: {
    type: String,
    default: '/placeholder-poster.svg'
  },
  poster_path: {
    type: String,
    default: '/placeholder-poster.svg'
  },
  backdrop_path: {
    type: String,
    default: '/placeholder-backdrop.svg'
  },
  release_date: {
    type: Date,
    required: [true, 'Release date is required']
  },
  runtime: {
    type: Number,
    required: [true, 'Runtime is required'],
    min: [1, 'Runtime must be at least 1 minute']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  genres: [{
    name: {
      type: String,
      required: true
    }
  }],
  genre: {
    type: String,
    required: [true, 'Genre is required']
  },
  vote_average: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  vote_count: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'coming_soon', 'showing', 'ended'],
    default: 'showing'
  },
  language: {
    type: String,
    default: 'en'
  },
  original_language: {
    type: String,
    default: 'en'
  },
  tagline: {
    type: String,
    maxlength: [300, 'Tagline cannot exceed 300 characters']
  },
  budget: {
    type: Number,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  adult: {
    type: Boolean,
    default: false
  },
  video: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ status: 1 });
movieSchema.index({ release_date: -1 });
movieSchema.index({ vote_average: -1 });
movieSchema.index({ popularity: -1 });

// Virtual for formatted genre string
movieSchema.virtual('genreString').get(function() {
  return this.genres && Array.isArray(this.genres) 
    ? this.genres.map(g => g.name).join(', ') 
    : '';
});

// Pre-save middleware to sync genre fields
movieSchema.pre('save', function(next) {
  // Sync genre and genres fields
  if (this.genres && this.genres.length > 0) {
    this.genre = this.genres.map(g => g.name).join(', ');
  } else if (this.genre) {
    this.genres = this.genre.split(',').map(name => ({ name: name.trim() }));
  }
  
  // Sync runtime and duration
  if (this.runtime && !this.duration) {
    this.duration = this.runtime;
  } else if (this.duration && !this.runtime) {
    this.runtime = this.duration;
  }
  
  // Sync rating and vote_average
  if (this.rating && !this.vote_average) {
    this.vote_average = this.rating;
  } else if (this.vote_average && !this.rating) {
    this.rating = this.vote_average;
  }
  
  // Sync poster paths
  if (this.poster && !this.poster_path) {
    this.poster_path = this.poster;
  } else if (this.poster_path && !this.poster) {
    this.poster = this.poster_path;
  }
  
  next();
});

module.exports = mongoose.model('Movie', movieSchema);