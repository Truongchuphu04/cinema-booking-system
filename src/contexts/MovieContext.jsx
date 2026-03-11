import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Enable API calls - backend is ready
import { movieAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const MovieContext = createContext();

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

export const MovieProvider = ({ children }) => {
  // Local movies state - updated from API
  const [movies, setMovies] = useState([]);
  
  // API data fetching - now enabled with MongoDB backend
  const [apiMovies, setApiMovies] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // Fetch movies from API
  const refetch = useCallback(async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      console.log('Fetching movies from API...');
      const response = await movieAPI.getAll();
      const moviesData = response.data || response;
      setApiMovies(moviesData);
      console.log('Movies fetched successfully:', moviesData.length, 'movies');
    } catch (error) {
      setApiError(error.message);
      console.error('❌ Error fetching movies from MongoDB API:', error);
      console.log('🚫 No fallback data - showing empty state');
      setApiMovies([]); // Clear movies on error
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Clear old localStorage data and load movies from MongoDB
  useEffect(() => {
    // Clean up old localStorage data
    localStorage.removeItem('cinema_movies');
    localStorage.removeItem('cinema_movies_cache');
    localStorage.removeItem('movies'); // In case there's other movie storage
    console.log('🧹 Cleared old localStorage movie data');
    
    // Load fresh data from MongoDB
    refetch();
  }, [refetch]);

  // Update local state when API data changes (no localStorage caching)
  useEffect(() => {
    if (apiMovies && apiMovies.length >= 0) {
      setMovies(apiMovies);
      console.log('📺 Movies updated from MongoDB:', apiMovies.length, 'movies');
    }
  }, [apiMovies]);

  // No localStorage sync - pure MongoDB data

  // Add a new movie using API
  const addMovie = async (movieData) => {
    try {
      const moviePayload = {
        ...movieData,
        // Ensure both formats are available
        genre: Array.isArray(movieData.genres) 
          ? movieData.genres.map(g => g.name).join(', ')
          : movieData.genre || '',
        genres: typeof movieData.genre === 'string'
          ? movieData.genre.split(', ').map(name => ({ name }))
          : movieData.genres || [],
        duration: movieData.duration || movieData.runtime || 0,
        runtime: movieData.runtime || movieData.duration || 0,
        rating: movieData.rating || movieData.vote_average || 0,
        vote_average: movieData.vote_average || movieData.rating || 0,
      };

      console.log('📤 Sending movie data to API:', moviePayload);
      console.log('📤 Required fields check:', {
        title: moviePayload.title,
        overview: moviePayload.overview,
        release_date: moviePayload.release_date,
        runtime: moviePayload.runtime,
        genre: moviePayload.genre
      });

      const response = await movieAPI.create(moviePayload);
      const newMovie = response.data || response;
      
      // Update local state
      setMovies(prevMovies => [...prevMovies, newMovie]);
      toast.success('Thêm phim thành công!');
      return newMovie;
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error('Lỗi khi thêm phim: ' + error.message);
      throw error;
    }
  };

  // Update a movie using API
  const updateMovie = async (movieId, updatedData) => {
    try {
      const moviePayload = {
        ...updatedData,
        // Ensure both formats are available
        genre: Array.isArray(updatedData.genres) 
          ? updatedData.genres.map(g => g.name).join(', ')
          : updatedData.genre || '',
        genres: typeof updatedData.genre === 'string'
          ? updatedData.genre.split(', ').map(name => ({ name }))
          : updatedData.genres || [],
        duration: updatedData.duration || updatedData.runtime || 0,
        runtime: updatedData.runtime || updatedData.duration || 0,
        rating: updatedData.rating || updatedData.vote_average || 0,
        vote_average: updatedData.vote_average || updatedData.rating || 0,
      };

      const response = await movieAPI.update(movieId, moviePayload);
      const updatedMovie = response.data || response;
      
      // Update local state
      setMovies(prevMovies =>
        prevMovies.map(movie =>
          movie.id === movieId || movie._id === movieId
            ? updatedMovie
            : movie
        )
      );
      
      toast.success('Cập nhật phim thành công!');
      return updatedMovie;
    } catch (error) {
      console.error('Error updating movie:', error);
      toast.error('Lỗi khi cập nhật phim: ' + error.message);
      throw error;
    }
  };

  // Delete a movie using API
  const deleteMovie = async (movieId) => {
    try {
      await movieAPI.delete(movieId);
      
      // Update local state
      setMovies(prevMovies => 
        prevMovies.filter(movie => 
          movie.id !== movieId && movie._id !== movieId
        )
      );
      
      toast.success('Xóa phim thành công!');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Lỗi khi xóa phim: ' + error.message);
      throw error;
    }
  };

  // Get movies by status
  const getMoviesByStatus = (status) => {
    if (!status) return movies;
    return movies.filter(movie => movie.status === status);
  };

  // Get movie by ID
  const getMovieById = (movieId) => {
    return movies.find(movie => movie.id === parseInt(movieId));
  };

  // Search functionality (localStorage only until backend is ready)
  const searchMovies = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      (movie.genre && movie.genre.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value = {
    // Data
    movies,
    loading: apiLoading,
    error: apiError,
    
    // Actions
    addMovie,
    updateMovie,
    deleteMovie,
    searchMovies,
    refetch,
    setMovies, // For backward compatibility
    
    // Getters
    getMoviesByStatus,
    getMovieById,
    
    // Statistics
    totalMovies: movies.length,
    showingMovies: movies.filter(m => m.status === 'showing').length,
    upcomingMovies: movies.filter(m => m.status === 'upcoming').length,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

export default MovieContext;