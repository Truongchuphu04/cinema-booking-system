import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';

const BookingFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;
  const error = location.state?.error || 'Thanh toán không thành công';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const retryPayment = () => {
    if (booking?._id) {
      navigate(`/payment-mockup?bookingId=${booking._id}`);
    } else {
      navigate('/movies');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black pt-24 px-4">
      {/* Background Effects */}
      <BlurCircle 
        top="10%" 
        left="80%" 
        size="300px" 
        color="rgba(239, 68, 68, 0.1)" 
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Thanh toán thất bại</h1>
          <p className="text-gray-400">Đã có lỗi xảy ra trong quá trình thanh toán</p>
        </div>

        {/* Error Details */}
        <div className="glass-card rounded-xl p-6 border border-red-500/30 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Chi tiết lỗi</h3>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>

          {/* Booking Info if available */}
          {booking && (
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Thông tin đặt vé bị hủy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Mã đặt vé:</p>
                  <p className="text-white font-mono">{booking.bookingCode || `#${booking._id?.slice(-8)}`}</p>
                </div>
                <div>
                  <p className="text-gray-400">Phim:</p>
                  <p className="text-white">{booking.movieId?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Suất chiếu:</p>
                  <p className="text-white">{booking.showDate} {booking.showTime}</p>
                </div>
                <div>
                  <p className="text-gray-400">Tổng tiền:</p>
                  <p className="text-red-400 font-semibold">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Common Error Causes */}
        <div className="glass-card rounded-xl p-6 border border-gray-700 mb-8">
          <h4 className="text-lg font-semibold text-white mb-4">Nguyên nhân thường gặp</h4>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Thông tin thẻ không chính xác</p>
                <p className="text-sm text-gray-400">Kiểm tra lại số thẻ, ngày hết hạn và mã CVV</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Không đủ số dư tài khoản</p>
                <p className="text-sm text-gray-400">Đảm bảo tài khoản có đủ tiền để thanh toán</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Thẻ bị khóa hoặc hạn chế</p>
                <p className="text-sm text-gray-400">Liên hệ ngân hàng để kiểm tra tình trạng thẻ</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
              <div>
                <p className="font-medium">Kết nối mạng không ổn định</p>
                <p className="text-sm text-gray-400">Thử lại khi có kết nối internet tốt hơn</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={retryPayment}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Thử lại thanh toán
            </button>

            <button
              onClick={() => navigate('/movies')}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
            >
              Đặt vé khác
            </button>
          </div>

          <button
            onClick={() => navigate('/history')}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại lịch sử đặt vé
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 glass-card rounded-xl p-6 border border-gray-700 text-center">
          <h4 className="text-lg font-semibold text-white mb-2">Cần hỗ trợ?</h4>
          <p className="text-gray-400 mb-4">
            Nếu vấn đề vẫn tiếp tục xảy ra, vui lòng liên hệ với chúng tôi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="text-sm">
              <p className="text-gray-400">Hotline:</p>
              <p className="text-cyan-400 font-semibold">1900 xxxx</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-400">Email:</p>
              <p className="text-cyan-400 font-semibold">support@cinema.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFailed;