import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Ticket, Loader2, Search, X } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../contexts/MovieContext';
import { useTheater } from '../contexts/TheaterContext';


const Theaters = () => {
  const navigate = useNavigate();
  const { movies, loading: moviesLoading } = useMovies();
  const { theaters, loading: theatersLoading, getTheaters, searchTheaters } = useTheater();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTheaters, setFilteredTheaters] = useState([]);

  // Load theaters on component mount
  useEffect(() => {
    getTheaters().catch(() => {
      console.log('Backend not available for theaters');
    });
  }, []);

  // Update filtered theaters when theaters data changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTheaters((theaters || []).filter(theater => theater && theater.status === 'active'));
    }
  }, [theaters, searchQuery]);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchTheaters(query);
    } else {
      await getTheaters();
    }
  };

  const loading = theatersLoading || moviesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <h2 className="text-white text-xl font-semibold mb-2">Đang tải danh sách rạp...</h2>
              <p className="text-gray-400">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Rạp Chiếu Phim
            </h1>
          </div>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Khám phá các rạp chiếu phim gần bạn với lịch chiếu mới nhất và tiện ích hiện đại
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>{(theaters || []).filter(t => t.status === 'active').length} rạp hoạt động</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Cập nhật hàng ngày</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm rạp theo tên hoặc vị trí..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  getTheaters();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Theaters Grid */}
        {filteredTheaters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {filteredTheaters.map((theater) => (
              <div
                key={theater._id}
                className="flex flex-col bg-gradient-to-b from-gray-900/90 to-black/90 rounded-2xl border border-white/10 p-5 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Ảnh hoặc Placeholder */}
                <div className="relative w-full h-44 bg-gray-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <div className="text-gray-500 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Rạp {theater?.name}</p>
                  </div>
                </div>

                {/* Tên và Địa chỉ */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white text-center mb-2">
                    {theater.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 text-center flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4 text-green-500" />
                    {theater?.location?.district && theater?.location?.city
                      ? `${theater.location.district}, ${theater.location.city}`
                      : theater.address || 'Địa chỉ chưa cập nhật'}
                  </p>

                  {/* Thông tin cơ bản */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sức chứa:</span>
                      <span className="text-white font-semibold">
                        {theater.capacity || 0} ghế
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số phòng:</span>
                      <span className="text-white font-semibold">
                        {theater.rooms?.length || 0} phòng
                      </span>
                    </div>
                  </div>

                  {/* Tiện ích */}
                  {theater.facilities?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Tiện ích:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {theater.facilities.slice(0, 3).map((facility, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full"
                          >
                            {facility}
                          </span>
                        ))}
                        {theater.facilities.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-600/30 text-gray-400 text-xs rounded-full">
                            +{theater.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phòng chiếu */}
                  {theater.rooms?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">Phòng chiếu:</p>
                      <div className="space-y-1">
                        {theater.rooms.slice(0, 2).map((room, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-gray-300 flex items-center gap-2"
                          >
                            <Clock className="w-3 h-3 text-blue-500" />
                            {room.name}: {room.capacity} ghế ({room.type})
                          </p>
                        ))}
                        {theater.rooms.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{theater.rooms.length - 2} phòng khác
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Nút hành động */}
                <button
                  onClick={() => navigate(`/theaters/${theater._id}`)}
                  className="mt-5 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" /> Xem Chi Tiết
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-4">Không tìm thấy rạp</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Không có rạp nào phù hợp với tiêu chí tìm kiếm. Hãy thử điều chỉnh từ khóa.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-300"
            >
              Xem danh sách phim
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Theaters;