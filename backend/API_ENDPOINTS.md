# 🎬 CineMax Cinema API Endpoints

## Base URL
```
http://localhost:3000/api
```

## 🎥 Movies Endpoints

### Get All Movies
```
GET /movies
Query: ?page=1&limit=20&search=avengers&status=active
Response: { success, data[], pagination }
```

### Get Movie by ID
```
GET /movies/:id
Response: { success, data: Movie }
```

### Create Movie (Admin)
```
POST /movies
Headers: Authorization: Bearer <token>
Body: {
  title, overview, poster, release_date, runtime, 
  genre, rating, adult, popularity
}
```

### Update Movie (Admin)
```
PUT /movies/:id
Headers: Authorization: Bearer <token>
Body: { title, overview, ... }
```

### Delete Movie (Admin)
```
DELETE /movies/:id
Headers: Authorization: Bearer <token>
```

---

## 🎭 Theaters Endpoints

### Get All Theaters
```
GET /theaters
Response: { success, data: Theater[] }
```

### Get Theater by ID
```
GET /theaters/:id
Response: { success, data: Theater }
```

### Create Theater (Admin)
```
POST /theaters
Headers: Authorization: Bearer <token>
Body: {
  name, location, city, address, 
  rooms: [{ roomNumber, seatCapacity, seatTypes }]
}
```

### Update Theater (Admin)
```
PUT /theaters/:id
Body: { name, location, address, ... }
```

### Delete Theater (Admin)
```
DELETE /theaters/:id
```

---

## ⏰ Showtimes Endpoints

### Get All Showtimes
```
GET /showtimes
Response: { success, data: Showtime[] }
```

### Get Available Time Slots (for Booking)
```
GET /showtimes/available/:movieId/:theaterId?date=2024-03-15
Response: { success, data: TimeSlot[] }
```

### Get Showtime by ID
```
GET /showtimes/:id
Response: { success, data: Showtime }
```

### Create Showtime (Admin)
```
POST /showtimes
Headers: Authorization: Bearer <token>
Body: {
  movieId, theaterId, roomId, 
  date, time, basePrice, 
  seatTypes: { standard, vip, couple }
}
```

### Update Showtime (Admin)
```
PUT /showtimes/:id
Body: { date, time, basePrice, ... }
```

### Delete Showtime (Admin)
```
DELETE /showtimes/:id
```

---

## 🎫 Bookings Endpoints

### Create Booking
```
POST /bookings
Headers: Authorization: Bearer <token>
Body: {
  showtimeId,
  seats: [{ seatNumber, type, price }, ...],
  paymentMethod: 'card' | 'momo' | 'zalopay' | 'banking',
  customerInfo: {
    name, email, phone
  }
}
Response: {
  success, 
  data: {
    _id, bookingNumber, seats, totalAmount,
    qrCode, bookingStatus, paymentStatus
  }
}
```

### Get User Bookings
```
GET /bookings/my-bookings
Headers: Authorization: Bearer <token>
Response: { success, data: Booking[] }
```

### Get Booking by ID
```
GET /bookings/:id
Headers: Authorization: Bearer <token>
Response: { success, data: Booking }
```

### Cancel Booking
```
PUT /bookings/:id/cancel
Headers: Authorization: Bearer <token>
Response: { success, message }
```

### Get Occupied Seats
```
GET /bookings/occupied-seats/:showtimeId
Response: { success, data: seatNumber[] }
```

### Simulate Payment Success
```
POST /bookings/:id/payment-success
Headers: Authorization: Bearer <token>
```

### Simulate Payment Failure
```
POST /bookings/:id/payment-failure
Headers: Authorization: Bearer <token>
```

---

## 👤 Users Endpoints

### Register
```
POST /auth/register
Body: {
  email, password, fullName, 
  phone, dob, gender
}
Response: { success, token, user }
```

### Login
```
POST /auth/login
Body: { email, password }
Response: { success, token, user }
```

### Get User Profile
```
GET /users/profile
Headers: Authorization: Bearer <token>
Response: { success, data: User }
```

### Update Profile
```
PUT /users/profile
Headers: Authorization: Bearer <token>
Body: { fullName, phone, dob, gender, ... }
```

### Change Password
```
PUT /users/change-password
Headers: Authorization: Bearer <token>
Body: { oldPassword, newPassword }
```

### Get User Bookings
```
GET /users/:id/bookings
Headers: Authorization: Bearer <token>
Response: { success, data: Booking[] }
```

### Add Favorite Movie
```
POST /users/favorites/:movieId
Headers: Authorization: Bearer <token>
```

### Get Favorite Movies
```
GET /users/favorites
Headers: Authorization: Bearer <token>
Response: { success, data: Movie[] }
```

---

## 🔐 Admin Endpoints

### Admin Login
```
POST /auth/admin/login
Body: { email, password }
Response: { success, token, admin }
```

### Get Dashboard Stats
```
GET /admin/stats
Headers: Authorization: Bearer <token>
Response: {
  totalBookings, totalRevenue, totalUsers,
  bookingsByStatus, revenueByDate
}
```

### Get All Bookings (Admin)
```
GET /bookings
Headers: Authorization: Bearer <token>
Response: { success, data: Booking[] }
```

### Get All Users (Admin)
```
GET /users
Headers: Authorization: Bearer <token>
Response: { success, data: User[] }
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

---

## 🔑 Authentication

All protected routes require `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

Token lasts **7 days** from login.

---

## 🚀 Testing with cURL

### Get all movies
```bash
curl -X GET http://localhost:3000/api/movies
```

### Create booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{\n    "showtimeId": "...",\n    "seats": [{"seatNumber": "A1", "type": "standard", "price": 100}],\n    "paymentMethod": "card",\n    "customerInfo": {"name": "John", "email": "john@example.com"}\n  }'\n```

