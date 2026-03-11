import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeatBooking } from '../hooks/useSeatBooking';
import { useBookings } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import BlurCircle from '../components/BlurCircle';
import BookingHeader from '../components/SeatLayout/BookingHeader';
import SeatMap from '../components/SeatLayout/SeatMap';
import BookingSidebar from '../components/SeatLayout/BookingSidebar';
import LoadingScreen from '../components/SeatLayout/LoadingScreen';
import ErrorScreen from '../components/SeatLayout/ErrorScreen';
import SuccessScreen from '../components/SeatLayout/SuccessScreen';
import ConfirmationStep from '../components/SeatLayout/ConfirmationStep';
import PaymentStep from '../components/SeatLayout/PaymentStep';

const SeatLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking, loading: bookingLoading } = useBookings();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [bookingError, setBookingError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  
  const {
    movie,
    showDetails,
    selectedSeats,
    setSelectedSeats,
    occupiedSeats,
    setOccupiedSeats,
    loading,
    bookingStep,
    setBookingStep,
    error
  } = useSeatBooking();

  const handleSeatClick = (seatId, row) => {
    if (occupiedSeats[seatId]) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(seat => seat !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert('Bạn chỉ có thể chọn tối đa 8 ghế trong một lần đặt');
        return;
      }
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }
    setBookingStep('confirm');
  };

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setBookingStep('processing');
      setBookingError(null);

      // Prepare booking data
      const seatData = selectedSeats.map(seatId => {
        const row = seatId.charAt(0);
        const seatType = getSeatType(row);
        const price = getSeatPrice(seatType, showDetails?.price || 100000);
        
        return {
          seatNumber: seatId,
          type: seatType,
          price: price
        };
      });

      const totalAmount = seatData.reduce((sum, seat) => sum + seat.price, 0);

      const bookingData = {
        showtimeId: showDetails._id,
        seats: seatData,
        totalAmount,
        paymentMethod,
        customerInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      };

      console.log('🎫 Creating booking with data:', bookingData);

      // Create booking via API
      const newBooking = await addBooking(bookingData);
      setCreatedBooking(newBooking);
      
      console.log('✅ Booking created successfully:', newBooking);
      
      // Redirect to payment mockup page
      navigate(`/payment-mockup?bookingId=${newBooking._id}`);

    } catch (error) {
      console.error('❌ Booking failed:', error);
      setBookingError(error.message || 'Có lỗi xảy ra khi đặt vé');
      setBookingStep('confirm');
    }
  };

  // Helper functions for seat pricing
  const getSeatType = (row) => {
    if (['A', 'B'].includes(row)) return 'standard';
    if (['C', 'D', 'E', 'F'].includes(row)) return 'standard';
    if (['G', 'H'].includes(row)) return 'vip';
    if (['I', 'J'].includes(row)) return 'couple';
    return 'standard';
  };

  const getSeatPrice = (seatType, basePrice = 100000) => {
    const multipliers = {
      standard: 1,
      vip: 1.3,
      couple: 1.5
    };
    return Math.round(basePrice * (multipliers[seatType] || 1));
  };

  const handlePaymentOld = () => {
    setBookingStep('payment');
    setTimeout(() => {
      setBookingStep('success');
      const newOccupied = { ...occupiedSeats };
      selectedSeats.forEach(seat => {
        newOccupied[seat] = 'current_user';
      });
      setOccupiedSeats(newOccupied);
    }, 3000);
  };

  const handleBackToMovies = () => {
    navigate('/movies');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Error state
  if (!movie || !showDetails) {
    return (
      <ErrorScreen 
        onBack={handleBackToMovies}
        onRetry={handleRetry}
      />
    );
  }

  // Success state
  if (bookingStep === 'success') {
    return (
      <SuccessScreen
        movie={movie}
        showDetails={showDetails}
        selectedSeats={selectedSeats}
        booking={createdBooking}
        onBackToMovies={handleBackToMovies}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <BlurCircle top="100px" left="0" />
      <BlurCircle bottom="100px" right="0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingHeader 
          movie={movie}
          showDetails={showDetails}
          onBack={() => navigate(`/movies/${movie._id}`)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              {bookingStep === 'select' && (
                <SeatMap
                  selectedSeats={selectedSeats}
                  occupiedSeats={occupiedSeats}
                  basePrice={showDetails.price}
                  totalSeats={showDetails?.totalSeats || 120}
                  onSeatClick={handleSeatClick}
                />
              )}
              {bookingStep === 'confirm' && (
                <ConfirmationStep
                  movie={movie}
                  showDetails={showDetails}
                  selectedSeats={selectedSeats}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  error={bookingError}
                />
              )}
              {(bookingStep === 'payment' || bookingStep === 'processing') && (
                <PaymentStep 
                  paymentMethod={paymentMethod}
                  loading={bookingLoading}
                  step={bookingStep}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <BookingSidebar
              movie={movie}
              showDetails={showDetails}
              selectedSeats={selectedSeats}
              bookingStep={bookingStep}
              loading={bookingLoading}
              error={bookingError}
              onContinue={handleContinue}
              onPayment={handlePayment}
              onBack={() => setBookingStep('select')}
              getSeatPrice={getSeatPrice}
              getSeatType={getSeatType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;