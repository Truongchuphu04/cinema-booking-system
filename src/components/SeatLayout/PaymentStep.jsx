import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Wallet, Shield, Clock } from 'lucide-react';

const PaymentStep = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('processing');

  useEffect(() => {
    const steps = [
      { step: 'processing', message: 'Đang xử lý thanh toán...', duration: 1000 },
      { step: 'verifying', message: 'Xác thực thông tin...', duration: 1000 },
      { step: 'confirming', message: 'Xác nhận đặt vé...', duration: 1000 }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setCurrentStep(steps[currentStepIndex].step);
        setProgress((currentStepIndex + 1) * 33.33);
        currentStepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const paymentMethods = [
    {
      icon: CreditCard,
      name: 'Thẻ tín dụng/Ghi nợ',
      description: 'Visa, MasterCard, JCB',
      color: 'text-blue-400'
    },
    {
      icon: Smartphone,
      name: 'Ví điện tử',
      description: 'MoMo, ZaloPay, ViettelPay',
      color: 'text-green-400'
    },
    {
      icon: Wallet,
      name: 'Chuyển khoản ngân hàng',
      description: 'Internet Banking, QR Code',
      color: 'text-purple-400'
    }
  ];

  const getStepMessage = () => {
    switch (currentStep) {
      case 'processing':
        return 'Đang xử lý thanh toán...';
      case 'verifying':
        return 'Xác thực thông tin thanh toán...';
      case 'confirming':
        return 'Xác nhận đặt vé thành công...';
      default:
        return 'Đang xử lý...';
    }
  };

  return (
    <div className="text-center py-12 max-w-md mx-auto">
      {/* Loading Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 mx-auto relative">
          <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white text-lg font-semibold mb-2">{getStepMessage()}</p>
        <p className="text-gray-400 text-sm">Vui lòng không tắt trang web trong quá trình thanh toán</p>
      </div>

      {/* Security Notice */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-medium text-sm">Thanh toán bảo mật</span>
        </div>
        <p className="text-green-200/80 text-xs">
          Giao dịch của bạn được bảo vệ bằng mã hóa SSL 256-bit
        </p>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-400" />
          Phương thức thanh toán được hỗ trợ
        </h4>
        <div className="space-y-3">
          {paymentMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <IconComponent className={`w-5 h-5 ${method.color}`} />
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{method.name}</p>
                  <p className="text-gray-400 text-xs">{method.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Processing Time Notice */}
      <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
        <Clock className="w-4 h-4" />
        <span>Thời gian xử lý: 3-5 giây</span>
      </div>
    </div>
  );
};

export default PaymentStep;