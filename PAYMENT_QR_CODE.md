# 💳 Payment & QR Code Implementation Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│        Frontend Payment Page            │
│  - Select payment method                │
│  - Enter card/wallet info               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Create Booking (POST /api/bookings)    │
│  - Status: pending, paymentStatus: null │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Payment Processing                     │
│  - POST /bookings/:id/payment-success   │
│  - Update paymentStatus → paid          │
│  - Generate QR Code                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  QR Code Generation                     │
│  - Data: booking ID + seats             │
│  - Format: JSON → QR Image              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Show Success Page + QR Code            │
│  - Booking confirmation                 │
│  - Download/Print ticket                │
└─────────────────────────────────────────┘
```

---

## 💰 Payment Methods Supported

### 1. Card Payment (Stripe Mock)
```javascript
{
  method: 'card',
  provider: 'stripe',
  details: {
    cardNumber: '4242424242424242',
    expiryMonth: 12,
    expiryYear: 2025,
    cvc: '123'
  }
}
```

### 2. Mobile Wallet (Momo)
```javascript
{
  method: 'momo',
  provider: 'momo',
  details: {
    phoneNumber: '0123456789'
  }
}
```

### 3. Bank Transfer
```javascript
{
  method: 'banking',
  provider: 'vietcombank',
  details: {
    accountNumber: '1234567890',
    bankCode: 'VCB'
  }
}
```

### 4. ZaloPay
```javascript
{
  method: 'zalopay',
  provider: 'zalopay',
  details: {
    phoneNumber: '0123456789'
  }
}
```

---

## 🎯 QR Code Implementation

### Backend: Generate QR Code Data

File: `src/controllers/bookingController.js`

```javascript
const QRCode = require('qrcode');

// When payment is successful
async function generateQRCode(booking) {
  try {
    // Prepare QR data
    const qrData = {
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      movieTitle: booking.movieId.title,
      theater: booking.theaterId.name,
      date: booking.showDate,
      time: booking.showTime,
      seats: booking.seats.map(s => s.seatNumber).join(', '),
      customerName: booking.customerInfo.name,
      customerPhone: booking.customerInfo.phone,
      totalAmount: booking.totalAmount,
      paymentStatus: 'paid',
      generatedAt: new Date().toISOString()
    };

    // Generate QR code image (PNG base64)
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });

    return {
      qrCode: qrCodeImage,
      qrData: qrData
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Usage in payment success endpoint
router.post('/bookings/:id/payment-success', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update payment status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    
    // Generate QR code
    const { qrCode, qrData } = await generateQRCode(booking);
    booking.qrCode = qrCode;
    booking.qrData = qrData;
    
    await booking.save();

    res.json({
      success: true,
      message: 'Payment successful',
      data: {
        ...booking.toObject(),
        qrCode,
        qrData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
});
```

---

### Frontend: Display QR Code

File: `src/components/SeatLayout/ConfirmationStep.jsx`

```javascript
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ConfirmationStep({ booking, qrCode, totalPrice }) {
  const [copied, setCopied] = useState(false);
  const qrRef = React.useRef();

  const handleCopyBookingCode = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    if (qrRef.current) {
      const canvas = await html2canvas(qrRef.current);
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `ticket-${booking.bookingCode}.png`;
      link.click();
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Cinema Ticket - ${booking.bookingCode}</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 20px; }
            .ticket { border: 2px solid #333; padding: 20px; max-width: 400px; margin: 0 auto; }
            .ticket h2 { color: #d63031; margin: 10px 0; }
            .ticket-info { text-align: left; margin: 20px 0; }
            .qr-code { margin: 20px 0; }
            .seats { background: #f1f2f6; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2>🎬 ${booking.movieTitle}</h2>
            <div class="ticket-info">
              <p><strong>Booking Code:</strong> ${booking.bookingCode}</p>
              <p><strong>Theater:</strong> ${booking.theater}</p>
              <p><strong>Date:</strong> ${booking.date}</p>
              <p><strong>Time:</strong> ${booking.time}</p>
              <div class="seats">
                <strong>Seats:</strong> ${booking.seats.join(', ')}
              </div>
              <p><strong>Total:</strong> ${booking.totalPrice.toLocaleString('vi-VN')}đ</p>
            </div>
            <div class="qr-code">
              <img src="${booking.qrCode}" alt="QR Code" width="200">
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="confirmation-page">
      <div className="success-message">
        <div className="success-icon">✅</div>
        <h1>Đặt vé thành công!</h1>
        <p>Vé của bạn đã được xác nhận</p>
      </div>

      <div className="ticket-details">
        <h2>Thông tin vé</h2>
        
        {/* Booking Code */}
        <div className="booking-code">
          <label>Mã đặt vé:</label>
          <div className="code-display">
            <input 
              type="text" 
              value={booking.bookingCode} 
              readOnly
              className="code-input"
            />
            <button 
              onClick={handleCopyBookingCode}
              className="btn-copy"
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Movie & Theater Info */}
        <div className="movie-info">
          <p><strong>🎬 Phim:</strong> {booking.movieTitle}</p>
          <p><strong>🏛️ Rạp:</strong> {booking.theater}</p>
          <p><strong>📅 Ngày:</strong> {booking.date}</p>
          <p><strong>⏰ Giờ:</strong> {booking.time}</p>
          <p><strong>🪑 Ghế:</strong> {booking.seats.join(', ')}</p>
          <p><strong>💰 Tổng tiền:</strong> <span className="price">{totalPrice.toLocaleString('vi-VN')}đ</span></p>
        </div>

        {/* QR Code */}
        <div className="qr-section" ref={qrRef}>
          <h3>QR Code Vé</h3>
          <div className="qr-code-container">
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="qr-image" />
            ) : (
              <p>Đang tạo QR code...</p>
            )}
          </div>
          <p className="qr-note">Quét mã này khi vào rạp chiếu</p>
        </div>

        {/* Actions */}
        <div className="action-buttons">
          <button onClick={handleDownloadQR} className="btn-download">
            ⬇️ Tải QR Code
          </button>
          <button onClick={handlePrintQR} className="btn-print">
            🖨️ In vé
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps">
        <h3>Bước tiếp theo:</h3>
        <ol>
          <li>Lưu hoặc in mã QR của bạn</li>
          <li>Đến rạp chiếu trước 15 phút</li>
          <li>Quét mã QR hoặc cho nhân viên xem</li>
          <li>Nhận vé vào phòng chiếu</li>
        </ol>
      </div>

      {/* Back to Home */}
      <div className="footer-action">
        <button onClick={() => navigate('/')} className="btn-home">
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
```

---

## 💳 Payment Step Component

File: `src/components/SeatLayout/PaymentStep.jsx`

```javascript
import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';

export default function PaymentStep({
  totalPrice,
  paymentMethod,
  setPaymentMethod,
  customerInfo,
  setCustomerInfo,
  onNext,
  onPrev
}) {
  const { selectedSeats } = useBooking();
  const [paymentDetails, setPaymentDetails] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const PAYMENT_METHODS = [
    {
      id: 'card',
      name: '💳 Thẻ tín dụng',
      icon: '🏦',
      description: 'Visa, Mastercard, etc.'
    },
    {
      id: 'momo',
      name: '📱 Momo',
      icon: '📱',
      description: 'Ví điện tử Momo'
    },
    {
      id: 'zalopay',
      name: '📱 ZaloPay',
      icon: '📱',
      description: 'Ví điện tử ZaloPay'
    },
    {
      id: 'banking',
      name: '🏧 Chuyển khoản',
      icon: '🏦',
      description: 'Ngân hàng'
    }
  ];

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({});
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      customerInfo.name &&
      customerInfo.email &&
      customerInfo.phone &&
      agreeTerms &&
      selectedSeats.length > 0
    );
  };

  return (
    <div className="payment-container">
      <div className="payment-summary">
        <h3>Tóm tắt đơn hàng</h3>
        <div className="summary-item">
          <span>Số ghế:</span>
          <span>{selectedSeats.length} ghế</span>
        </div>
        <div className="summary-item">
          <span>Ghế đã chọn:</span>
          <span>{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
        </div>
        <div className="summary-total">
          <span>Tổng cộng:</span>
          <span className="price">{totalPrice.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="payment-methods">
        <h3>Chọn phương thức thanh toán</h3>
        <div className="methods-grid">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              className={`method-card ${paymentMethod === method.id ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange(method.id)}
            >
              <div className="method-icon">{method.icon}</div>
              <div className="method-name">{method.name}</div>
              <div className="method-desc">{method.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Information */}
      <div className="customer-info">
        <h3>Thông tin khách hàng</h3>
        <div className="form-group">
          <label>Tên:</label>
          <input
            type="text"
            name="name"
            value={customerInfo.name}
            onChange={handleCustomerInfoChange}
            placeholder="Nhập tên đầy đủ"
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={customerInfo.email}
            onChange={handleCustomerInfoChange}
            placeholder="Nhập email"
            required
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại:</label>
          <input
            type="tel"
            name="phone"
            value={customerInfo.phone}
            onChange={handleCustomerInfoChange}
            placeholder="Nhập số điện thoại"
            required
          />
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="terms-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span>Tôi đồng ý với điều khoản và điều kiện</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="payment-actions">
        <button onClick={onPrev} className="btn-prev">
          ← Quay lại
        </button>
        <button
          onClick={onNext}
          className="btn-confirm"
          disabled={!isFormValid()}
        >
          Xác nhận thanh toán
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Payment Flow

### 1. Test with Mock Data

```javascript
// Mock booking for testing
const mockBooking = {
  _id: '507f1f77bcf86cd799439011',
  bookingCode: 'BK000001',
  movieTitle: 'Avengers: Endgame',
  theater: 'CineMax Hà Nội',
  date: '2024-03-20',
  time: '19:00',
  seats: ['A1', 'A2', 'B5'],
  totalPrice: 350000,
  paymentStatus: 'paid',
  qrCode: 'data:image/png;base64,...'
};
```

### 2. Test QR Code Generation

```bash
# Using curl
curl -X POST http://localhost:3000/api/bookings/<bookingId>/payment-success \
  -H "Authorization: Bearer <token>"

# Response should include:
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,...",
    "qrData": {
      "bookingId": "...",
      "seats": "A1, A2, B5",
      ...
    }
  }
}
```

### 3. Test Different Payment Methods

```javascript
// Card payment
POST /bookings
{
  "paymentMethod": "card"
}

// Momo payment
POST /bookings
{
  "paymentMethod": "momo"
}

// ZaloPay payment
POST /bookings
{
  "paymentMethod": "zalopay"
}

// Bank transfer
POST /bookings
{
  "paymentMethod": "banking"
}
```

---

## 📋 Payment Checklist

- [ ] User selects payment method
- [ ] User enters customer information
- [ ] Booking is created with paymentStatus: 'pending'
- [ ] Payment success endpoint is called
- [ ] QR code is generated
- [ ] paymentStatus is updated to 'paid'
- [ ] Confirmation page displays QR code
- [ ] User can download QR code
- [ ] User can print ticket
- [ ] QR code can be scanned

---

## 🔐 Security Best Practices

```javascript
// 1. Never store real card details in database
// 2. Always use HTTPS for payment requests
// 3. Validate payment on server side
// 4. Hash sensitive information
// 5. Implement rate limiting on payment endpoints
// 6. Log payment attempts for audit
// 7. Use environment variables for API keys

// Example with error handling
async function processPayment(bookingId, paymentMethod) {
  try {
    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    // Check not already paid
    if (booking.paymentStatus === 'paid') {
      throw new Error('Booking already paid');
    }

    // Process payment based on method
    const paymentResult = await processPaymentByMethod(
      paymentMethod,
      booking.totalAmount
    );

    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }

    // Update booking
    booking.paymentStatus = 'paid';
    booking.transactionId = paymentResult.transactionId;
    await booking.save();

    return booking;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}
```

