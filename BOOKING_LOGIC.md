# 🎫 Booking Logic Implementation Guide

## 📊 Booking Flow Diagram

```
┌─────────────────┐
│  Select Movie   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Showtime │◄─── Fetch from DB
└────────┬────────┘     (date, time, theater)
         │
         ▼
┌──────────────────────────────┐
│ Display Seat Layout          │◄─── Fetch occupied seats
│ (Show occupied/available)    │     from API
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ User Selects Seats           │
│ (Lock seats for 5-10 mins)   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Calculate Total Price        │◄─── Sum of (seat_type * quantity)
│ standard: 100K               │
│ VIP: 150K                    │
│ Couple: 200K                 │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Payment Step                 │
│ - Select payment method      │
│ - Enter customer info        │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Confirm & Submit Booking     │
│ POST /bookings               │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Payment Processing           │◄─── Simulate/Mock payment
│ POST /bookings/:id/payment   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Generate QR Code             │
│ Show Success Page            │
└──────────────────────────────┘
```

---

## 💾 Booking Context Implementation

File: `src/contexts/BookingContext.jsx`

```javascript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { bookingAPI } from '../services/apiServices';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();

  // Current booking in progress
  const [currentBooking, setCurrentBooking] = useState(null);
  
  // Selected seats with prices
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Occupied seats from server
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch occupied seats for a showtime
  const fetchOccupiedSeats = useCallback(async (showtimeId) => {
    try {
      setLoading(true);
      const response = await bookingAPI.getOccupiedSeats(showtimeId);
      setOccupiedSeats(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching occupied seats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add seat to selection
  const addSeat = useCallback((seat) => {
    // Check if already selected
    if (selectedSeats.find(s => s.seatNumber === seat.seatNumber)) {
      return;
    }

    // Check if occupied
    if (occupiedSeats.includes(seat.seatNumber)) {
      setError('Ghế này đã được đặt');
      return;
    }

    setSelectedSeats(prev => [...prev, seat]);
    setError(null);
  }, [selectedSeats, occupiedSeats]);

  // Remove seat from selection
  const removeSeat = useCallback((seatNumber) => {
    setSelectedSeats(prev => 
      prev.filter(s => s.seatNumber !== seatNumber)
    );
  }, []);

  // Clear all selected seats
  const clearSeats = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  }, [selectedSeats]);

  // Create booking
  const createBooking = useCallback(async (showtimeId, paymentMethod, customerInfo) => {
    if (selectedSeats.length === 0) {
      setError('Vui lòng chọn ít nhất một ghế');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await bookingAPI.create({
        showtimeId,
        seats: selectedSeats,
        paymentMethod,
        customerInfo
      });

      setCurrentBooking(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Lỗi khi đặt vé');
      console.error('Booking error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedSeats]);

  // Confirm payment
  const confirmPayment = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      const response = await bookingAPI.simulatePaymentSuccess(bookingId);
      setCurrentBooking(response.data);
      return response.data;
    } catch (err) {
      setError('Lỗi khi xử lý thanh toán');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      await bookingAPI.cancelBooking(bookingId);
      setCurrentBooking(null);
      setSelectedSeats([]);
    } catch (err) {
      setError('Lỗi khi hủy vé');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    currentBooking,
    selectedSeats,
    occupiedSeats,
    loading,
    error,

    // Methods
    fetchOccupiedSeats,
    addSeat,
    removeSeat,
    clearSeats,
    calculateTotalPrice,
    createBooking,
    confirmPayment,
    cancelBooking,

    // Computed
    totalPrice: calculateTotalPrice(),
    seatCount: selectedSeats.length
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
```

---

## 🪑 Seat Component Implementation

File: `src/components/SeatLayout/Seat.jsx`

```javascript
import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import './Seat.css';

export default function Seat({ seatNumber, type, price, showtime }) {
  const { selectedSeats, occupiedSeats, addSeat, removeSeat } = useBooking();

  const isOccupied = occupiedSeats.includes(seatNumber);
  const isSelected = selectedSeats.some(s => s.seatNumber === seatNumber);

  const handleClick = () => {
    if (isOccupied) return; // Can't select occupied

    if (isSelected) {
      removeSeat(seatNumber);
    } else {
      addSeat({ seatNumber, type, price });
    }
  };

  return (
    <button
      className={`seat seat-${type} ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
      onClick={handleClick}
      disabled={isOccupied}
      title={`${seatNumber} - ${type} - ${price.toLocaleString()}đ`}
    >
      {seatNumber.replace(/(\d+)/, '')}
      {seatNumber.replace(/\D+/, '')}
    </button>
  );
}
```

---

## 💵 Price Calculation Logic

```javascript
// Pricing by seat type
const SEAT_PRICES = {
  standard: 100000,    // 100K VND
  vip: 150000,         // 150K VND
  couple: 200000       // 200K VND
};

// Calculate total price
function calculateTotal(selectedSeats) {
  return selectedSeats.reduce((total, seat) => {
    const price = SEAT_PRICES[seat.type] || 0;
    return total + price;
  }, 0);
}

// Example
const booking = [
  { seatNumber: 'A1', type: 'standard', price: 100000 },
  { seatNumber: 'A2', type: 'standard', price: 100000 },
  { seatNumber: 'B5', type: 'vip', price: 150000 }
];

const totalPrice = calculateTotal(booking);
console.log(totalPrice); // 350000

// Format currency
function formatPrice(price) {
  return price.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
}

console.log(formatPrice(totalPrice)); // 350.000đ
```

---

## 🔒 Lock Seats Mechanism

```javascript
// Backend: Lock seats for 10 minutes
const LOCK_DURATION = 10 * 60 * 1000; // 10 minutes

// When user starts selecting seats
function startSeatSelection(showtimeId) {
  const lockExpiresAt = new Date(Date.now() + LOCK_DURATION);
  
  // Store in database or session
  sessionStorage.setItem(`booking_${showtimeId}`, JSON.stringify({
    selectedSeats: [],
    lockedUntil: lockExpiresAt.toISOString()
  }));
}

// Check if lock expired
function isLockExpired(showtimeId) {
  const booking = JSON.parse(
    sessionStorage.getItem(`booking_${showtimeId}`) || '{}'
  );
  
  if (!booking.lockedUntil) return true;
  
  return new Date() > new Date(booking.lockedUntil);
}

// Validate before creating booking
async function validateBooking(showtimeId, selectedSeats) {
  // 1. Check lock not expired
  if (isLockExpired(showtimeId)) {
    throw new Error('Hạn chọn ghế đã hết. Vui lòng chọn lại');
  }

  // 2. Re-fetch occupied seats from server
  const occupiedSeats = await bookingAPI.getOccupiedSeats(showtimeId);
  
  // 3. Validate selected seats not occupied
  const hasConflict = selectedSeats.some(seat =>
    occupiedSeats.includes(seat.seatNumber)
  );
  
  if (hasConflict) {
    throw new Error('Một số ghế đã được đặt bởi người khác');
  }

  return true;
}
```

---

## 📝 Complete Booking Step Component

File: `src/pages/SeatLayout.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { showtimeAPI, bookingAPI } from '@/services/apiServices';
import SeatMap from '@/components/SeatLayout/SeatMap';
import PaymentStep from '@/components/SeatLayout/PaymentStep';
import ConfirmationStep from '@/components/SeatLayout/ConfirmationStep';
import { useParams, useNavigate } from 'react-router-dom';

const STEPS = {
  SEAT_SELECTION: 1,
  PAYMENT: 2,
  CONFIRMATION: 3
};

export default function SeatLayout() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedSeats,
    occupiedSeats,
    totalPrice,
    fetchOccupiedSeats,
    createBooking,
    clearSeats
  } = useBooking();

  const [step, setStep] = useState(STEPS.SEAT_SELECTION);
  const [showtime, setShowtime] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch showtime and occupied seats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await showtimeAPI.getById(showtimeId);
        setShowtime(response.data);
        await fetchOccupiedSeats(showtimeId);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId, fetchOccupiedSeats]);

  // Handle next step
  const handleNextStep = async () => {
    if (step === STEPS.SEAT_SELECTION) {
      if (selectedSeats.length === 0) {
        alert('Vui lòng chọn ít nhất một ghế');
        return;
      }
      setStep(STEPS.PAYMENT);
    } else if (step === STEPS.PAYMENT) {
      // Create booking
      const booking = await createBooking(showtimeId, paymentMethod, customerInfo);
      if (booking) {
        setBookingId(booking._id);
        setStep(STEPS.CONFIRMATION);
      }
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (step > STEPS.SEAT_SELECTION) {
      setStep(step - 1);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    clearSeats();
    navigate('/movies');
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>{showtime?.movieId?.title}</h1>
        <p>{showtime?.date} - {showtime?.time}</p>
      </div>

      {step === STEPS.SEAT_SELECTION && (
        <>
          <SeatMap showtime={showtime} occupiedSeats={occupiedSeats} />
          
          <div className="booking-summary">
            <div className="selected-seats">
              <h3>Ghế đã chọn ({selectedSeats.length}):</h3>
              {selectedSeats.map(seat => (
                <span key={seat.seatNumber} className="seat-badge">
                  {seat.seatNumber} ({seat.type})
                </span>
              ))}
            </div>

            <div className="price-summary">
              <h3>Tổng cộng: {totalPrice.toLocaleString('vi-VN')}đ</h3>
            </div>
          </div>

          <div className="booking-actions">
            <button onClick={handleCancel} className="btn-cancel">Hủy</button>
            <button onClick={handleNextStep} className="btn-next">Tiếp tục</button>
          </div>
        </>
      )}

      {step === STEPS.PAYMENT && (
        <PaymentStep
          totalPrice={totalPrice}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          onNext={handleNextStep}
          onPrev={handlePreviousStep}
        />
      )}

      {step === STEPS.CONFIRMATION && (
        <ConfirmationStep
          bookingId={bookingId}
          totalPrice={totalPrice}
          selectedSeats={selectedSeats}
        />
      )}
    </div>
  );
}
```

---

## ✅ Validation Checklist

- [ ] Selected seats are not occupied
- [ ] Price calculation is correct
- [ ] Customer info is provided
- [ ] Payment method is selected
- [ ] Booking is created successfully
- [ ] QR code is generated
- [ ] Seats are locked during transaction
- [ ] User can view their bookings after

