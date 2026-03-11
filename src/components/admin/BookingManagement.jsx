import React, { useState, useMemo } from 'react';
import { Search, Eye, DollarSign, Calendar, Users, Filter, Download, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { useAdminBookings } from '../../contexts/AdminBookingContext';
import { useMovies } from '../../contexts/MovieContext';
import { useTheaters } from '../../contexts/TheaterContext';
import { useShowtimes } from '../../contexts/ShowtimeContext';

const BookingManagement = () => {
  const { bookings, loading, error, updateBookingStatus, getRevenueStats, searchBookings } = useAdminBookings();
  const { movies } = useMovies();
  const { theaters } = useTheaters();
  const { showtimes } = useShowtimes();
  
  // Debug: Log bookings data to check structure
  console.log('📚 Bookings data structure:', bookings);
  if (bookings.length > 0) {
    console.log('📚 First booking fields:', Object.keys(bookings[0]));
    console.log('📚 First booking data:', bookings[0]);
    console.log('📚 First booking customer info:', {
      customerInfo: bookings[0].customerInfo,
      userId: bookings[0].userId,
      user: bookings[0].user,
      customer: bookings[0].customer
    });
  }
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const statusOptions = [
    { value: 'all', label: 'Tất cả', color: 'text-gray-400' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'text-green-400' },
    { value: 'pending', label: 'Chờ xử lý', color: 'text-yellow-400' },
    { value: 'cancelled', label: 'Đã hủy', color: 'text-red-400' },
    { value: 'completed', label: 'Hoàn thành', color: 'text-blue-400' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Chờ thanh toán', color: 'text-yellow-400', icon: Clock },
    { value: 'paid', label: 'Đã thanh toán', color: 'text-green-400', icon: CheckCircle },
    { value: 'failed', label: 'Thanh toán thất bại', color: 'text-red-400', icon: XCircle },
    { value: 'refunded', label: 'Đã hoàn tiền', color: 'text-blue-400', icon: CreditCard }
  ];

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = searchBookings(searchTerm);
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.bookingStatus === statusFilter);
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookingDate || booking.createdAt);
        
        switch(dateFilter) {
          case 'today':
            return bookingDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return bookingDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return bookingDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [bookings, searchTerm, statusFilter, dateFilter, searchBookings]);

  // Get movie, theater, and showtime info from booking (already populated by API)
  const getBookingDetails = (booking) => {
    // API should populate these fields, so we can use them directly
    const movie = booking.movieId || null;
    const theater = booking.theaterId || null;
    const showtime = booking.showtimeId || null;
    
    return { movie, theater, showtime };
  };

  // Revenue statistics
  const revenueStats = useMemo(() => {
    return getRevenueStats();
  }, [getRevenueStats]);

  const handleStatusUpdate = (bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải dữ liệu đặt vé...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Lỗi: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý đặt vé</h1>
          <p className="text-gray-400">Quản lý các đơn đặt vé và thanh toán</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Tổng doanh thu</h3>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(revenueStats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Doanh thu hôm nay</h3>
              <p className="text-xl font-bold text-blue-400">
                {formatCurrency(revenueStats.todayRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Tổng đơn đặt</h3>
              <p className="text-xl font-bold text-purple-400">{revenueStats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-cyan-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-400">Đã xác nhận</h3>
              <p className="text-xl font-bold text-cyan-400">{revenueStats.confirmedBookings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, mã đặt vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-300 font-medium">Mã đặt vé</th>
                <th className="text-left p-4 text-gray-300 font-medium">Khách hàng</th>
                <th className="text-left p-4 text-gray-300 font-medium">Phim</th>
                <th className="text-left p-4 text-gray-300 font-medium">Rạp & Ghế</th>
                <th className="text-left p-4 text-gray-300 font-medium">Thời gian</th>
                <th className="text-left p-4 text-gray-300 font-medium">Tổng tiền</th>
                <th className="text-left p-4 text-gray-300 font-medium">Trạng thái</th>
                <th className="text-left p-4 text-gray-300 font-medium">Thanh toán</th>
                <th className="text-left p-4 text-gray-300 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">
                    Không có dữ liệu đặt vé nào
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const { movie, theater, showtime } = getBookingDetails(booking);
                  
                  return (
                    <tr key={booking._id || booking.id} className="border-b border-gray-800 hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="text-cyan-400 font-mono text-sm">
                          {booking.bookingCode || `#${(booking._id || booking.id).toString().slice(-8)}`}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <div className="text-white font-medium">
                            {(() => {
                              // Debug: Check what customer fields are available
                              console.log('📚 Customer fields for booking', booking.bookingCode, ':', {
                                customerInfo: booking.customerInfo,
                                customerInfoKeys: booking.customerInfo ? Object.keys(booking.customerInfo) : 'null',
                                userId: booking.userId,
                                userIdKeys: booking.userId ? Object.keys(booking.userId) : 'null'
                              });
                              
                              // Try different possible customer name fields
                              // Skip customerInfo.name if it's 'N/A'
                              const customerName = booking.customerInfo?.name;
                              
                              if (customerName && customerName !== 'N/A') {
                                return customerName;
                              }
                              
                              // Try userId fields or construct name from email
                              return booking.userId?.name || 
                                     booking.userId?.fullName ||
                                     booking.user?.name ||
                                     booking.customer?.name ||
                                     booking.customerName ||
                                     (booking.userId?.email ? booking.userId.email.split('@')[0] : null) ||
                                     (booking.customerInfo?.email && booking.customerInfo.email !== 'N/A' ? 
                                       booking.customerInfo.email.split('@')[0] : null) ||
                                     'Khách hàng';
                            })()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {booking.customerInfo?.email || 
                             booking.userId?.email || 
                             booking.user?.email ||
                             booking.customer?.email ||
                             booking.customerEmail ||
                             'N/A'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {booking.customerInfo?.phone || 
                             booking.userId?.phone || 
                             booking.user?.phone ||
                             booking.customer?.phone ||
                             booking.customerPhone ||
                             'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-white">{movie?.title || 'N/A'}</div>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <div className="text-white">{theater?.name || 'N/A'}</div>
                          <div className="text-gray-400 text-sm">
                            Phòng: {(() => {
                              const roomId = booking.showtimeId?.roomId || booking.roomId;
                              const rooms = theater?.rooms;
                              
                              if (roomId && rooms && rooms.length > 0) {
                                const room = rooms.find(r => r._id === roomId || r.id === roomId);
                                return room?.name || `Phòng ${roomId}`;
                              }
                              
                              return booking.roomName || booking.room?.name || 'Không xác định';
                            })()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Ghế: {(() => {
                              if (!booking.seats || booking.seats.length === 0) {
                                return 'N/A';
                              }
                              
                              return booking.seats.map(seat => {
                                if (typeof seat === 'string') {
                                  return seat;
                                } else if (seat && typeof seat === 'object') {
                                  return seat.seatNumber || seat.number || seat.name || seat.id || 'Ghế không xác định';
                                }
                                return seat;
                              }).join(', ');
                            })()}
                          </div>
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {booking.showDate && booking.showTime ? 
                            `${booking.showDate} ${booking.showTime}` : 'N/A'
                          }
                        </div>
                        <div className="text-gray-400 text-xs">
                          Đặt: {booking.bookingDate ? formatDate(booking.bookingDate) : formatDate(booking.createdAt)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-green-400 font-semibold">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(booking.bookingStatus)}
                          <select
                            value={booking.bookingStatus}
                            onChange={(e) => handleStatusUpdate(booking._id || booking.id, e.target.value)}
                            className="bg-slate-800/50 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const PaymentIcon = paymentStatusOptions.find(p => p.value === booking.paymentStatus)?.icon || Clock;
                            const color = paymentStatusOptions.find(p => p.value === booking.paymentStatus)?.color || 'text-gray-400';
                            return <PaymentIcon className={`w-4 h-4 ${color}`} />;
                          })()}
                          <span className={`text-xs ${paymentStatusOptions.find(p => p.value === booking.paymentStatus)?.color || 'text-gray-400'}`}>
                            {paymentStatusOptions.find(p => p.value === booking.paymentStatus)?.label || booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                    
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Không tìm thấy đặt vé nào</div>
              <div className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Chi tiết đặt vé</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {(() => {
                const { movie, theater, showtime } = getBookingDetails(selectedBooking);
                
                // Debug: Log selected booking structure
                console.log('📚 Selected booking detailed structure:', {
                  selectedBooking,
                  movie,
                  theater,
                  showtime,
                  seats: selectedBooking.seats,
                  showtimeId: selectedBooking.showtimeId
                });
                
                return (
                  <div className="space-y-6">
                    {/* Booking Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Thông tin đặt vé</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-400">Mã đặt vé:</span> <span className="text-cyan-400 font-mono">#{selectedBooking.id}</span></div>
                          <div><span className="text-gray-400">Ngày đặt:</span> <span className="text-white">{formatDate(selectedBooking.createdAt)}</span></div>
                          <div><span className="text-gray-400">Trạng thái:</span> <span className="text-white">{statusOptions.find(s => s.value === selectedBooking.status)?.label}</span></div>
                          <div><span className="text-gray-400">Thanh toán:</span> <span className="text-white">{paymentStatusOptions.find(p => p.value === selectedBooking.paymentStatus)?.label}</span></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Thông tin khách hàng</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-400">Tên:</span> <span className="text-white">{
                            (() => {
                              const customerName = selectedBooking.customerInfo?.name;
                              
                              if (customerName && customerName !== 'N/A') {
                                return customerName;
                              }
                              
                              return selectedBooking.userId?.name || 
                                     selectedBooking.userId?.fullName ||
                                     selectedBooking.user?.name ||
                                     selectedBooking.customer?.name ||
                                     selectedBooking.customerName ||
                                     (selectedBooking.userId?.email ? selectedBooking.userId.email.split('@')[0] : null) ||
                                     (selectedBooking.customerInfo?.email && selectedBooking.customerInfo.email !== 'N/A' ? 
                                       selectedBooking.customerInfo.email.split('@')[0] : null) ||
                                     'Khách hàng';
                            })()
                          }</span></div>
                          <div><span className="text-gray-400">Email:</span> <span className="text-white">{
                            selectedBooking.customerInfo?.email || 
                            selectedBooking.userId?.email || 
                            selectedBooking.user?.email ||
                            selectedBooking.customer?.email ||
                            selectedBooking.customerEmail ||
                            'N/A'
                          }</span></div>
                          <div><span className="text-gray-400">SĐT:</span> <span className="text-white">{
                            selectedBooking.customerInfo?.phone || 
                            selectedBooking.userId?.phone || 
                            selectedBooking.user?.phone ||
                            selectedBooking.customer?.phone ||
                            selectedBooking.customerPhone ||
                            'N/A'
                          }</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Movie & Showtime Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Thông tin suất chiếu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div><span className="text-gray-400">Phim:</span> <span className="text-white">{movie?.title || 'N/A'}</span></div>
                          <div><span className="text-gray-400">Thời gian chiếu:</span> <span className="text-white">{
                            (() => {
                              // Try different date fields
                              if (showtime?.datetime) {
                                try {
                                  return formatDate(showtime.datetime);
                                } catch (error) {
                                  console.log('Date format error:', error);
                                }
                              }
                              
                              // Fallback to booking date/time fields
                              if (selectedBooking.showDate && selectedBooking.showTime) {
                                return `${selectedBooking.showDate} ${selectedBooking.showTime}`;
                              }
                              
                              // Try showtime date/time
                              if (showtime?.date && showtime?.time) {
                                return `${showtime.date} ${showtime.time}`;
                              }
                              
                              return 'N/A';
                            })()
                          }</span></div>
                        </div>
                        <div className="space-y-2">
                          <div><span className="text-gray-400">Rạp:</span> <span className="text-white">{theater?.name || 'N/A'}</span></div>
                          <div><span className="text-gray-400">Phòng:</span> <span className="text-white">{
                            (() => {
                              // Debug room info
                              console.log('🏠 Room debug info:', {
                                showtimeId: selectedBooking.showtimeId,
                                roomId: selectedBooking.roomId,
                                theater,
                                rooms: theater?.rooms,
                                showtime
                              });
                              
                              // Try to get room info from various sources
                              const roomId = selectedBooking.showtimeId?.roomId || 
                                           selectedBooking.roomId || 
                                           showtime?.roomId;
                              const rooms = theater?.rooms;
                              
                              if (roomId && rooms && rooms.length > 0) {
                                const room = rooms.find(r => r._id === roomId || r.id === roomId || r._id?.toString() === roomId?.toString());
                                if (room) {
                                  return room.name || `Phòng ${roomId}`;
                                }
                              }
                              
                              // Try room name from showtime
                              if (showtime?.room?.name) {
                                return showtime.room.name;
                              }
                              
                              // Fallback: try to extract from booking fields
                              return selectedBooking.roomName || 
                                     selectedBooking.room?.name ||
                                     (roomId ? `Phòng ${roomId}` : 'Không xác định');
                            })()
                          }</span></div>
                          <div><span className="text-gray-400">Ghế đã chọn:</span> <span className="text-white">{
                            (() => {
                              if (!selectedBooking.seats || selectedBooking.seats.length === 0) {
                                return 'N/A';
                              }
                              
                              // Handle different seat formats
                              return selectedBooking.seats.map(seat => {
                                if (typeof seat === 'string') {
                                  return seat;
                                } else if (seat && typeof seat === 'object') {
                                  return seat.seatNumber || seat.number || seat.name || seat.id || 'Ghế không xác định';
                                }
                                return seat;
                              }).join(', ');
                            })()
                          }</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pricing Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Chi tiết giá</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Số ghế:</span>
                          <span className="text-white">{selectedBooking.seats?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Giá mỗi ghế:</span>
                          <span className="text-white">{formatCurrency(selectedBooking.totalAmount / Math.max(selectedBooking.seats?.length || 1, 1))}</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 mt-2">
                          <div className="flex justify-between text-lg font-semibold">
                            <span className="text-white">Tổng cộng:</span>
                            <span className="text-green-400">{formatCurrency(selectedBooking.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;