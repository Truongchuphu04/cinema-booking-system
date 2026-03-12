import React from 'react';
import { getSeatType, getSeatPrice, getSeatTypeLabel, formatPrice, SEAT_CONFIG } from '../../utils/seatUtils';

const Seat = ({ seatId, row, isOccupied, isSelected, basePrice, seatConfig = SEAT_CONFIG, onClick }) => {
  const seatType = getSeatType(row, seatConfig);
  const seatNumber = seatId.replace(row, '');
  const isCouple = seatType === 'couple';

  // Ghế đôi rộng gấp đôi (w-18 thay vì w-8)
  let seatClass = isCouple
    ? 'w-[72px] h-10 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold hover:scale-105 '
    : 'w-8 h-8 rounded-sm cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-bold hover:scale-110 ';

  if (isOccupied) {
    seatClass += 'bg-red-500 text-white cursor-not-allowed';
  } else if (isSelected) {
    seatClass += isCouple ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/50' : 'bg-blue-500 text-white shadow-lg';
  } else {
    if (seatType === 'vip') {
      seatClass += 'bg-yellow-500/20 border border-yellow-500 text-yellow-300 hover:bg-yellow-500/40';
    } else if (seatType === 'couple') {
      seatClass += 'bg-pink-500/20 border-2 border-pink-500 text-pink-300 hover:bg-pink-500/40';
    } else {
      seatClass += 'bg-gray-600 text-white hover:bg-gray-500';
    }
  }

  return (
    <div
      className={seatClass}
      onClick={() => !isOccupied && onClick(seatId, row)}
      title={`${seatId} - ${getSeatTypeLabel(row, seatConfig)} - ${formatPrice(getSeatPrice(row, basePrice, seatConfig))}`}
    >
      {seatNumber}
    </div>
  );
};

export default Seat;