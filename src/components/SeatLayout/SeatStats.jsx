import React from 'react';
import { Users, Crown, Heart as HeartIcon, Ticket } from 'lucide-react';
import { calculateSeatConfig } from '../../utils/seatUtils';

const SeatStats = ({ occupiedSeats = {}, totalSeats = 120 }) => {
  const seatConfig = calculateSeatConfig(totalSeats);
  const { regularRows, vipRows, coupleRows, counts } = seatConfig;
  
  // Tính tổng số ghế
  const totalSeatsCount = totalSeats;
  
  // Tính số ghế theo loại từ config
  const regularSeats = counts.regular;
  const vipSeats = counts.vip;
  const coupleSeats = counts.couple;
  
  // Tính số ghế đã đặt
  const occupiedSeatsTotal = Object.keys(occupiedSeats).length;
  const availableSeats = totalSeatsCount - occupiedSeatsTotal;
  
  // Tính số ghế đã đặt theo loại
  const occupiedRegular = Object.keys(occupiedSeats).filter(seat => 
    regularRows.includes(seat.charAt(0))
  ).length;
  
  const occupiedVip = Object.keys(occupiedSeats).filter(seat => 
    vipRows.includes(seat.charAt(0))
  ).length;
  
  const occupiedCouple = Object.keys(occupiedSeats).filter(seat => 
    coupleRows.includes(seat.charAt(0))
  ).length;

  const stats = [
    {
      icon: Ticket,
      label: 'Tổng số ghế',
      value: totalSeatsCount,
      available: availableSeats,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Users,
      label: 'Ghế thường',
      value: regularSeats,
      available: regularSeats - occupiedRegular,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20'
    },
    {
      icon: Crown,
      label: 'Ghế VIP',
      value: vipSeats,
      available: vipSeats - occupiedVip,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      icon: HeartIcon,
      label: 'Ghế đôi',
      value: coupleSeats,
      available: coupleSeats - occupiedCouple,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    }
  ];

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-blue-400" />
        Thông tin ghế ngồi
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const percentage = stat.value > 0 ? ((stat.available / stat.value) * 100).toFixed(0) : 0;
          
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-4 text-center`}>
              <IconComponent className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">{stat.available}/{stat.value}</p>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      stat.color.replace('text-', 'bg-')
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">{percentage}% còn trống</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-blue-300 text-xs text-center">
          💡 Tỷ lệ: 50% ghế thường • 30% ghế VIP • 20% ghế đôi
        </p>
      </div>
    </div>
  );
};

export default SeatStats;