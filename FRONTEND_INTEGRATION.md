# 🎯 Frontend Integration Guide

## Setup & Configuration

### 1. Environment Variables
File: `.env`
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENV=development
VITE_DEBUG=true
```

### 2. API Service Usage

#### Import API Functions
```javascript
import { movieAPI, bookingAPI, showtimeAPI, theaterAPI, userAPI } from '@/services/apiServices';
```

#### Example 1: Get All Movies
```javascript
import { movieAPI } from '@/services/apiServices';
import { useEffect, useState } from 'react';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieAPI.getAll();
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {movies.map(movie => (
        <div key={movie._id}>{movie.title}</div>
      ))}
    </div>
  );
}
```

#### Example 2: Using Custom Hooks
```javascript
import { useFetch, useMutation } from '@/hooks/useApi';
import { movieAPI } from '@/services/apiServices';
import { useState } from 'react';

function MovieManagement() {
  // Fetch data
  const { data: movies, loading, error, refetch } = useFetch(movieAPI.getAll);

  // Mutation for creating
  const { mutate: createMovie, loading: createLoading } = useMutation();

  const handleCreateMovie = async (movieData) => {
    await createMovie(
      () => movieAPI.create(movieData),
      {
        onSuccess: () => {
          refetch(); // Refresh movie list
        },
        successMessage: 'Phim đã được tạo thành công!',
        errorMessage: 'Lỗi khi tạo phim'
      }
    );
  };

  return (
    <div>
      {loading ? <div>Loading...</div> : (
        <div>
          {movies?.map(movie => (
            <div key={movie._id}>{movie.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Common API Workflows

### Workflow 1: User Registration & Login

```javascript
import { userAPI } from '@/services/apiServices';

// Register
async function register(email, password, fullName) {
  try {
    const response = await userAPI.register({
      email,
      password,
      fullName,
      phone: '0123456789',
      dob: '1990-01-01',
      gender: 'male'
    });
    
    // Save token
    localStorage.setItem('cinema_user_token', response.data.token);
    localStorage.setItem('cinema_user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Login
async function login(email, password) {
  try {
    const response = await userAPI.login({ email, password });
    
    // Save token
    localStorage.setItem('cinema_user_token', response.data.token);
    localStorage.setItem('cinema_user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Logout
function logout() {
  localStorage.removeItem('cinema_user_token');
  localStorage.removeItem('cinema_user');
}
```

### Workflow 2: Complete Booking Process

```javascript
import { showtimeAPI, bookingAPI } from '@/services/apiServices';

async function completeBooking(selectedSeats, paymentMethod) {
  try {
    // 1. Get showtime details
    const showtime = await showtimeAPI.getById(showtimeId);
    console.log('Showtime:', showtime);

    // 2. Check occupied seats
    const occupiedSeats = await bookingAPI.getOccupiedSeats(showtimeId);
    console.log('Occupied seats:', occupiedSeats);

    // 3. Validate selected seats are not occupied
    const hasConflict = selectedSeats.some(seat =>
      occupiedSeats.includes(seat.seatNumber)
    );
    
    if (hasConflict) {
      throw new Error('Một số ghế đã được đặt');
    }

    // 4. Create booking
    const bookingResponse = await bookingAPI.create({
      showtimeId,
      seats: selectedSeats,
      paymentMethod,
      customerInfo: {
        name: user.fullName,
        email: user.email,
        phone: user.phone
      }
    });

    const bookingId = bookingResponse.data._id;
    console.log('Booking created:', bookingResponse.data);

    // 5. Process payment (mock)
    const paymentResponse = await bookingAPI.simulatePaymentSuccess(bookingId);
    
    if (!paymentResponse.data.success) {
      // If payment fails, can simulate failure
      await bookingAPI.simulatePaymentFailure(bookingId);
      throw new Error('Thanh toán thất bại');
    }

    // 6. Show QR code
    const qrCode = bookingResponse.data.qrCode;
    console.log('QR Code:', qrCode);

    return {
      bookingId,
      qrCode,
      booking: bookingResponse.data
    };

  } catch (error) {
    console.error('Booking process failed:', error);
    throw error;
  }
}
```

### Workflow 3: Admin - Theater Management

```javascript
import { theaterAPI } from '@/services/apiServices';

// Get all theaters
async function getAllTheaters() {
  try {
    const response = await theaterAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching theaters:', error);
  }
}

// Create theater
async function createTheater(theaterData) {
  try {
    const response = await theaterAPI.create({
      name: theaterData.name,
      location: theaterData.location,
      city: theaterData.city,
      address: theaterData.address,
      rooms: theaterData.rooms.map(room => ({
        roomNumber: room.roomNumber,
        seatCapacity: room.seatCapacity,
        seatTypes: {
          standard: room.standardSeats,
          vip: room.vipSeats,
          couple: room.coupleSeats
        }
      }))
    });
    return response.data;
  } catch (error) {
    console.error('Error creating theater:', error);
    throw error;
  }
}

// Update theater
async function updateTheater(theaterId, theaterData) {
  try {
    const response = await theaterAPI.update(theaterId, theaterData);
    return response.data;
  } catch (error) {
    console.error('Error updating theater:', error);
    throw error;
  }
}

// Delete theater
async function deleteTheater(theaterId) {
  try {
    await theaterAPI.delete(theaterId);
    return true;
  } catch (error) {
    console.error('Error deleting theater:', error);
    throw error;
  }
}
```

### Workflow 4: Admin - Showtime Management

```javascript
import { showtimeAPI } from '@/services/apiServices';

// Create showtime
async function createShowtime(showtimeData) {
  try {
    const response = await showtimeAPI.create({
      movieId: showtimeData.movieId,
      theaterId: showtimeData.theaterId,
      roomId: showtimeData.roomId,
      date: showtimeData.date,
      time: showtimeData.time,
      basePrice: showtimeData.basePrice,
      seatTypes: {
        standard: showtimeData.standardPrice,
        vip: showtimeData.vipPrice,
        couple: showtimeData.couplePrice
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating showtime:', error);
    throw error;
  }
}

// Get available time slots
async function getAvailableTimeSlots(movieId, theaterId, date) {
  try {
    const response = await showtimeAPI.getAvailableTimeSlots(
      theaterId,
      null,
      date,
      movieId
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
}

// Copy showtimes
async function copyShowtimes(fromDate, toDate, theaterId) {
  try {
    const response = await showtimeAPI.copyShowtimes(
      fromDate,
      toDate,
      theaterId
    );
    return response.data;
  } catch (error) {
    console.error('Error copying showtimes:', error);
    throw error;
  }
}
```

---

## Error Handling Best Practices

```javascript
// Custom error handler
function handleApiError(error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.message || 'Bad request' };
      case 401:
        // Token expired - redirect to login
        localStorage.removeItem('cinema_user_token');
        window.location.href = '/login';
        return { message: 'Session expired' };
      case 403:
        return { message: 'Access denied' };
      case 404:
        return { message: 'Resource not found' };
      case 500:
        return { message: 'Server error - please try again later' };
      default:
        return { message: data.message || 'Unknown error' };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'No response from server' };
  } else {
    // Error in request setup
    return { message: error.message };
  }
}

// Usage
try {
  const movies = await movieAPI.getAll();
} catch (error) {
  const { message } = handleApiError(error);
  toast.error(message);
}
```

---

## Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] User can view movies
- [ ] User can view theaters
- [ ] User can view showtimes
- [ ] User can create booking
- [ ] User can view their bookings
- [ ] Admin can create theater
- [ ] Admin can create movie
- [ ] Admin can create showtime
- [ ] Payment simulation works
- [ ] QR code displays correctly

