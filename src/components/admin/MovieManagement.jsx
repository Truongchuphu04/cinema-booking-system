import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Star, Calendar, Clock } from 'lucide-react';
import { useMovies } from '../../contexts/MovieContext';

const MovieManagement = () => {
  const { movies, addMovie, updateMovie, deleteMovie } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  
  // Debug: Log movies data to check structure
  console.log('🎬 Movies data structure:', movies);
  if (movies.length > 0) {
    console.log('🎬 First movie fields:', Object.keys(movies[0]));
    console.log('🎬 First movie data:', movies[0]);
  }
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    duration: '',
    rating: '',
    releaseDate: '',
    status: 'showing',
    poster: '',
    backdrop_path: '',
    overview: ''
  });

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'showing':
        return 'bg-green-500/20 text-green-400';
      case 'upcoming':
      case 'coming-soon':
      case 'coming_soon':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'ended':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'showing':
        return 'Đang chiếu';
      case 'upcoming':
      case 'coming-soon':
      case 'coming_soon':
        return 'Sắp chiếu';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingMovie) {
      // Map frontend status to backend enum values
      const statusMapping = {
        'showing': 'showing',
        'coming-soon': 'coming_soon', 
        'ended': 'ended'
      };

      const movieData = {
        title: formData.title,
        overview: formData.overview || 'Chưa có mô tả',
        release_date: new Date(formData.releaseDate).toISOString(),
        runtime: parseInt(formData.duration) || 0,
        duration: parseInt(formData.duration) || 0,
        genre: formData.genre,
        rating: parseFloat(formData.rating) || 0,
        vote_average: parseFloat(formData.rating) || 0,
        status: statusMapping[formData.status] || 'showing',
        poster: formData.poster || '/placeholder-poster.svg',
        backdrop_path: formData.backdrop_path || '/placeholder-backdrop.svg',
        language: 'en', // Use supported language code
        original_language: 'en'
      };
      updateMovie(editingMovie.id, movieData);
      setEditingMovie(null);
    } else {
      // Validate required fields
      if (!formData.title || !formData.genre || !formData.duration || !formData.releaseDate) {
        alert('Vui lòng điền đầy đủ thông tin: Tên phim, Thể loại, Thời lượng, Ngày khởi chiếu');
        return;
      }

      // Map frontend status to backend enum values
      const statusMapping = {
        'showing': 'showing',
        'coming-soon': 'coming_soon', 
        'ended': 'ended'
      };

      const movieData = {
        title: formData.title,
        overview: formData.overview || 'Chưa có mô tả',
        release_date: new Date(formData.releaseDate).toISOString(),
        runtime: parseInt(formData.duration) || 0,
        duration: parseInt(formData.duration) || 0,
        genre: formData.genre,
        rating: parseFloat(formData.rating) || 0,
        vote_average: parseFloat(formData.rating) || 0,
        status: statusMapping[formData.status] || 'showing',
        poster: formData.poster || '/placeholder-poster.svg',
        backdrop_path: formData.backdrop_path || '/placeholder-backdrop.svg',
        language: 'en', // Use supported language code
        original_language: 'en'
      };
      console.log('🎬 Form data being sent:', movieData);
      
      // Test API connection first
      try {
        const testResponse = await fetch('http://localhost:5000/api/movies/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movieData)
        });
        const testResult = await testResponse.json();
        console.log('🧪 Test API response:', testResult);
      } catch (testError) {
        console.log('🧪 Test API failed:', testError);
      }
      
      addMovie(movieData);
    }
    setFormData({
      title: '',
      genre: '',
      duration: '',
      rating: '',
      releaseDate: '',
      status: 'showing',
      poster: '',
      backdrop_path: '',
      overview: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    // Chuyển đổi ISO date string về format yyyy-MM-dd cho input date
    const formatDateForInput = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toISOString().split('T')[0];
    };

    setFormData({
      title: movie.title || '',
      genre: movie.genre || '',
      duration: movie.duration?.toString() || '',
      rating: movie.rating?.toString() || '',
      releaseDate: formatDateForInput(movie.release_date),
      status: movie.status || 'showing',
      poster: movie.poster || '',
      backdrop_path: movie.backdrop_path || '',
      overview: movie.overview || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (movieId) => {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      deleteMovie(movieId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý phim</h1>
          <p className="text-gray-400">Quản lý danh sách phim và thông tin chiếu</p>
        </div>
        <button 
          onClick={() => {
            setEditingMovie(null);
            setFormData({
              title: '',
              genre: '',
              duration: '',
              rating: '',
              releaseDate: '',
              status: 'showing',
              poster: '',
              backdrop_path: '',
              overview: ''
            });
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm phim mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phim hoặc thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <select className="px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500">
            <option value="">Tất cả trạng thái</option>
            <option value="showing">Đang chiếu</option>
            <option value="coming-soon">Sắp chiếu</option>
            <option value="ended">Đã kết thúc</option>
          </select>
          <select className="px-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500">
            <option value="">Tất cả thể loại</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            <option value="horror">Horror</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <div key={movie.id} className="glass-card rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all duration-200">
            {/* Movie Poster */}
            <div className="relative aspect-[2/3] bg-slate-800">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-poster.svg';
                }}
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movie.status)}`}>
                  {getStatusText(movie.status)}
                </span>
              </div>
            </div>

            {/* Movie Info */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{movie.title}</h3>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-400 text-sm">{movie.genre}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {movie.duration} phút
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {movie.rating}
                  </div>
                </div>

                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {(() => {
                    // Debug: Check what date fields are available
                    console.log('🎬 Movie date fields for', movie.title, ':', {
                      release_date: movie.release_date,
                      releaseDate: movie.releaseDate,
                      release_Date: movie.release_Date,
                      status: movie.status
                    });
                    
                    // Try different possible date field names
                    const releaseDate = movie.release_date || movie.releaseDate || movie.release_Date || movie.releasedate;
                    
                    if (releaseDate) {
                      try {
                        return new Date(releaseDate).toLocaleDateString('vi-VN');
                      } catch (error) {
                        console.log('🎬 Date parsing error:', error);
                        return 'Ngày không hợp lệ';
                      }
                    }
                    
                    // If it's an upcoming movie but no date, show appropriate message
                    if (movie.status === 'upcoming' || movie.status === 'coming-soon' || movie.status === 'coming_soon') {
                      return 'Sắp chiếu';
                    }
                    
                    return 'Chưa cập nhật';
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="flex-1 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition-colors">
                  <Eye className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={() => handleEdit(movie)}
                  className="flex-1 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={() => handleDelete(movie.id)}
                  className="flex-1 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Movie Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingMovie ? 'Sửa phim' : 'Thêm phim mới'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Tên phim *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Thể loại</label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      placeholder="Action, Drama, Sci-Fi"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Thời lượng (phút)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Đánh giá (1-10)</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      step="0.1"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Ngày khởi chiếu</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Trạng thái</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="showing">Đang chiếu</option>
                      <option value="coming-soon">Sắp chiếu</option>
                      <option value="ended">Đã kết thúc</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white mb-2">URL Poster</label>
                  <input
                    type="url"
                    name="poster"
                    value={formData.poster}
                    onChange={handleInputChange}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">URL Background</label>
                  <input
                    type="url"
                    name="backdrop_path"
                    value={formData.backdrop_path}
                    onChange={handleInputChange}
                    placeholder="https://example.com/backdrop.jpg"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">Mô tả</label>
                  <textarea
                    name="overview"
                    value={formData.overview}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  ></textarea>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200"
                  >
                    {editingMovie ? 'Cập nhật' : 'Thêm phim'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManagement;