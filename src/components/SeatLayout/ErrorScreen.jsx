import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const ErrorScreen = ({ onBack, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Oops! Có lỗi xảy ra</h2>
        <p className="text-gray-400 mb-8">
          Không thể tải thông tin phim hoặc suất chiếu. Vui lòng thử lại sau.
        </p>

        {/* Error Details */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
          <p className="text-red-300 text-sm">
            <strong>Mã lỗi:</strong> MOVIE_NOT_FOUND<br/>
            <strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Thử lại
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>

        {/* Support Contact */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
          <p className="text-gray-400 text-sm mb-2">Cần hỗ trợ?</p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="tel:1900-6017" className="text-blue-400 hover:text-blue-300">
              📞 1900-6017
            </a>
            <a href="mailto:support@cgv.vn" className="text-blue-400 hover:text-blue-300">
              ✉️ Email hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;