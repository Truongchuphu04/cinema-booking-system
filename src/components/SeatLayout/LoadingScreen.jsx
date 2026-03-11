import React from 'react';
import { Film, Users, MapPin } from 'lucide-react';

const LoadingScreen = () => {
  const loadingSteps = [
    { icon: Film, text: 'Đang tải thông tin phim...', delay: '0s' },
    { icon: MapPin, text: 'Đang tải sơ đồ rạp...', delay: '0.5s' },
    { icon: Users, text: 'Đang kiểm tra ghế trống...', delay: '1s' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Loading Spinner */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto relative">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
            {/* Inner pulsing dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">Đang tải...</h2>
        <p className="text-gray-400 mb-8">Vui lòng chờ trong giây lát</p>

        {/* Loading Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm animate-pulse"
                style={{ animationDelay: step.delay }}
              >
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{step.text}</p>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                    <div 
                      className="bg-red-500 h-1 rounded-full animate-pulse"
                      style={{ 
                        width: '60%',
                        animation: `loading-progress 2s ease-in-out infinite ${step.delay}`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cinema atmosphere elements */}
        <div className="mt-12 relative">
          {/* Floating movie elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
            <div className="absolute top-6 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}></div>
            <div className="absolute bottom-6 left-1/3 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.5s' }}></div>
          </div>
          
          {/* Loading tips */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="text-blue-300 font-semibold mb-2">💡 Mẹo nhỏ</h4>
            <p className="text-blue-200/80 text-sm">
              Chọn ghế ở hàng F-H để có trải nghiệm xem phim tốt nhất!
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes loading-progress {
          0%, 100% { width: 30%; }
          50% { width: 80%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;