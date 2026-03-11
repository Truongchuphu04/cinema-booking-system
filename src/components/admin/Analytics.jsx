import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Eye, BarChart3, Calendar } from 'lucide-react';
import { useAdminBookings } from '../../contexts/AdminBookingContext';
import { useMovies } from '../../contexts/MovieContext';
import { useShowtimes } from '../../contexts/ShowtimeContext';
import { useUsers } from '../../contexts/UserContext';

const Analytics = () => {
  const { bookings, bookingStats } = useAdminBookings();
  const { movies } = useMovies();
  const { showtimes } = useShowtimes();
  const { getUserStats } = useUsers();

  // Calculate real analytics data
  const analyticsData = useMemo(() => {
    const paidBookings = (bookings || []).filter(b => b.paymentStatus === 'paid');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's data
    const todayBookings = paidBookings.filter(b => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= today;
    });
    
    // This month's data
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthBookings = paidBookings.filter(b => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate >= thisMonth;
    });
    
    // Calculate totals
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const todayTickets = todayBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
    const monthCustomers = new Set(monthBookings.map(b => b.userId || b.customerInfo?.email)).size;
    
    // Today's showtimes
    const todayShowtimes = (showtimes || []).filter(showtime => {
      const showtimeDate = new Date(showtime.date || showtime.datetime);
      return showtimeDate.toDateString() === new Date().toDateString();
    });
    
    return {
      monthRevenue,
      monthCustomers,
      todayTickets,
      todayShowtimes: todayShowtimes.length,
      todayRevenue
    };
  }, [bookings, showtimes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
        <p className="text-gray-400">Thống kê và báo cáo hoạt động rạp phim</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Tháng này</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND',
              notation: 'compact'
            }).format(analyticsData.monthRevenue)}
          </h3>
          <p className="text-gray-400 text-sm">Doanh thu tháng này</p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Khách hàng</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {analyticsData.monthCustomers.toLocaleString('vi-VN')}
          </h3>
          <p className="text-gray-400 text-sm">Lượt khách tháng này</p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Hôm nay</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {analyticsData.todayTickets.toLocaleString('vi-VN')}
          </h3>
          <p className="text-gray-400 text-sm">Vé đã bán hôm nay</p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Đang chiếu</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {analyticsData.todayShowtimes}
          </h3>
          <p className="text-gray-400 text-sm">Suất chiếu hôm nay</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Doanh thu 7 ngày gần đây</h2>
          <div className="h-64">
            {useMemo(() => {
              const last7Days = [];
              const today = new Date();
              
              // Create data for last 7 days
              for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
                
                const dayBookings = (bookings || []).filter(b => {
                  const bookingDate = new Date(b.createdAt);
                  return b.paymentStatus === 'paid' && bookingDate >= date && bookingDate < nextDate;
                });
                
                const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                
                last7Days.push({
                  date: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
                  revenue: dayRevenue,
                  tickets: dayBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0)
                });
              }
              
              const maxRevenue = Math.max(...last7Days.map(d => d.revenue)) || 1;
              
              return (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-end justify-between space-x-2 mb-4">
                    {last7Days.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-md transition-all duration-300 min-h-[8px]"
                          style={{ 
                            height: `${Math.max((day.revenue / maxRevenue) * 180, 8)}px`
                          }}
                          title={`${day.date}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(day.revenue)}`}
                        ></div>
                        <div className="text-xs text-gray-400 mt-2 text-center">
                          <div>{day.date}</div>
                          <div className="text-cyan-400 font-medium">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND',
                              notation: 'compact'
                            }).format(day.revenue)}
                          </div>
                          <div className="text-gray-500">{day.tickets} vé</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }, [bookings])}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Top phim theo doanh thu</h2>
          <div className="space-y-4">
            {useMemo(() => {
              const movieRevenue = {};
              
              // Calculate revenue for each movie
              (bookings || [])
                .filter(b => b.paymentStatus === 'paid')
                .forEach(booking => {
                  const movieTitle = booking.movieId?.title || 'Phim không xác định';
                  if (!movieRevenue[movieTitle]) {
                    movieRevenue[movieTitle] = {
                      name: movieTitle,
                      revenue: 0,
                      tickets: 0
                    };
                  }
                  movieRevenue[movieTitle].revenue += booking.totalAmount || 0;
                  movieRevenue[movieTitle].tickets += booking.seats?.length || 0;
                });
              
              // Sort by revenue and get top 4
              const sortedMovies = Object.values(movieRevenue)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 4);
              
              const maxRevenue = sortedMovies[0]?.revenue || 1;
              
              return sortedMovies.map(movie => ({
                ...movie,
                percent: Math.round((movie.revenue / maxRevenue) * 100)
              }));
            }, [bookings]).map((movie, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white font-medium">{movie.name}</span>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        notation: 'compact'
                      }).format(movie.revenue)}
                    </div>
                    <div className="text-gray-500 text-xs">{movie.tickets} vé</div>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${movie.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;