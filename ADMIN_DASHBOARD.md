# 👨‍💼 Admin Dashboard Features Guide

## 📊 Dashboard Overview

Admin dashboard cung cấp các chức năng quản lý toàn bộ hệ thống rạp chiếu phim.

```
┌─────────────────────────────────────────────────────────┐
│              CineMax Admin Dashboard                    │
├─────────────────────────────────────────────────────────┤
│  📊 Analytics  │ 🎬 Movies  │ 🏛️ Theaters  │ ⏰ Showtimes │
│  📅 Bookings   │ 👥 Users   │ ⚙️ Settings │                │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Dashboard Analytics

### Features:
- **总 Revenue Stats**
- **Booking Overview**
- **User Statistics**
- **Popular Movies**
- **Revenue Charts**

### API Endpoints:

```javascript
// Get dashboard stats
GET /api/admin/stats
Response: {
  totalRevenue: 50000000,
  totalBookings: 500,
  totalUsers: 1000,
  bookingsByDate: [
    { date: '2024-03-20', count: 50, revenue: 5000000 }
  ],
  topMovies: [
    { title: 'Avengers', bookings: 100, revenue: 10000000 }
  ]
}

// Get revenue by date range
GET /api/bookings/stats?startDate=2024-03-01&endDate=2024-03-31
Response: {
  totalBookings: 150,
  totalRevenue: 15000000,
  avgBookingValue: 100000
}
```

### Component Example:

File: `src/components/admin/Analytics.jsx`

```javascript
import React, { useEffect, useState } from 'react';
import { bookingAPI } from '@/services/apiServices';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get booking stats
      const response = await bookingAPI.getStats();
      setStats(response.data.overview);
      
      // Prepare chart data
      if (response.data.overview.revenueByDate) {
        setChartData(response.data.overview.revenueByDate);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="analytics-container">
      <div className="stats-grid">
        <StatCard
          title="Tổng Doanh Thu"
          value={stats.totalRevenue.toLocaleString('vi-VN') + 'đ'}
          icon="💰"
          trend="+12%"
        />
        <StatCard
          title="Tổng Đặt Vé"
          value={stats.totalBookings}
          icon="🎫"
          trend="+5%"
        />
        <StatCard
          title="Tổng Ghế Bán"
          value={stats.totalSeats}
          icon="🪑"
          trend="+8%"
        />
        <StatCard
          title="Trung Bình Giá"
          value={stats.avgBookingValue.toLocaleString('vi-VN') + 'đ'}
          icon="📊"
          trend="+3%"
        />
      </div>

      <div className="chart-container">
        <h2>Doanh Thu Theo Ngày</h2>
        <LineChart width={800} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#d63031" />
        </LineChart>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        <p className={`stat-trend ${trend.startsWith('+') ? 'positive' : 'negative'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
```

---

## 2️⃣ Movie Management

### Features:
- List all movies with pagination
- Create new movie
- Edit movie details
- Delete movie
- Upload poster image
- Search & filter by status

### API Endpoints:

```javascript
// Get all movies (with pagination)
GET /api/movies?page=1&limit=10&status=active
Response: {
  success: true,
  data: [Movie...],
  pagination: { currentPage: 1, totalPages: 5, total: 50 }
}

// Create movie
POST /api/movies
Body: {
  title, overview, genre, release_date, runtime, 
  rating, poster, adult, popularity
}

// Update movie
PUT /api/movies/:id
Body: { title, overview, ... }

// Delete movie
DELETE /api/movies/:id

// Search movies
GET /api/movies?search=avengers
```

### Component Example:

File: `src/components/admin/MovieManagement.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { movieAPI } from '@/services/apiServices';
import MovieForm from './MovieForm';
import MovieList from './MovieList';

export default function MovieManagement() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMovies();
  }, [pagination.page, search]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search
      });
      setMovies(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (movieData) => {
    try {
      await movieAPI.create(movieData);
      setShowForm(false);
      fetchMovies();
      toast.success('Phim đã được tạo!');
    } catch (error) {
      toast.error('Lỗi khi tạo phim');
    }
  };

  const handleUpdate = async (id, movieData) => {
    try {
      await movieAPI.update(id, movieData);
      setEditingMovie(null);
      fetchMovies();
      toast.success('Phim đã được cập nhật!');
    } catch (error) {
      toast.error('Lỗi khi cập nhật phim');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phim này?')) return;
    
    try {
      await movieAPI.delete(id);
      fetchMovies();
      toast.success('Phim đã được xóa!');
    } catch (error) {
      toast.error('Lỗi khi xóa phim');
    }
  };

  return (
    <div className="movie-management">
      <div className="management-header">
        <h1>Quản Lý Phim</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary"
        >
          + Thêm Phim Mới
        </button>
      </div>

      {showForm && (
        <MovieForm 
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm phim..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <MovieList
            movies={movies}
            onEdit={setEditingMovie}
            onDelete={handleDelete}
          />
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalPages}
            onChange={(page) => setPagination({ ...pagination, page })}
          />
        </>
      )}

      {editingMovie && (
        <MovieForm
          initialData={editingMovie}
          onSubmit={(data) => handleUpdate(editingMovie._id, data)}
          onCancel={() => setEditingMovie(null)}
        />
      )}
    </div>
  );
}
```

---

## 3️⃣ Theater Management

### Features:
- Add new theaters
- Manage theater rooms
- Edit theater details
- View theater capacity
- Set room configurations

### API Endpoints:

```javascript
// Get all theaters
GET /api/theaters

// Create theater
POST /api/theaters
Body: {
  name, location, city, address,
  rooms: [
    { roomNumber, seatCapacity, seatTypes: { standard, vip, couple } }
  ]
}

// Update theater
PUT /api/theaters/:id

// Delete theater
DELETE /api/theaters/:id
```

### Component Example:

File: `src/components/admin/TheaterManagement.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { theaterAPI } from '@/services/apiServices';

export default function TheaterManagement() {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [newTheater, setNewTheater] = useState({
    name: '',
    location: '',
    city: '',
    address: '',
    rooms: []
  });

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      const response = await theaterAPI.getAll();
      setTheaters(response.data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
    }
  };

  const handleCreateTheater = async () => {
    try {
      await theaterAPI.create(newTheater);
      fetchTheaters();
      setNewTheater({
        name: '',
        location: '',
        city: '',
        address: '',
        rooms: []
      });
      toast.success('Rạp đã được tạo!');
    } catch (error) {
      toast.error('Lỗi khi tạo rạp');
    }
  };

  const handleAddRoom = () => {
    setNewTheater({
      ...newTheater,
      rooms: [
        ...newTheater.rooms,
        { roomNumber: '', seatCapacity: 0, seatTypes: { standard: 0, vip: 0, couple: 0 } }
      ]
    });
  };

  return (
    <div className="theater-management">
      <h1>Quản Lý Rạp Chiếu</h1>

      <div className="theater-form">
        <h2>Thêm Rạp Mới</h2>
        <input
          type="text"
          placeholder="Tên rạp"
          value={newTheater.name}
          onChange={(e) => setNewTheater({ ...newTheater, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={newTheater.address}
          onChange={(e) => setNewTheater({ ...newTheater, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Thành phố"
          value={newTheater.city}
          onChange={(e) => setNewTheater({ ...newTheater, city: e.target.value })}
        />

        <div className="rooms-section">
          <h3>Phòng Chiếu</h3>
          {newTheater.rooms.map((room, idx) => (
            <div key={idx} className="room-input">
              <input
                placeholder="Số phòng"
                value={room.roomNumber}
                onChange={(e) => {
                  const updated = [...newTheater.rooms];
                  updated[idx].roomNumber = e.target.value;
                  setNewTheater({ ...newTheater, rooms: updated });
                }}
              />
              <input
                type="number"
                placeholder="Tổng ghế"
                value={room.seatCapacity}
                onChange={(e) => {
                  const updated = [...newTheater.rooms];
                  updated[idx].seatCapacity = parseInt(e.target.value);
                  setNewTheater({ ...newTheater, rooms: updated });
                }}
              />
            </div>
          ))}
          <button onClick={handleAddRoom}>+ Thêm Phòng</button>
        </div>

        <button onClick={handleCreateTheater} className="btn-primary">
          Tạo Rạp
        </button>
      </div>

      <div className="theater-list">
        <h2>Danh Sách Rạp</h2>
        <table>
          <thead>
            <tr>
              <th>Tên Rạp</th>
              <th>Địa Chỉ</th>
              <th>Số Phòng</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {theaters.map(theater => (
              <tr key={theater._id}>
                <td>{theater.name}</td>
                <td>{theater.address}</td>
                <td>{theater.rooms?.length || 0}</td>
                <td>
                  <button onClick={() => setSelectedTheater(theater)}>Sửa</button>
                  <button onClick={() => handleDeleteTheater(theater._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 4️⃣ Showtime Management

### Features:
- Create showtimes for movies
- Assign to specific theaters and rooms
- Set date, time, and pricing
- Copy showtimes across dates
- Manage availability

### API Endpoints:

```javascript
// Create showtime
POST /api/showtimes
Body: {
  movieId, theaterId, roomId,
  date, time, basePrice,
  seatTypes: { standard, vip, couple }
}

// Get available time slots
GET /api/showtimes/available-slots?theaterId=:id&date=:date&movieId=:id

// Copy showtimes
POST /api/showtimes/copy
Body: { fromDate, toDate, theaterId, roomId }
```

### Component Example:

File: `src/components/admin/ShowtimeManagement.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { showtimeAPI, movieAPI, theaterAPI } from '@/services/apiServices';

export default function ShowtimeManagement() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [formData, setFormData] = useState({
    movieId: '',
    theaterId: '',
    roomId: '',
    date: '',
    time: '',
    basePrice: 100000,
    seatTypes: { standard: 100000, vip: 150000, couple: 200000 }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [showtimesRes, moviesRes, theatersRes] = await Promise.all([
        showtimeAPI.getAll(),
        movieAPI.getAll(),
        theaterAPI.getAll()
      ]);
      setShowtimes(showtimesRes.data);
      setMovies(moviesRes.data);
      setTheaters(theatersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateShowtime = async () => {
    try {
      await showtimeAPI.create(formData);
      fetchData();
      toast.success('Suất chiếu đã được tạo!');
      setFormData({
        movieId: '',
        theaterId: '',
        roomId: '',
        date: '',
        time: '',
        basePrice: 100000,
        seatTypes: { standard: 100000, vip: 150000, couple: 200000 }
      });
    } catch (error) {
      toast.error('Lỗi khi tạo suất chiếu');
    }
  };

  const handleCopyShowtimes = async () => {
    const fromDate = prompt('Từ ngày (YYYY-MM-DD):');
    const toDate = prompt('Đến ngày (YYYY-MM-DD):');
    
    if (!fromDate || !toDate) return;

    try {
      await showtimeAPI.copyShowtimes(fromDate, toDate, formData.theaterId);
      fetchData();
      toast.success('Suất chiếu đã được sao chép!');
    } catch (error) {
      toast.error('Lỗi khi sao chép suất chiếu');
    }
  };

  return (
    <div className="showtime-management">
      <h1>Quản Lý Suất Chiếu</h1>

      <div className="showtime-form">
        <h2>Tạo Suất Chiếu Mới</h2>
        
        <select
          value={formData.movieId}
          onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
        >
          <option value="">-- Chọn Phim --</option>
          {movies.map(movie => (
            <option key={movie._id} value={movie._id}>{movie.title}</option>
          ))}
        </select>

        <select
          value={formData.theaterId}
          onChange={(e) => setFormData({ ...formData, theaterId: e.target.value })}
        >
          <option value="">-- Chọn Rạp --</option>
          {theaters.map(theater => (
            <option key={theater._id} value={theater._id}>{theater.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />

        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        />

        <input
          type="number"
          placeholder="Giá cơ bản"
          value={formData.basePrice}
          onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
        />

        <button onClick={handleCreateShowtime} className="btn-primary">
          Tạo Suất Chiếu
        </button>

        <button onClick={handleCopyShowtimes} className="btn-secondary">
          📋 Sao Chép Suất Chiếu
        </button>
      </div>

      <div className="showtime-list">
        <h2>Danh Sách Suất Chiếu</h2>
        <table>
          <thead>
            <tr>
              <th>Phim</th>
              <th>Rạp</th>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Giá</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map(showtime => (
              <tr key={showtime._id}>
                <td>{showtime.movieId?.title}</td>
                <td>{showtime.theaterId?.name}</td>
                <td>{showtime.date}</td>
                <td>{showtime.time}</td>
                <td>{showtime.basePrice.toLocaleString('vi-VN')}đ</td>
                <td>
                  <button>Sửa</button>
                  <button>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 5️⃣ Booking Management

### Features:
- View all bookings
- Filter by status (pending, confirmed, cancelled)
- Search bookings
- View booking details
- Cancel booking if needed

### API Endpoints:

```javascript
// Get all bookings (admin)
GET /api/bookings?page=1&limit=20&status=confirmed

// Get booking details
GET /api/bookings/:id

// Get booking stats
GET /api/bookings/stats?startDate=:date&endDate=:date
```

### Component Example:

File: `src/components/admin/BookingManagement.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { bookingAPI } from '@/services/apiServices';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    fetchBookings();
  }, [filter, search, pagination.page]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: filter !== 'all' ? filter : undefined,
        search: search
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  return (
    <div className="booking-management">
      <h1>Quản Lý Đặt Vé</h1>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất Cả</option>
          <option value="pending">Chờ Xử Lý</option>
          <option value="confirmed">Đã Xác Nhận</option>
          <option value="cancelled">Đã Hủy</option>
        </select>

        <input
          type="text"
          placeholder="Tìm kiếm mã vé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="bookings-table">
        <thead>
          <tr>
            <th>Mã Vé</th>
            <th>Khách Hàng</th>
            <th>Phim</th>
            <th>Ngày</th>
            <th>Ghế</th>
            <th>Tổng Tiền</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td>{booking.bookingCode}</td>
              <td>{booking.customerInfo.name}</td>
              <td>{booking.movieId?.title}</td>
              <td>{booking.showDate}</td>
              <td>{booking.seats.map(s => s.seatNumber).join(', ')}</td>
              <td>{booking.totalAmount.toLocaleString('vi-VN')}đ</td>
              <td>
                <span className={`status-badge ${booking.bookingStatus}`}>
                  {booking.bookingStatus}
                </span>
              </td>
              <td>
                <button>Chi Tiết</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## ✅ Admin Checklist

- [ ] Dashboard analytics working
- [ ] Can create/edit/delete movies
- [ ] Can create/edit/delete theaters
- [ ] Can create showtimes
- [ ] Can copy showtimes
- [ ] Can view all bookings
- [ ] Can filter and search bookings
- [ ] Revenue tracking works
- [ ] User statistics updated
- [ ] All APIs returning correct data

---

## 🔒 Admin Authentication

```javascript
// Admin Login
POST /api/auth/admin/login
Body: { email, password }
Response: { token, admin }

// Check Admin Role
middleware.auth check:
- User role === 'admin'
- Admin token in localStorage

// Routes Protection
admin routes requires:
- Valid token
- Admin role
```

---

## 📝 Notes

- Admin features are behind **ProtectedRoute** with role check
- All admin actions should be **logged** for audit
- Implement **pagination** for large datasets
- Use **caching** for frequently accessed data
- Add **confirmation dialogs** before deleting

