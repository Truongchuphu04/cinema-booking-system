import React from 'react';
import { formatPrice, calculateTotal, getSeatTypeLabel, getSeatPrice } from '../../utils/seatUtils';
import { getPosterUrl } from '../../utils/imageUtils';

const BookingSidebar = ({ 
  movie, 
  showDetails, 
  selectedSeats, 
  bookingStep,
  onContinue,
  onPayment,
  onBack 
}) => {
  const total = calculateTotal(selectedSeats, showDetails?.price);

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sticky top-24">
      <h3 className="text-xl font-bold text-white mb-6">Thông tin đặt vé</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex gap-3">
          <img 
            src={getPosterUrl(movie)} 
            alt={movie.title}
            className="w-16 h-24 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/placeholder-poster.svg';
            }}
          />
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm mb-1">{movie.title}</h4>
            <p className="text-gray-400 text-xs">
              {typeof showDetails.cinema === 'string' 
                ? showDetails.cinema 
                : showDetails.theaterId?.name || showDetails.theater?.name || 'Cinema'
              }
            </p>
            <p className="text-gray-400 text-xs">
              {typeof showDetails.room === 'string' 
                ? showDetails.room 
                : showDetails.roomId?.name || showDetails.room?.name || showDetails.roomId || 'Phòng chiếu'
              }
            </p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Ngày:</span>
            <span className="text-white">{new Date(showDetails.date).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Giờ:</span>
            <span className="text-white">{showDetails.time}</span>
          </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">Ghế đã chọn:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <span key={seat} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                {seat}
              </span>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {selectedSeats.map(seat => {
              const row = seat.charAt(0);
              const type = getSeatTypeLabel(row);
              const price = getSeatPrice(row, showDetails?.price);
              return (
                <div key={seat} className="flex justify-between text-gray-300">
                  <span>{seat} ({type})</span>
                  <span>{formatPrice(price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-600 pt-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400">Tổng tiền:</span>
          <span className="text-2xl font-bold text-red-500">{formatPrice(total)}</span>
        </div>
        
        {bookingStep === 'select' && (
          <button
            onClick={onContinue}
            disabled={selectedSeats.length === 0}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors"
          >
            {selectedSeats.length === 0 ? 'Chọn ghế để tiếp tục' : 'Tiếp tục'}
          </button>
        )}

        {bookingStep === 'confirm' && (
          <div className="space-y-3">
            <button
              onClick={onPayment}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
            >
              Thanh toán
            </button>
            <button
              onClick={onBack}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors"
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSidebar;