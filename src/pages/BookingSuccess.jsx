import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Ticket, ArrowRight, Download } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import TicketQRCode from '../components/TicketQRCode';
import { useBookings } from '../contexts/BookingContext';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;
  const { fetchUserBookings } = useBookings();

  // Debug: Log booking data để kiểm tra structure
  console.log('🔍 BookingSuccess - Full booking data:', booking);
  console.log('🔍 Movie data:', booking?.movieId);
  console.log('🔍 Theater data:', booking?.theaterId);
  
  // More detailed debugging
  console.log('🔍 Detailed debug:', {
    hasBooking: !!booking,
    movieId: booking?.movieId,
    movieTitle: booking?.movieId?.title,
    theaterId: booking?.theaterId,
    theaterName: booking?.theaterId?.name,
    allKeys: booking ? Object.keys(booking) : []
  });

  // Refresh bookings when component mounts để ensure latest data
  useEffect(() => {
    fetchUserBookings();
  }, []);

  // Enrich booking data với room info nếu thiếu
  const enrichedBooking = React.useMemo(() => {
    if (!booking) return null;
    
    const enriched = { ...booking };
    
    // Nếu showtime không có room info, thử tìm từ theater rooms
    if (enriched.showtimeId && !enriched.showtimeId.room && 
        enriched.theaterId?.rooms && enriched.showtimeId.roomId) {
      
      const room = enriched.theaterId.rooms.find(r => 
        r._id === enriched.showtimeId.roomId || 
        r._id?.toString() === enriched.showtimeId.roomId?.toString()
      );
      
      if (room) {
        enriched.showtimeId = {
          ...enriched.showtimeId,
          room: room.name
        };
        console.log('✅ Enriched booking with room:', room.name);
      }
    }
    
    return enriched;
  }, [booking]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black pt-24 px-4">
      {/* Background Effects */}
      <BlurCircle 
        top="10%" 
        left="80%" 
        size="300px" 
        color="rgba(34, 197, 94, 0.1)" 
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Đặt vé thành công!</h1>
          <p className="text-gray-400">Vé của bạn đã được xác nhận và thanh toán thành công</p>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="glass-card rounded-xl p-6 border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Thông tin vé</h3>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                Đã thanh toán
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Mã vé</p>
                    <p className="text-white font-mono text-lg">{booking.bookingCode || `#${booking._id?.slice(-8)}`}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Suất chiếu</p>
                    <p className="text-white">{booking.showDate} - {booking.showTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm">Rạp chiếu</p>
                    <p className="text-white">{
                      booking.theaterId?.name || 
                      booking.theater?.name || 
                      booking.theaterName || 
                      'Đang tải...'
                    }</p>
                    <p className="text-gray-400 text-sm">{
                      booking.theaterId?.location?.address || 
                      booking.theaterId?.location || 
                      booking.theater?.location || 
                      booking.theaterLocation || 
                      ''
                    }</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Phim</p>
                  <p className="text-white text-lg font-semibold">{
                    booking.movieId?.title || 
                    booking.movie?.title || 
                    booking.movieTitle || 
                    'Đang tải...'
                  }</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Ghế</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.seats?.map((seat, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium"
                      >
                        {seat.seatNumber || seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Tổng tiền</p>
                  <p className="text-green-400 text-2xl font-bold">
                    {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Đặt vé lúc: {formatDate(booking.bookingDate || booking.createdAt)}</span>
                <span className="text-gray-400">Thanh toán: {booking.paymentMethod || 'Card'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200">
              <Download className="w-5 h-5 mr-2" />
              Tải vé PDF
            </button>

            <button
              onClick={() => navigate('/history')}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
            >
              Xem lịch sử đặt vé
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          <button
            onClick={() => navigate('/movies')}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Đặt vé phim khác
          </button>
        </div>

        {/* QR Code Section */}
        <div className="mt-8">
          <TicketQRCode booking={enrichedBooking} />
        </div>

        {/* Instructions */}
        <div className="mt-8 glass-card rounded-xl p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Lưu ý quan trọng</h4>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
              Vui lòng đến rạp trước giờ chiếu 15-30 phút để làm thủ tục
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
              Xuất trình mã vé hoặc tin nhắn xác nhận tại quầy
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
              Không được hoàn tiền sau khi đã xác nhận
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;