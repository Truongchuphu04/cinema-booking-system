import React from 'react';
import { formatDate, formatPrice, calculateTotal, getSeatTypeLabel, getSeatPrice } from '../../utils/seatUtils';
import { getPosterUrl } from '../../utils/imageUtils';
import { Check, AlertCircle } from 'lucide-react';

const ConfirmationStep = ({ 
  movie, 
  showDetails, 
  selectedSeats 
}) => {
  const total = calculateTotal(selectedSeats, showDetails?.price);

  // Group seats by type for better display
  const seatsByType = selectedSeats.reduce((acc, seatId) => {
    const row = seatId.charAt(0);
    const type = getSeatTypeLabel(row);
    const price = getSeatPrice(row, showDetails?.price);
    
    if (!acc[type]) {
      acc[type] = { seats: [], price, count: 0 };
    }
    acc[type].seats.push(seatId);
    acc[type].count += 1;
    
    return acc;
  }, {});

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-blue-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">Xác nhận thông tin đặt vé</h3>
      <p className="text-gray-400 mb-8">Vui lòng kiểm tra lại thông tin trước khi thanh toán</p>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Movie Info Card */}
        <div className="bg-gray-800/50 rounded-xl p-6 text-left">
          <div className="flex items-start gap-4 mb-4">
            <img 
              src={getPosterUrl(movie)} 
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-poster.svg';
              }}
            />
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg mb-2">{movie.title}</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-400">Thể loại:</span> {movie.genre || 'Hành động'}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Thời lượng:</span> {movie.runtime || '120'} phút
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Showtime Info */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Thông tin suất chiếu
          </h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày chiếu:</span>
                <span className="text-white font-medium">{formatDate(showDetails.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Giờ chiếu:</span>
                <span className="text-white font-medium">{showDetails.time}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Rạp:</span>
                <span className="text-white font-medium">
                  {typeof showDetails.cinema === 'string' 
                    ? showDetails.cinema 
                    : showDetails.theaterId?.name || showDetails.theater?.name || 'Cinema'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phòng:</span>
                <span className="text-white font-medium">
                  {typeof showDetails.room === 'string' 
                    ? showDetails.room 
                    : showDetails.roomId?.name || showDetails.room?.name || showDetails.roomId || 'Phòng chiếu'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seats Info */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h5 className="font-semibold text-white mb-4">Chi tiết ghế đã chọn</h5>
          <div className="space-y-3">
            {Object.entries(seatsByType).map(([type, info]) => (
              <div key={type} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                <div className="flex-1">
                  <p className="text-white font-medium">{type} x{info.count}</p>
                  <p className="text-gray-400 text-sm">
                    Ghế: {info.seats.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatPrice(info.price * info.count)}</p>
                  <p className="text-gray-400 text-sm">{formatPrice(info.price)}/ghế</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-xl p-6 border border-red-500/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-300 text-sm">Tổng thanh toán</p>
              <p className="text-gray-400 text-xs">{selectedSeats.length} ghế</p>
            </div>
            <p className="text-red-400 font-bold text-2xl">{formatPrice(total)}</p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-yellow-300 font-medium text-sm mb-1">Lưu ý quan trọng:</p>
              <ul className="text-yellow-200/80 text-xs space-y-1">
                <li>• Vé đã đặt không thể hoàn trả hoặc đổi lịch</li>
                <li>• Vui lòng có mặt tại rạp ít nhất 15 phút trước giờ chiếu</li>
                <li>• Mang theo giấy tờ tùy thân khi đến rạp</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;    