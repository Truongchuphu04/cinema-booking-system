import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { bookingAPI } from '../services/apiServices';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useBookings } from '../contexts/BookingContext';

const PaymentMockup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { fetchUserBookings } = useBookings();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError('Không tìm thấy mã đặt vé');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getById(bookingId);
      
      if (response.success) {
        setBooking(response.data);
      } else {
        throw new Error(response.message || 'Không tìm thấy thông tin đặt vé');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    try {
      setProcessing(true);
      console.log('🎯 Simulating payment success for booking:', bookingId);
      
      const response = await bookingAPI.simulatePaymentSuccess(bookingId);
      
      if (response.success) {
        toast.success('Thanh toán thành công!');
        
        // Debug: Check API response data
        console.log('💳 Payment API response:', response);
        console.log('💳 Booking data from API:', response.data.booking);
        console.log('💳 Movie data in response:', response.data.booking?.movieId);
        console.log('💳 Theater data in response:', response.data.booking?.theaterId);
        
        // Refresh bookings in context để update status
        await fetchUserBookings();
        
        // Redirect to success page after delay
        setTimeout(() => {
          navigate('/booking-success', { 
            state: { booking: response.data.booking }
          });
        }, 1500);
      } else {
        throw new Error(response.message || 'Thanh toán thất bại');
      }
    } catch (error) {
      console.error('Payment success simulation failed:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thanh toán');
      setProcessing(false);
    }
  };

  const simulatePaymentFailure = async () => {
    try {
      setProcessing(true);
      console.log('💥 Simulating payment failure for booking:', bookingId);
      
      const response = await bookingAPI.simulatePaymentFailure(bookingId);
      
      // Always show failure message regardless of API response
      toast.error('Thanh toán thất bại!');
      
      // Redirect to failure page after delay
      setTimeout(() => {
        navigate('/booking-failed', { 
          state: { booking: response.data?.booking, error: 'Thanh toán không thành công' }
        });
      }, 1500);
    } catch (error) {
      console.error('Payment failure simulation failed:', error);
      toast.error('Thanh toán thất bại!');
      
      // Still redirect to failure page
      setTimeout(() => {
        navigate('/booking-failed', { 
          state: { error: 'Thanh toán không thành công' }
        });
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Lỗi</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Về trang đặt vé
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black pt-24 px-4">
      {/* Background Effects */}
      <BlurCircle 
        top="10%" 
        left="80%" 
        size="300px" 
        color="rgba(79, 205, 196, 0.1)" 
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mô phỏng thanh toán</h1>
          <p className="text-gray-400">Chọn kết quả thanh toán để test hệ thống</p>
        </div>

        {/* Booking Info */}
        {booking && (
          <div className="glass-card rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Thông tin đặt vé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Mã đặt vé:</p>
                <p className="text-white font-mono">{booking.bookingCode || `#${booking._id?.slice(-8)}`}</p>
              </div>
              <div>
                <p className="text-gray-400">Phim:</p>
                <p className="text-white">{booking.movieId?.title || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Rạp:</p>
                <p className="text-white">{booking.theaterId?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400">Suất chiếu:</p>
                <p className="text-white">{booking.showDate} {booking.showTime}</p>
              </div>
              <div>
                <p className="text-gray-400">Ghế:</p>
                <p className="text-cyan-400">{booking.seats?.map(seat => seat.seatNumber || seat).join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-400">Tổng tiền:</p>
                <p className="text-green-400 font-semibold text-lg">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(booking.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Simulation Buttons */}
        <div className="glass-card rounded-xl p-8 border border-gray-700 text-center">
          <div className="mb-6">
            <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Mô phỏng thanh toán</h3>
            <p className="text-gray-400">Chọn kết quả để test luồng xử lý thanh toán</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={simulatePaymentSuccess}
              disabled={processing}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {processing ? 'Đang xử lý...' : 'Giả lập thanh toán THÀNH CÔNG'}
            </button>

            <button
              onClick={simulatePaymentFailure}
              disabled={processing}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5 mr-2" />
              {processing ? 'Đang xử lý...' : 'Giả lập thanh toán THẤT BẠI'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={() => navigate('/history')}
              className="flex items-center justify-center px-4 py-2 text-gray-400 hover:text-white transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang đặt vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMockup;