# 🚀 API Integration Testing Guide

## 📋 Checklist Trước Khi Start

### 1️⃣ Setup MongoDB
```bash
# Windows - Start MongoDB Service
net start MongoDB

# Or using MongoDB Compass
# Download from: https://www.mongodb.com/products/compass
```

### 2️⃣ Setup Backend
```bash
cd backend
npm install
npm run dev
# Expected: 🚀 Server running on port 3000
```

### 3️⃣ Setup Frontend
```bash
cd ../
npm install
npm run dev
# Expected: VITE v... ready in ... ms
```

---

## ✅ API Testing Steps

### Step 1: Health Check
```bash
curl -X GET http://localhost:3000/api/health
# Response: { success: true, message: "CineMax API is running!" }
```

### Step 2: Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@",
    "fullName": "Test User",
    "phone": "0123456789",
    "dob": "1990-01-01",
    "gender": "male"
  }'

# Save the token from response
export TOKEN="<token_from_response>"
```

### Step 3: Create Theater
```bash
curl -X POST http://localhost:3000/api/theaters \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CineMax Hà Nội",
    "location": "Tây Hồ, Hà Nội",
    "city": "Hà Nội",
    "address": "123 Lạc Long Quân",
    "rooms": [
      {
        "roomNumber": "A",
        "seatCapacity": 100,
        "seatTypes": {
          "standard": 80,
          "vip": 15,
          "couple": 5
        }
      }
    ]
  }'

# Save theaterId from response
export THEATER_ID="<theater_id>"
```

### Step 4: Create Movie
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Avengers: Endgame",
    "overview": "The final battle against Thanos",
    "poster": "https://image.tmdb.org/t/p/w500/or06FQrMadIMUEr1InjWVVcNJoS.jpg",
    "release_date": "2019-04-26",
    "runtime": 181,
    "duration": 181,
    "genre": "Action, Adventure, Sci-Fi",
    "rating": 8.5,
    "adult": false,
    "popularity": 100
  }'

# Save movieId from response
export MOVIE_ID="<movie_id>"
```

### Step 5: Create Showtime
```bash
curl -X POST http://localhost:3000/api/showtimes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": "'$MOVIE_ID'",
    "theaterId": "'$THEATER_ID'",
    "roomId": "A",
    "date": "2024-03-20",
    "time": "19:00",
    "basePrice": 100,
    "seatTypes": {
      "standard": 100,
      "vip": 150,
      "couple": 200
    }
  }'

# Save showtimeId from response
export SHOWTIME_ID="<showtime_id>"
```

### Step 6: Get Available Seats (Occupied Seats)
```bash
curl -X GET "http://localhost:3000/api/bookings/occupied-seats/$SHOWTIME_ID"

# Should return empty array [] initially
```

### Step 7: Create Booking (Đặt Vé)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "showtimeId": "'$SHOWTIME_ID'",
    "seats": [
      {
        "seatNumber": "A1",
        "type": "standard",
        "price": 100
      },
      {
        "seatNumber": "A2",
        "type": "standard",
        "price": 100
      }
    ],
    "paymentMethod": "card",
    "customerInfo": {
      "name": "Test User",
      "email": "testuser@example.com",
      "phone": "0123456789"
    }
  }'

# Save bookingId from response
export BOOKING_ID="<booking_id>"
```

### Step 8: Get User Bookings
```bash
curl -X GET http://localhost:3000/api/bookings/my-bookings \
  -H "Authorization: Bearer $TOKEN"

# Should return array of bookings
```

### Step 9: Get Booking Details
```bash
curl -X GET "http://localhost:3000/api/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $TOKEN"

# Should return booking with QR code
```

### Step 10: Simulate Payment Success
```bash
curl -X POST "http://localhost:3000/api/bookings/$BOOKING_ID/payment-success" \
  -H "Authorization: Bearer $TOKEN"

# Should update paymentStatus to 'paid'
```

---

## 🔧 Common Issues & Solutions

### Issue 1: CORS Error
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Check backend `.env` has correct `CLIENT_URL`
- Ensure frontend is running on `http://localhost:5173`
- Restart backend server

### Issue 2: 401 Unauthorized
**Error:** `Access denied. No valid token provided.`

**Solution:**
- Ensure token is stored in localStorage after login
- Token should be sent in header: `Authorization: Bearer <token>`
- Check token hasn't expired (7 days)

### Issue 3: 404 Not Found
**Error:** `Cannot POST /api/bookings`

**Solution:**
- Verify backend is running on port 3000
- Check API routes are correctly imported in `server.js`
- Check spelling of endpoints

### Issue 4: Connection Refused
**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3000`

**Solution:**
- Start MongoDB: `net start MongoDB`
- Start backend: `npm run dev`
- Check `.env` file exists in backend folder

---

## 📊 Testing with Postman

1. **Import Collection**
   - Download: `postman-collection.json`
   - Open Postman → Import → Select file

2. **Set Variables**
   - `{{token}}` - Get from login response
   - `{{movieId}}` - Get from create movie response
   - `{{theaterId}}` - Get from create theater response
   - `{{showtimeId}}` - Get from create showtime response
   - `{{bookingId}}` - Get from create booking response

3. **Run Requests**
   - Follow order from top to bottom
   - Each request should return `success: true`

---

## 🎬 Full Booking Flow Example

```javascript
// Frontend example (React)
import { apiClient } from './services/api';

async function completeBooking() {
  try {
    // 1. Login
    const loginRes = await apiClient.post('/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    localStorage.setItem('cinema_user_token', token);

    // 2. Get showtimes
    const showtimesRes = await apiClient.get('/showtimes');
    const showtime = showtimesRes.data[0];

    // 3. Get occupied seats
    const occupiedRes = await apiClient.get(`/bookings/occupied-seats/${showtime._id}`);
    const occupiedSeats = occupiedRes.data;

    // 4. Create booking
    const bookingRes = await apiClient.post('/bookings', {
      showtimeId: showtime._id,
      seats: [
        { seatNumber: 'A1', type: 'standard', price: 100 },
        { seatNumber: 'A2', type: 'standard', price: 100 }
      ],
      paymentMethod: 'card',
      customerInfo: {
        name: 'John Doe',
        email: 'user@example.com',
        phone: '0123456789'
      }
    });
    const booking = bookingRes.data;

    // 5. Process payment
    const paymentRes = await apiClient.post(
      `/bookings/${booking._id}/payment-success`
    );

    // 6. Show QR code from booking.qrCode
    console.log('Booking successful!', booking);

  } catch (error) {
    console.error('Booking failed:', error);
  }
}
```

---

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] API Health check passes
- [ ] User registration works
- [ ] Theater creation works
- [ ] Movie creation works
- [ ] Showtime creation works
- [ ] Booking creation works
- [ ] Occupied seats update correctly
- [ ] QR code is generated
- [ ] Payment simulation works
- [ ] User can view their bookings

---

**Nếu tất cả bước trên đều ✅, backend API đã ready!** 🎉

