# ⚡ CineMax Cinema - Quick Start Guide

Bắt đầu nhanh chóng với dự án Cinema trong 5 phút!

---

## 📋 Các Bước Chuẩn Bị

### 1️⃣ Cài Đặt MongoDB

**Windows:**
```bash
# Tải từ: https://www.mongodb.com/try/download/community
# Cài đặt & start service
net start MongoDB
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 2️⃣ Clone Project
```bash
git clone <repository-url>
cd Cinema
```

### 3️⃣ Backend Setup
```bash
cd backend
npm install
npm run dev
# ✅ Xem: 🚀 Server running on port 3000
```

### 4️⃣ Frontend Setup (Terminal mới)
```bash
cd ..
npm install
npm run dev
# ✅ Xem: VITE v... ready in ... ms
```

### 5️⃣ Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

---

## ✅ Kiểm Tra Health Check

```bash
curl http://localhost:3000/api/health
# Response: { "success": true, "message": "CineMax API is running!" }
```

---

## 🎬 Test User Workflows

### A. User Registration & Login

```bash
# 1. Register
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

# Copy token from response
export TOKEN="<token_from_response>"
```

### B. Create Theater (Admin)

```bash
curl -X POST http://localhost:3000/api/theaters \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CineMax Hà Nội",
    "location": "Tây Hồ, Hà Nội",
    "city": "Hà Nội",
    "address": "123 Đường Lạc Long Quân",
    "rooms": [{
      "roomNumber": "A",
      "seatCapacity": 100,
      "seatTypes": {
        "standard": 80,
        "vip": 15,
        "couple": 5
      }
    }]
  }'

# Copy theaterId from response
export THEATER_ID="<theater_id>"
```

### C. Create Movie (Admin)

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

# Copy movieId from response
export MOVIE_ID="<movie_id>"
```

### D. Create Showtime (Admin)

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
    "basePrice": 100000,
    "seatTypes": {
      "standard": 100000,
      "vip": 150000,
      "couple": 200000
    }
  }'

# Copy showtimeId from response
export SHOWTIME_ID="<showtime_id>"
```

### E. Create Booking (User)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "showtimeId": "'$SHOWTIME_ID'",
    "seats": [
      { "seatNumber": "A1", "type": "standard", "price": 100000 },
      { "seatNumber": "A2", "type": "standard", "price": 100000 }
    ],
    "paymentMethod": "card",
    "customerInfo": {
      "name": "Test User",
      "email": "testuser@example.com",
      "phone": "0123456789"
    }
  }'

# Copy bookingId from response
export BOOKING_ID="<booking_id>"
```

### F. Process Payment & Get QR Code

```bash
curl -X POST "http://localhost:3000/api/bookings/$BOOKING_ID/payment-success" \
  -H "Authorization: Bearer $TOKEN"

# Response includes: qrCode (base64 image) & bookingNumber
```

---

## 🧪 Using Postman (Recommended)

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select `backend/postman-collection.json`

2. **Set Variables:**
   - Open environment settings
   - Set `token` = your JWT token
   - Set `movieId`, `theaterId`, `showtimeId` from responses

3. **Run Requests:**
   - Follow order from top to bottom
   - Each request shows expected response

---

## 🔑 Key Endpoints for Testing

```
Health Check:
GET http://localhost:3000/api/health

Movies:
GET http://localhost:3000/api/movies

Theaters:
GET http://localhost:3000/api/theaters

Showtimes:
GET http://localhost:3000/api/showtimes

Bookings (requires auth):
POST http://localhost:3000/api/bookings
GET http://localhost:3000/api/bookings/my-bookings
```

---

## 📚 Next Steps

1. **Read Documentation:**
   - Start with `PROJECT_COMPLETION_SUMMARY.md`
   - Follow `API_TESTING_GUIDE.md` for detailed steps
   - Check `FRONTEND_INTEGRATION.md` for frontend code

2. **Explore Features:**
   - Register as user → Try booking workflow
   - Login as admin → Manage movies & showtimes
   - Test payment simulation
   - Download QR code tickets

3. **Customize:**
   - Update business logic in controllers
   - Modify UI components in React
   - Add real payment gateway integration

---

## 🚨 Troubleshooting

### MongoDB not running
```bash
# Check status
mongosh

# Start service (Windows)
net start MongoDB
```

### Port already in use
```bash
# Find process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in backend/.env
```

### CORS Error
```bash
# Check backend/.env CLIENT_URL is correct
VITE_API_BASE_URL=http://localhost:3000/api

# Restart backend server
```

### Token Expired
```bash
# Login again to get new token
# Token expires in 7 days
```

---

## ✅ Testing Checklist

- [ ] MongoDB running
- [ ] Backend on port 3000
- [ ] Frontend on port 5173
- [ ] Health check passes
- [ ] Can register user
- [ ] Can login
- [ ] Can create theater
- [ ] Can create movie
- [ ] Can create showtime
- [ ] Can create booking
- [ ] Can process payment
- [ ] QR code generated
- [ ] Can view bookings

---

## 🎯 Common Tasks

### Create Multiple Movies
```bash
# Edit postman collection or create loop in script
for i in {1..5}; do
  curl -X POST ... -d '{"title": "Movie '$i'", ...}'
done
```

### Reset Database
```bash
# In MongoDB
use cinema
db.dropDatabase()

# Or delete in MongoDB Compass
```

### View Database
```bash
# Using MongoDB Compass
# - Connect to: mongodb://localhost:27017
# - Select "cinema" database
# - Browse collections
```

### Change Booking Price
```bash
# Edit SEAT_PRICES in src/utils/seatUtils.js
const SEAT_PRICES = {
  standard: 150000,  // Change from 100000
  vip: 200000,       // Change from 150000
  couple: 250000     // Change from 200000
};
```

---

## 📖 Documentation Files

Essential files to read in order:

1. **PROJECT_COMPLETION_SUMMARY.md** - Overview & checklist
2. **API_ENDPOINTS.md** - All API routes & examples
3. **API_TESTING_GUIDE.md** - Step-by-step testing
4. **FRONTEND_INTEGRATION.md** - Frontend code examples
5. **BOOKING_LOGIC.md** - Booking workflow details
6. **PAYMENT_QR_CODE.md** - Payment implementation
7. **ADMIN_DASHBOARD.md** - Admin features

---

## 🎉 You're Ready!

Your Cinema Booking System is now ready for:
- ✅ Development
- ✅ Testing
- ✅ Customization
- ✅ Deployment

Happy coding! 🚀

