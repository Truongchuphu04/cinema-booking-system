import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { Search, Grid3X3, List, Star, Loader2, X, Heart, User } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filteredFavorites, setFilteredFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const loadFavorites = () => {
      // Sử dụng userId để tạo key riêng cho mỗi user
      const userFavoritesKey = `yeuThichPhim_${user._id || user.id}`;
      let storedFavorites = JSON.parse(localStorage.getItem(userFavoritesKey)) || [];
      
      // Migration: nếu chưa có dữ liệu cho user này, check dữ liệu cũ
      if (storedFavorites.length === 0) {
        const oldFavorites = JSON.parse(localStorage.getItem('yeuThichPhim')) || [];
        if (oldFavorites.length > 0) {
          // Di chuyển dữ liệu cũ sang user hiện tại
          localStorage.setItem(userFavoritesKey, JSON.stringify(oldFavorites));
          // Xóa dữ liệu cũ
          localStorage.removeItem('yeuThichPhim');
          storedFavorites = oldFavorites;
        }
      }
      
      setFavorites(storedFavorites);
    };
    
    loadFavorites();
    setLoading(false);
    
    // Listen for localStorage changes (when favorites are updated from other pages)
    const handleStorageChange = (e) => {
      const userFavoritesKey = `yeuThichPhim_${user._id || user.id}`;
      if (e.key === userFavoritesKey) {
        loadFavorites();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [user]);

  // Filter favorites based on search query
  useEffect(() => {
    let result = [...favorites];
    if (searchQuery) {
      result = result.filter(movie =>
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredFavorites(result);
  }, [favorites, searchQuery]);

  // Handle remove from favorites
  const handleRemoveFavorite = (movieId) => {
    if (!user) return;
    
    const newFavorites = favorites.filter(movie => movie._id !== movieId);
    setFavorites(newFavorites);
    
    // Sử dụng userId để tạo key riêng cho mỗi user
    const userFavoritesKey = `yeuThichPhim_${user._id || user.id}`;
    localStorage.setItem(userFavoritesKey, JSON.stringify(newFavorites));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <h2 className="text-white text-xl font-semibold mb-2">Đang tải danh sách yêu thích...</h2>
              <p className="text-gray-400">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 px-4">
        <BlurCircle top="100px" left="0" />
        <BlurCircle bottom="100px" right="0" />
        
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Bạn cần đăng nhập để xem danh sách phim yêu thích của mình.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-300"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-300"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 px-4">
        <BlurCircle top="100px" left="0" />
        <BlurCircle bottom="100px" right="0" />
        
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Chưa có phim yêu thích</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Bạn chưa thêm phim nào vào danh sách yêu thích. Hãy khám phá và thêm phim từ trang danh sách!
          </p>
          <button
            onClick={() => navigate('/movies')}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-300"
          >
            Khám phá phim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <BlurCircle top="100px" left="0" />
      <BlurCircle bottom="100px" right="0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
            Phim Yêu Thích
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Danh sách các bộ phim bạn đã thêm vào yêu thích. Quản lý và xem chi tiết ngay!
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>{favorites.length} phim yêu thích</span>
            </div>
          </div>
        </div>

        {/* Search and View Mode */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phim yêu thích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white/10 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* View Mode */}
            <div className="flex-shrink-0">
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors duration-300 ${
                    viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors duration-300 ${
                    viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Grid/List */}
        {filteredFavorites.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4'}
            mb-12
          `}>
            {filteredFavorites.map((movie) => (
              <div key={movie._id} className={viewMode === 'list' ? 'transform transition-all duration-300 hover:scale-[1.02]' : ''}>
                <MovieCard
                  movie={movie}
                  viewMode={viewMode}
                  onRemove={() => handleRemoveFavorite(movie._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-4">Không tìm thấy phim yêu thích</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Không có phim nào phù hợp với tiêu chí tìm kiếm. Hãy thử lại hoặc thêm phim mới.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-300"
            >
              Thêm phim yêu thích
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 