import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useShowtimes } from '../contexts/ShowtimeContext';
import { bookingAPI } from '../services/apiServices';

export const useSeatBooking = () => {
  const { movieId, showtimeId } = useParams();
  const location = useLocation();
  const { movies, loading: moviesLoading } = useMovies();
  const { showtimes } = useShowtimes();
  
  const [movie, setMovie] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState('select');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!moviesLoading && movies.length > 0) {
        try {
          setLoading(true);
          setError(null);

          // Get movie from context or location state
          let selectedMovie = movies.find(m => m._id === movieId || m.id === movieId);
          if (!selectedMovie && location.state?.movie) {
            selectedMovie = location.state.movie;
          }
        
          if (!selectedMovie) {
            throw new Error('Movie not found');
          }
          setMovie(selectedMovie);

          // Get showtime details
          let showtimeDetails = null;
          
          // Try to find showtime from context first
          if (showtimeId && showtimes?.length > 0) {
            showtimeDetails = showtimes.find(s => s._id === showtimeId || s.id === showtimeId);
          }
          
          // If not found, use location state
          if (!showtimeDetails && location.state?.showtime) {
            showtimeDetails = location.state.showtime;
          }
          
          // If still not found, create default (for backward compatibility)
          if (!showtimeDetails) {
            showtimeDetails = {
              _id: showtimeId,
              movieId: selectedMovie._id,
              date: location.state?.selectedDate || new Date().toISOString().split('T')[0],
              time: location.state?.selectedTime || "19:30",
              price: 100000,
              cinema: "CGV Vincom Center",
              room: "Phòng chiếu 1",
              theaterId: { 
                name: "CGV Vincom Center", 
                location: "Hà Nội"
              },
              roomId: "Phòng chiếu 1",
              totalSeats: 120,
              availableSeats: 100
            };
          }

          setShowDetails(showtimeDetails);

          // Load existing bookings for this showtime to determine occupied seats
          if (showtimeDetails && (showtimeDetails._id || showtimeDetails.id)) {
            await loadOccupiedSeats(showtimeDetails._id || showtimeDetails.id);
          }
        
        } catch (err) {
          setError(err.message);
          console.error('Error loading seat booking data:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [movieId, showtimeId, location.state, movies, moviesLoading, showtimes]);

  // Load occupied seats from existing bookings
  const loadOccupiedSeats = async (showtimeId) => {
    try {
      console.log('🪑 Loading occupied seats for showtime:', showtimeId);
      
      if (!showtimeId || showtimeId === 'undefined') {
        console.warn('Invalid showtimeId for occupied seats:', showtimeId);
        setOccupiedSeats({});
        return;
      }
      
      const response = await bookingAPI.getOccupiedSeats(showtimeId);
      
      if (response.success) {
        const occupiedSeatNumbers = response.data.occupiedSeats;
        console.log('🪑 Occupied seats received:', occupiedSeatNumbers);
        
        // Convert array to object format expected by UI
        const occupied = {};
        occupiedSeatNumbers.forEach(seatNumber => {
          occupied[seatNumber] = true;
        });
        
        setOccupiedSeats(occupied);
      } else {
        console.warn('Failed to load occupied seats:', response.message);
        setOccupiedSeats({});
      }
    } catch (error) {
      console.error('Error loading occupied seats:', error);
      // Fallback to empty occupied seats in case API fails
      setOccupiedSeats({});
    }
  };

  return {
    movie,
    showDetails,
    selectedSeats,
    setSelectedSeats,
    occupiedSeats,
    setOccupiedSeats,
    loading,
    bookingStep,
    setBookingStep,
    error
  };
};