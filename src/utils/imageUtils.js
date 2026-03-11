// Utility functions for handling image URLs

/**
 * Replace placeholder URLs with local SVG fallbacks
 * @param {string} imageUrl - The image URL to process
 * @param {string} type - 'poster' or 'backdrop'
 * @returns {string} - Processed image URL
 */
export const processImageUrl = (imageUrl, type = 'poster') => {
  if (!imageUrl) {
    return type === 'backdrop' ? '/placeholder-backdrop.svg' : '/placeholder-poster.svg';
  }

  // Replace placeholder URLs with local SVG files
  if (imageUrl.includes('via.placeholder.com') ||
    imageUrl.includes('/api/placeholder/') ||
    imageUrl.includes('500x750') ||
    imageUrl.includes('No+Poster') ||
    imageUrl.includes('1a1a1a') ||
    imageUrl.includes('ffffff')) {
    return type === 'backdrop' ? '/placeholder-backdrop.svg' : '/placeholder-poster.svg';
  }

  // Return the original URL if it's valid
  return imageUrl;
};

/**
 * Get poster URL with fallback
 * @param {Object} movie - Movie object
 * @returns {string} - Processed poster URL
 */
export const getPosterUrl = (movie) => {
  return processImageUrl(movie?.poster || movie?.poster_path, 'poster');
};

/**
 * Get backdrop URL with fallback
 * @param {Object} movie - Movie object
 * @returns {string} - Processed backdrop URL
 */
export const getBackdropUrl = (movie) => {
  return processImageUrl(movie?.backdrop_path || movie?.poster, 'backdrop');
};