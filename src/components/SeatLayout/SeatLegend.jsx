import React from 'react';

const SeatLegend = () => {
  const legendItems = [
    { color: 'bg-gray-600', label: 'Trống', shape: 'rounded-sm w-4 h-4' },
    { color: 'bg-red-500', label: 'Đã đặt', shape: 'rounded-sm w-4 h-4' },
    { color: 'bg-blue-500', label: 'Đang chọn', shape: 'rounded-sm w-4 h-4' },
    { color: 'bg-yellow-500', label: 'VIP (+50%)', shape: 'rounded-sm w-4 h-4' },
    { color: 'bg-pink-500', label: 'Ghế đôi (500k)', shape: 'rounded-md w-8 h-4' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={`${item.shape} ${item.color}`}></div>
          <span className="text-gray-300">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SeatLegend;