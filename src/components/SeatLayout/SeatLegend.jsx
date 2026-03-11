import React from 'react';

const SeatLegend = () => {
  const legendItems = [
    { color: 'bg-gray-600', label: 'Trống' },
    { color: 'bg-red-500', label: 'Đã đặt' },
    { color: 'bg-blue-500', label: 'Đang chọn' },
    { color: 'bg-yellow-500', label: 'VIP (+50%)' },
    { color: 'bg-pink-500', label: 'Ghế đôi (+100%)' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={`w-4 h-4 ${item.color} rounded-sm`}></div>
          <span className="text-gray-300">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SeatLegend;