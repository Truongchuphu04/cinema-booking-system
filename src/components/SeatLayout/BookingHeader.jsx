import React from 'react';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/seatUtils';

const BookingHeader = ({ movie, showDetails, onBack }) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{movie.title}</h1>
        <p className="text-gray-400 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(showDetails.date)} - {showDetails.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {typeof showDetails.cinema === 'string' 
              ? showDetails.cinema 
              : showDetails.theaterId?.name || showDetails.theater?.name || 'Cinema'
            } - {typeof showDetails.room === 'string' 
              ? showDetails.room 
              : showDetails.roomId?.name || showDetails.room?.name || showDetails.roomId || 'Phòng chiếu'
            }
          </span>
        </p>
      </div>
    </div>
  );
};

export default BookingHeader;