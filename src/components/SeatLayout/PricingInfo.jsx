import React from 'react';
import { Users, Crown, Heart as HeartIcon } from 'lucide-react';
import { formatPrice } from '../../utils/seatUtils';

const PricingInfo = ({ basePrice = 100000 }) => {
  const pricingTiers = [
    {
      type: 'regular',
      icon: Users,
      label: 'Ghế thường',
      price: basePrice,
      bgColor: 'bg-gray-800/50',
      iconColor: 'text-gray-400'
    },
    {
      type: 'vip',
      icon: Crown,
      label: 'Ghế VIP',
      price: basePrice * 1.5,
      bgColor: 'bg-yellow-800/50',
      iconColor: 'text-yellow-400'
    },
    {
      type: 'couple',
      icon: HeartIcon,
      label: 'Ghế đôi',
      price: basePrice * 2,
      bgColor: 'bg-pink-800/50',
      iconColor: 'text-pink-400'
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {pricingTiers.map((tier) => {
        const IconComponent = tier.icon;
        return (
          <div key={tier.type} className={`${tier.bgColor} rounded-xl p-4 text-center transition-transform hover:scale-105`}>
            <IconComponent className={`w-6 h-6 ${tier.iconColor} mx-auto mb-2`} />
            <p className="text-gray-400 text-sm mb-1">{tier.label}</p>
            <p className="text-white font-bold text-lg">{formatPrice(tier.price)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default PricingInfo;