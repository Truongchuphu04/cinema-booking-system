import React from 'react';
import Seat from './Seat';
import SeatLegend from './SeatLegend';
import PricingInfo from './PricingInfo';
import { calculateSeatConfig, getSeatType } from '../../utils/seatUtils';

const SeatMap = ({
  selectedSeats,
  occupiedSeats,
  basePrice,
  totalSeats = 120, // Nhận từ showtime
  onSeatClick
}) => {
  // Tính toán cấu hình ghế động
  const seatConfig = calculateSeatConfig(totalSeats);
  const { seatRows, seatsPerRow } = seatConfig;

  // Render ghế cho mỗi hàng
  const renderSeatsForRow = (row) => {
    const seatType = getSeatType(row, seatConfig);
    const isCouple = seatType === 'couple';

    // Ghế đôi: chỉ render một nửa số ghế (mỗi ghế chiếm 2 chỗ)
    const actualSeatsPerRow = isCouple ? Math.floor(seatsPerRow / 2) : seatsPerRow;
    const leftSeats = Math.floor(actualSeatsPerRow / 2);
    const rightSeats = actualSeatsPerRow - leftSeats;

    return (
      <div className={`flex ${isCouple ? 'gap-2' : 'gap-1'}`}>
        {/* Left section */}
        {Array.from({ length: leftSeats }, (_, index) => {
          const seatNumber = index + 1;
          const seatId = `${row}${seatNumber}`;
          return (
            <Seat
              key={seatId}
              seatId={seatId}
              row={row}
              isOccupied={occupiedSeats[seatId]}
              isSelected={selectedSeats.includes(seatId)}
              basePrice={basePrice}
              seatConfig={seatConfig}
              onClick={onSeatClick}
            />
          );
        })}

        {/* Aisle */}
        <div className="w-6"></div>

        {/* Right section */}
        {Array.from({ length: rightSeats }, (_, index) => {
          const seatNumber = leftSeats + index + 1;
          const seatId = `${row}${seatNumber}`;
          return (
            <Seat
              key={seatId}
              seatId={seatId}
              row={row}
              isOccupied={occupiedSeats[seatId]}
              isSelected={selectedSeats.includes(seatId)}
              basePrice={basePrice}
              seatConfig={seatConfig}
              onClick={onSeatClick}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Screen */}
      <div className="mb-8 text-center">
        <div className="w-full max-w-4xl mx-auto h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mb-3"></div>
        <p className="text-gray-400 text-sm font-medium">MÀN HÌNH CHIẾU</p>
      </div>

      <SeatLegend />

      {/* Seats */}
      <div className="space-y-4 mb-8">
        {seatRows.map(row => {
          const seatType = getSeatType(row, seatConfig);
          const isCouple = seatType === 'couple';

          return (
            <div key={row} className="flex justify-center items-center gap-2">
              <div className="w-8 text-center text-gray-300 font-semibold text-sm">
                {row}
                {isCouple && <span className="text-pink-400 text-xs ml-1">♥</span>}
              </div>
              {renderSeatsForRow(row)}
            </div>
          );
        })}
      </div>

      <PricingInfo basePrice={basePrice} />
    </>
  );
};

export default SeatMap;