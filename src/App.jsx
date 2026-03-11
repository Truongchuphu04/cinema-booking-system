import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatLayout from './pages/SeatLayout';
import MyBooking from './pages/MyBooking';
import Favorite from './pages/Favorite';
import Movies from './pages/Movies';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountInfo from './pages/AccountInfo';
import ChangePassword from './pages/ChangePassword';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Favorites from './pages/Favorite';
import Releases from './pages/Releases';
import Theaters from './pages/Theaters';
import PaymentMockup from './pages/PaymentMockup';
import BookingSuccess from './pages/BookingSuccess';
import BookingFailed from './pages/BookingFailed';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { MovieProvider } from './contexts/MovieContext';
import { ShowtimeProvider } from './contexts/ShowtimeContext';
import { TheaterProvider } from './contexts/TheaterContext';
import { BookingProvider } from './contexts/BookingContext';
import { UserProvider } from './contexts/UserContext';
import { AdminBookingProvider } from './contexts/AdminBookingContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { Loader2 } from 'lucide-react';

// Admin imports
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWelcome from './components/admin/AdminWelcome';
import UserManagement from './components/admin/UserManagement';
import MovieManagement from './components/admin/MovieManagement';
import ShowtimeManagement from './components/admin/ShowtimeManagement';
import TheaterManagement from './components/admin/TheaterManagement';
import BookingManagement from './components/admin/BookingManagement';
import Analytics from './components/admin/Analytics';
import SystemSettings from './components/admin/SystemSettings';

const AppContent = () => {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetail />} />
        <Route path="/movies/book/:movieId/:showId" element={
          <ProtectedRoute>
            <SeatLayout />
          </ProtectedRoute>
        } />    
        <Route path='/my-booking' element={
          <ProtectedRoute>
            <MyBooking />
          </ProtectedRoute>
        } />
        <Route path='/history' element={
          <ProtectedRoute>
            <MyBooking />
          </ProtectedRoute>
        } />
        <Route path='/account/info' element={
          <ProtectedRoute>
            <AccountInfo />
          </ProtectedRoute>
        } />
        <Route path='/account/change-password' element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path='/favorites' element={
          <ProtectedRoute>
            <Favorites/>
          </ProtectedRoute>
        } />
        <Route path='/releases' element={<Releases/>} />
        <Route path='/theaters' element={<Theaters/>} />
        <Route path='/payment-mockup' element={
          <ProtectedRoute>
            <PaymentMockup />
          </ProtectedRoute>
        } />
        <Route path='/booking-success' element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        } />
        <Route path='/booking-failed' element={
          <ProtectedRoute>
            <BookingFailed />
          </ProtectedRoute>
        } />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        
        {/* Admin Routes */}
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/admin' element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }>
          <Route index element={<AdminWelcome />} />
          <Route path='users' element={<UserManagement />} />
          <Route path='movies' element={<MovieManagement />} />
          <Route path='showtimes' element={<ShowtimeManagement />} />
          <Route path='theaters' element={<TheaterManagement />} />
          <Route path='bookings' element={<BookingManagement />} />
          <Route path='analytics' element={<Analytics />} />
          <Route path='settings' element={<SystemSettings />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <UserProvider>
            <MovieProvider>
              <ShowtimeProvider>
                <TheaterProvider>
                  <BookingProvider>
                    <AdminBookingProvider>
                      <AppContent />
                    </AdminBookingProvider>
                  </BookingProvider>
                </TheaterProvider>
              </ShowtimeProvider>
            </MovieProvider>
          </UserProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
