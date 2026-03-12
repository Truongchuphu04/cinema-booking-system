import React from 'react';
import { Check, Download, Calendar, MapPin, Clock, Ticket, Star } from 'lucide-react';
import { formatDate, formatPrice, calculateTotal, getSeatTypeLabel, getSeatPrice, calculateSeatConfig } from '../../utils/seatUtils';
import { getPosterUrl } from '../../utils/imageUtils';

const SuccessScreen = ({
  movie,
  showDetails,
  selectedSeats,
  onBackToMovies
}) => {
  const seatConfig = calculateSeatConfig(showDetails?.totalSeats || 120);
  const total = calculateTotal(selectedSeats, showDetails?.price, seatConfig);
  const bookingId = `CGV${Date.now().toString().slice(-6)}`;

  const downloadTicket = () => {
    // Simulate ticket download
    alert('Tính năng tải vé sẽ được cập nhật sớm!');
  };

  const addToCalendar = () => {
    // Simulate calendar integration
    alert('Đã thêm lịch chiếu vào calendar!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check className="w-12 h-12 text-white" />
          </div>
          {/* Celebration particles */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping`}
                style={{
                  left: `${Math.cos((i * Math.PI) / 4) * 40}px`,
                  top: `${Math.sin((i * Math.PI) / 4) * 40}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">🎉 Đặt vé thành công!</h2>
        <p className="text-gray-300 mb-8">
          Cảm ơn bạn đã tin tưởng CGV. Vé điện tử đã được gửi vào email của bạn.
        </p>

        {/* Ticket Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-600 shadow-2xl transform perspective-1000 rotateX-5">
          {/* Ticket Header */}
          <div className="border-b border-gray-600 pb-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={getPosterUrl(movie)}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-poster.svg';
                }}
              />
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-gray-400 text-sm ml-1">({movie.rating || '8.5'})</span>
                </div>
                <p className="text-gray-400 text-sm">{movie.genre || 'Hành động • Phiêu lưu'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-left">
              <div>
                <p className="text-gray-400 text-sm mb-1">Mã đặt vé</p>
                <p className="text-white font-mono text-lg">{bookingId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Tổng tiền</p>
                <p className="text-green-400 font-bold text-lg">{formatPrice(total)}</p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Ngày chiếu</p>
                  <p className="text-white font-medium">{formatDate(showDetails.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Giờ chiếu</p>
                  <p className="text-white font-medium">{showDetails.time}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Rạp chiếu</p>
                  <p className="text-white font-medium">
                    {typeof showDetails.cinema === 'string'
                      ? showDetails.cinema
                      : showDetails.theaterId?.name || showDetails.theater?.name || 'Cinema'
                    }
                  </p>
                  <p className="text-gray-300 text-sm">
                    {typeof showDetails.room === 'string'
                      ? showDetails.room
                      : showDetails.roomId?.name || showDetails.room?.name || showDetails.roomId || 'Phòng chiếu'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Ghế ngồi</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map(seat => (
                      <span key={seat} className="px-2 py-1 bg-blue-500 text-white rounded text-sm">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="mt-6 pt-6 border-t border-gray-600 flex justify-center">
            <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-8 gap-1">
                {[...Array(64)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-700'} rounded-sm`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2">Quét mã QR tại rạp để vào xem phim</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={downloadTicket}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            Tải vé
          </button>
          <button
            onClick={addToCalendar}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Thêm lịch
          </button>
          <button
            onClick={onBackToMovies}
            className="flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
          >
            <Ticket className="w-5 h-5" />
            Đặt vé khác
          </button>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <h4 className="text-yellow-300 font-semibold mb-3">📋 Lưu ý quan trọng</h4>
          <div className="text-left space-y-2 text-yellow-200/90 text-sm">
            <p>• <strong>Có mặt trước 15 phút:</strong> Để đảm bảo không bỏ lỡ suất chiếu</p>
            <p>• <strong>Mang giấy tờ tùy thân:</strong> CMND/CCCD hoặc bằng lái xe</p>
            <p>• <strong>Xuất trình vé điện tử:</strong> Tại quầy hoặc quét QR code</p>
            <p>• <strong>Không hoàn vé:</strong> Vé đã mua không được hoàn trả hoặc đổi lịch</p>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Cần hỗ trợ? Liên hệ{' '}
            <a href="tel:1900-6017" className="text-red-400 hover:text-red-300">
              1900 6017
            </a>
            {' '}hoặc{' '}
            <a href="mailto:support@cgv.vn" className="text-red-400 hover:text-red-300">
              support@cgv.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;