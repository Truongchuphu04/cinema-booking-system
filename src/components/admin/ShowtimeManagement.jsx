import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Clock, Calendar, MapPin, DollarSign, 
  Copy, CheckCircle, XCircle, AlertCircle, Film, Home, Users,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useShowtimes } from '../../contexts/ShowtimeContext';
import { useMovies } from '../../contexts/MovieContext';
import { useTheaters } from '../../contexts/TheaterContext';

const ShowtimeManagement = () => {
  const { 
    showtimes, 
    loading, 
    error, 
    addShowtime, 
    updateShowtime, 
    deleteShowtime,
    getAvailableTimeSlots,
    copyShowtimes,
    setError
  } = useShowtimes();
  
  const { movies } = useMovies();
  const { theaters } = useTheaters();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Info, 2: Time Selection
  const [availableSlots, setAvailableSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [expandedShowtime, setExpandedShowtime] = useState(null);
  
  const [formData, setFormData] = useState({
    movieId: '',
    theaterId: '',
    roomId: '',
    date: '',
    time: '',
    price: '',
    totalSeats: ''
  });

  const [copyData, setCopyData] = useState({
    fromDate: '',
    toDate: '',
    theaterId: '',
    roomId: ''
  });

  // Reset form when closing
  const resetForm = () => {
    setFormData({
      movieId: '',
      theaterId: '',
      roomId: '',
      date: '',
      time: '',
      price: '',
      totalSeats: ''
    });
    setCurrentStep(1);
    setAvailableSlots(null);
    setEditingShowtime(null);
    setError(null);
  };

  // Get current movie
  const getCurrentMovie = () => {
    return movies.find(m => m._id === formData.movieId || m.id === formData.movieId);
  };

  // Generate available dates for selected movie
  const getAvailableDatesForMovie = () => {
    const movie = getCurrentMovie();
    if (!movie) return [];

    const dates = [];
    const today = new Date();
    const releaseDate = new Date(movie.release_date);
    
    // Start from today or release date, whichever is later
    const startDate = releaseDate > today ? releaseDate : today;
    
    // Generate next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('vi-VN', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  // Get suggested price based on movie rating and genre
  const getSuggestedPrice = (movieId) => {
    const movie = movies.find(m => (m._id || m.id) === movieId);
    if (!movie) return '';

    // Base price
    let price = 80000;

    // Adjust based on rating
    if (movie.rating >= 8) {
      price += 20000; // High-rated movies
    } else if (movie.rating >= 7) {
      price += 10000; // Good movies
    }

    // Adjust based on genre
    const genre = movie.genre?.toLowerCase() || '';
    if (genre.includes('action') || genre.includes('adventure')) {
      price += 10000;
    } else if (genre.includes('horror') || genre.includes('thriller')) {
      price += 5000;
    } else if (genre.includes('animation') || genre.includes('family')) {
      price -= 10000;
    }

    return price.toString();
  };

  // Get current theater
  const getCurrentTheater = () => {
    console.log('🔍 getCurrentTheater - looking for:', formData.theaterId, typeof formData.theaterId);
    console.log('🔍 Available theaters:', theaters.map(t => ({ _id: t._id, id: t.id, name: t.name })));
    
    const found = theaters.find(t => {
      // Handle different data types - theaterId có thể là object hoặc string
      const theaterIdValue = formData.theaterId?._id || formData.theaterId?.id || formData.theaterId;
      const tId = t._id || t.id;
      return tId && tId.toString() === theaterIdValue?.toString();
    });
    
    console.log('🔍 Found theater:', found?.name);
    return found;
  };

  // Get current room
  const getCurrentRoom = () => {
    const theater = getCurrentTheater();
    console.log('🔍 getCurrentRoom - looking for:', formData.roomId, typeof formData.roomId);
    console.log('🔍 Available rooms in theater:', theater?.rooms?.map(r => ({ _id: r._id, id: r.id, name: r.name })));
    
    const found = theater?.rooms?.find(r => {
      // Handle different data types - roomId có thể là object hoặc string
      const roomIdValue = formData.roomId?._id || formData.roomId?.id || formData.roomId;
      const rId = r._id || r.id;
      return rId && rId.toString() === roomIdValue?.toString();
    });
    
    console.log('🔍 Found room:', found?.name);
    return found;
  };

  // Get available rooms for selected theater
  const getAvailableRooms = () => {
    const theater = getCurrentTheater();
    return theater?.rooms || [];
  };

  // Load available time slots
  const loadAvailableSlots = async () => {
    if (!formData.movieId || !formData.theaterId || !formData.roomId || !formData.date) {
      return;
    }

    try {
      setSlotsLoading(true);
      const slots = await getAvailableTimeSlots(
        formData.theaterId,
        formData.roomId,
        formData.date,
        formData.movieId
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep === 1 && formData.movieId && formData.theaterId && formData.roomId && formData.date) {
      setCurrentStep(2);
      loadAvailableSlots();
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setAvailableSlots(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔄 handleInputChange: ${name} = ${value}`);
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('📝 Updated formData:', newData);
      return newData;
    });

    // Reset date selection when movie changes
    if (name === 'movieId') {
      setFormData(prev => ({
        ...prev,
        date: '',
        price: getSuggestedPrice(value), // Auto-suggest price based on movie
      }));
    }

    // Reset room selection when theater changes
    if (name === 'theaterId') {
      console.log('🏢 Theater changed, resetting roomId');
      setFormData(prev => {
        const resetData = { ...prev, roomId: '' };
        console.log('📝 After theater change:', resetData);
        return resetData;
      });
    }

    // Auto-set total seats when room changes
    if (name === 'roomId') {
      console.log('🎬 Room changed to:', value);
      const room = getAvailableRooms().find(r => (r._id || r.id) === value);
      console.log('🔍 Found room for capacity:', room);
      if (room) {
        setFormData(prev => {
          const updatedData = { ...prev, totalSeats: room.capacity.toString() };
          console.log('📝 After room change:', updatedData);
          return updatedData;
        });
      }
    }

    // Reset slots when key fields change
    if (['movieId', 'theaterId', 'roomId', 'date'].includes(name)) {
      setAvailableSlots(null);
      if (currentStep === 2) {
        setCurrentStep(1);
      }
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      time: slot.time
    }));
    // Clear error when user selects a valid time slot
    if (error && error.includes('trùng')) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔍 DEBUG: Log state ngay khi handleSubmit được gọi
    console.log('🚀 handleSubmit called with formData:', {
      movieId: formData.movieId,
      theaterId: formData.theaterId,
      roomId: formData.roomId,
      date: formData.date,
      time: formData.time,
      price: formData.price,
      totalSeats: formData.totalSeats
    });
    console.log('🏢 Selected theater details:', theaters.find(t => (t._id || t.id) === formData.theaterId));
    console.log('🎬 Selected room details:', theaters.find(t => (t._id || t.id) === formData.theaterId)?.rooms?.find(r => (r._id || r.id) === formData.roomId));
    
    try {
      // Validate required fields
      if (!formData.movieId || !formData.theaterId || !formData.roomId || 
          !formData.date || !formData.time || !formData.price || !formData.totalSeats) {
        alert('Vui lòng điền đầy đủ tất cả thông tin bắt buộc!');
        return;
      }

      const showtimeData = {
        movieId: formData.movieId,
        theaterId: formData.theaterId,
        roomId: formData.roomId,
        date: formData.date,
        time: formData.time,
        price: parseInt(formData.price),
        totalSeats: parseInt(formData.totalSeats)
      };

      // Debug logging - chi tiết hơn
      console.log('📝 Submitting showtime data:', showtimeData);
      console.log('📋 Original form data:', formData);
      console.log('🔍 Detailed data types:', {
        theaterId: { value: formData.theaterId, type: typeof formData.theaterId },
        roomId: { value: formData.roomId, type: typeof formData.roomId },
        selectedTheater: theaters.find(t => (t._id || t.id) === formData.theaterId),
        selectedRoom: theaters.find(t => (t._id || t.id) === formData.theaterId)?.rooms?.find(r => (r._id || r.id) === formData.roomId)
      });
      
      // 🚨 CRITICAL DEBUG: Kiểm tra roomId thực tế được gửi
      console.log('🚨 CRITICAL CHECK:');
      console.log('   - formData.roomId:', formData.roomId);
      console.log('   - showtimeData.roomId:', showtimeData.roomId);
      console.log('   - Are they the same?', formData.roomId === showtimeData.roomId);
      console.log('   - editingShowtime:', editingShowtime);
      console.log('   - Is this an edit operation?', !!editingShowtime);

      if (editingShowtime) {
        await updateShowtime(editingShowtime._id || editingShowtime.id, showtimeData);
      } else {
        await addShowtime(showtimeData);
      }
      
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving showtime:', error);
      
      // Handle different types of conflicts
      if (error.message.includes('Slot thời gian') || error.message.includes('đã được sử dụng')) {
        // Show specific conflict message
        setError(`⚠️ ${error.message}`);
        // Go back to step 2 to show available time slots
        setCurrentStep(2);
        loadAvailableSlots();
      } else if (error.conflict) {
        // General time conflict, go to time slot picker
        setCurrentStep(2);
        loadAvailableSlots();
      } else {
        // Other errors
        setError(`❌ ${error.message}`);
      }
    }
  };

  // Handle edit
  const handleEdit = (showtime) => {
    setEditingShowtime(showtime);
    setFormData({
      movieId: showtime.movieId?._id || showtime.movieId,
      theaterId: showtime.theaterId?._id || showtime.theaterId,
      roomId: showtime.roomId,
      date: showtime.date,
      time: showtime.time,
      price: showtime.price.toString(),
      totalSeats: showtime.totalSeats.toString()
    });
    setShowAddForm(true);
  };

  // Handle delete
  const handleDelete = async (showtimeId) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
      try {
        await deleteShowtime(showtimeId);
      } catch (error) {
        // Error is handled by context
        console.error('Error deleting showtime:', error);
      }
    }
  };

  // Handle copy showtimes
  const handleCopyShowtimes = async (e) => {
    e.preventDefault();
    
    try {
      const result = await copyShowtimes(
        copyData.fromDate,
        copyData.toDate,
        copyData.theaterId,
        copyData.roomId || null
      );
      
      alert(`Đã sao chép thành công ${result.copiedCount} lịch chiếu. ${result.conflictCount} lịch bị trùng.`);
      setShowCopyModal(false);
      setCopyData({ fromDate: '', toDate: '', theaterId: '', roomId: '' });
    } catch (error) {
      console.error('Error copying showtimes:', error);
    }
  };

  // Filter showtimes
  const filteredShowtimes = showtimes.filter(showtime => {
    const movie = movies.find(m => (m._id || m.id) === (showtime.movieId?._id || showtime.movieId));
    const theater = theaters.find(t => (t._id || t.id) === (showtime.theaterId?._id || showtime.theaterId));
    const searchLower = searchTerm.toLowerCase();
    
    return (
      movie?.title?.toLowerCase().includes(searchLower) ||
      theater?.name?.toLowerCase().includes(searchLower) ||
      showtime.date.includes(searchTerm) ||
      showtime.time.includes(searchTerm)
    );
  });

  // Debug: Log showtime data structure
  if (filteredShowtimes.length > 0) {
    console.log('🔍 Debug showtime data:', {
      firstShowtime: filteredShowtimes[0],
      theaterId: filteredShowtimes[0].theaterId,
      roomId: filteredShowtimes[0].roomId,
      theaters: theaters.map(t => ({ 
        id: t._id || t.id, 
        name: t.name, 
        rooms: t.rooms?.map(r => ({ id: r._id || r.id, name: r.name })) 
      }))
    });
  }

  // Format functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getMovieTitle = (movieData) => {
    // Nếu movieData đã là object với title
    if (typeof movieData === 'object' && movieData.title) {
      return movieData.title;
    }
    
    // Tìm movie theo ID
    const movie = movies.find(m => {
      return (m._id && m._id.toString() === movieData.toString()) || 
             (m.id && m.id.toString() === movieData.toString()) ||
             m._id === movieData || 
             m.id === movieData;
    });
    
    return movie?.title || 'Phim không xác định';
  };

  const getTheaterName = (theaterData) => {
    // Nếu theaterData đã là object với name
    if (typeof theaterData === 'object' && theaterData.name) {
      return theaterData.name;
    }
    
    // Xử lý trường hợp theaterData có thể là object hoặc string
    const theaterIdValue = theaterData?._id || theaterData?.id || theaterData;
    
    // Tìm theater theo ID
    const theater = theaters.find(t => {
      const tId = t._id || t.id;
      return tId && tId.toString() === theaterIdValue?.toString();
    });
    
    return theater?.name || 'Rạp không xác định';
  };

  const getRoomName = (theaterId, roomId) => {
    // Đảm bảo theaterId và roomId tồn tại
    if (!theaterId || !roomId) {
      console.log('🔍 Missing theaterId or roomId:', { theaterId, roomId });
      return `Phòng không xác định`;
    }
    
    // Tìm theater với logic tương tự getTheaterName
    // Xử lý trường hợp theaterId có thể là object hoặc string
    const theaterIdValue = theaterId?._id || theaterId?.id || theaterId;
    const theater = theaters.find(t => {
      const tId = t._id || t.id;
      return tId && tId.toString() === theaterIdValue?.toString();
    });
    
    if (!theater || !theater.rooms) {
      console.log('🔍 Theater not found or no rooms:', { theaterId, theater: theater?.name });
      return `Phòng không xác định`;
    }
    
    // Tìm room trong theater
    const room = theater.rooms.find(r => {
      // So sánh cả _id và id, và cả string/ObjectId
      return (r._id && r._id.toString() === roomId.toString()) || 
             (r.id && r.id.toString() === roomId.toString()) ||
             r._id === roomId || 
             r.id === roomId;
    });
    
    if (room && room.name) {
      return room.name;
    }
    
    // Fallback: thử tìm theo index hoặc hiển thị thông tin debug
    console.log('🔍 Room not found. Theater:', theater.name, 'RoomId:', roomId, 'Available rooms:', theater.rooms);
    return `Phòng không tìm thấy`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý lịch chiếu thông minh</h1>
          <p className="text-gray-400">Quản lý thời gian chiếu với tính năng kiểm tra trùng lịch tự động</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCopyModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
          >
            <Copy className="w-5 h-5 mr-2" />
            Sao chép lịch
          </button>
          <button 
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm lịch chiếu
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-red-400 whitespace-pre-line">{error}</div>
              {(error.includes('trùng') || error.includes('Slot thời gian') || error.includes('đã được sử dụng')) && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-400">
                    💡 Gợi ý: Một phòng chỉ có thể chiếu một phim tại một thời điểm. Hãy chọn thời gian khác hoặc phòng khác.
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setShowAddForm(true);
                      setCurrentStep(2);
                      loadAvailableSlots();
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    🔍 Xem khung giờ khả dụng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="glass-card rounded-xl p-6 border border-gray-700">
        <div className="relative ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo phim, rạp, ngày chiếu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 z-0"
          />
        </div>
      </div>

      {/* Showtimes List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="glass-card rounded-xl p-8 border border-gray-700 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải danh sách lịch chiếu...</p>
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <div className="glass-card rounded-xl p-8 border border-gray-700 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Chưa có lịch chiếu nào</p>
          </div>
        ) : (
          filteredShowtimes.map((showtime) => (
            <div key={showtime._id || showtime.id} className="glass-card rounded-xl border border-gray-700">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Film className="w-5 h-5 text-cyan-400" />
                      {getMovieTitle(showtime.movieId)}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getTheaterName(showtime.theaterId)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {getRoomName(showtime.theaterId, showtime.roomId)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(showtime.date).toLocaleDateString('vi-VN')}  
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {showtime.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatPrice(showtime.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Còn trống: {showtime.availableSeats}/{showtime.totalSeats} ghế
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        showtime.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {showtime.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setExpandedShowtime(
                        expandedShowtime === showtime._id ? null : showtime._id
                      )}
                      className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                    >
                      {expandedShowtime === showtime._id ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                    <button 
                      onClick={() => handleEdit(showtime)}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(showtime._id || showtime.id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Extended Info */}
              {expandedShowtime === showtime._id && (
                <div className="border-t border-gray-700 p-6 bg-slate-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Đã đặt:</span>
                      <span className="ml-2 text-white">{showtime.totalSeats - showtime.availableSeats} ghế</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tỷ lệ lấp đầy:</span>
                      <span className="ml-2 text-white">
                        {Math.round(((showtime.totalSeats - showtime.availableSeats) / showtime.totalSeats) * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Doanh thu dự kiến:</span>
                      <span className="ml-2 text-white">
                        {formatPrice((showtime.totalSeats - showtime.availableSeats) * showtime.price)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Showtime Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingShowtime ? 'Sửa lịch chiếu' : 'Thêm lịch chiếu mới'}
              </h2>

              {/* Error Display in Modal */}
              {error && (
                <div className="mb-6 glass-card rounded-lg p-4 border border-red-500/30 bg-red-500/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-red-400 whitespace-pre-line text-sm">{error}</div>
                      {error.includes('trùng') && currentStep !== 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(2);
                            loadAvailableSlots();
                            setError(null);
                          }}
                          className="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors"
                        >
                          🔍 Xem khung giờ khả dụng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step Indicator */}
              <div className="flex items-center mb-6">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-cyan-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 1 ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-400'
                  }`}>
                    1
                  </div>
                  <span className="ml-2">Thông tin cơ bản</span>
                </div>
                <div className="flex-1 h-px bg-gray-600 mx-4"></div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-cyan-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 2 ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-400'
                  }`}>
                    2
                  </div>
                  <span className="ml-2">Chọn khung giờ</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-white mb-2">
                          <Film className="w-4 h-4" />
                          Phim *
                        </label>
                        <select
                          name="movieId"
                          value={formData.movieId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Chọn phim</option>
                          {movies.map(movie => (
                            <option key={movie._id || movie.id} value={movie._id || movie.id}>
                              {movie.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-white mb-2">
                          <Calendar className="w-4 h-4" />
                          Ngày chiếu *
                        </label>
                        <select
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.movieId}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        >
                          <option value="">
                            {formData.movieId ? 'Chọn ngày chiếu' : 'Vui lòng chọn phim trước'}
                          </option>
                          {formData.movieId && getAvailableDatesForMovie().map(dateOption => (
                            <option key={dateOption.value} value={dateOption.value}>
                              {dateOption.label}
                            </option>
                          ))}
                        </select>
                        {formData.movieId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Hiển thị 30 ngày tới từ ngày phát hành phim
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-white mb-2">
                          <MapPin className="w-4 h-4" />
                          Rạp chiếu *
                        </label>
                        <select
                          name="theaterId"
                          value={formData.theaterId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="">Chọn rạp</option>
                          {theaters.map(theater => (
                            <option key={theater._id || theater.id} value={theater._id || theater.id}>
                              {theater.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-white mb-2">
                          <Home className="w-4 h-4" />
                          Phòng chiếu *
                        </label>
                        <select
                          name="roomId"
                          value={formData.roomId}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.theaterId}
                          className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        >
                          <option value="">Chọn phòng</option>
                          {getAvailableRooms().map(room => (
                            <option key={room._id || room.id} value={room._id || room.id}>
                              {room.name} (Sức chứa: {room.capacity} ghế)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-white mb-2">
                          <DollarSign className="w-4 h-4" />
                          Giá vé (VND) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          placeholder="Giá được gợi ý tự động"
                          className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                        {formData.movieId && formData.price && (
                          <p className="text-xs text-green-400 mt-1">
                            💡 Giá được gợi ý dựa trên đánh giá và thể loại phim
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-white mb-2">
                          <Users className="w-4 h-4" />
                          Tổng số ghế *
                        </label>
                        <input
                          type="number"
                          name="totalSeats"
                          value={formData.totalSeats}
                          onChange={handleInputChange}
                          required
                          min="1"
                          max={getCurrentRoom()?.capacity || 999}
                          placeholder="Số ghế được điền tự động"
                          className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                        {getCurrentRoom() && (
                          <div className="text-xs mt-1">
                            <p className="text-gray-400">
                              Sức chứa tối đa của phòng: {getCurrentRoom().capacity} ghế
                            </p>
                            {formData.totalSeats && (
                              <p className="text-green-400">
                                💡 Số ghế được điền tự động theo sức chứa phòng
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Movie Info Summary */}
                    {formData.movieId && (
                      <div className="glass-card rounded-lg p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                        <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                          <Film className="w-5 h-5" />
                          Thông tin phim đã chọn
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                          <div>
                            <p className="font-semibold text-white text-lg mb-2">{getCurrentMovie()?.title}</p>
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">🎭 Thể loại:</span>
                              <span className="text-cyan-300">{getCurrentMovie()?.genre}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">📅 Phát hành:</span>
                              <span>{new Date(getCurrentMovie()?.release_date).toLocaleDateString('vi-VN')}</span>
                            </p>
                          </div>
                          <div>
                            {getCurrentMovie()?.duration && (
                              <p className="flex items-center gap-2">
                                <span className="text-gray-400">⏱️ Thời lượng:</span>
                                <span className="text-green-300">{getCurrentMovie().duration} phút</span>
                              </p>
                            )}
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">⭐ Đánh giá:</span>
                              <span className="text-yellow-300">{getCurrentMovie()?.rating}/10</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-gray-400">💰 Giá gợi ý:</span>
                              <span className="text-green-300">{parseInt(formData.price || 0).toLocaleString('vi-VN')} VND</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Info Summary */}
                    {formData.movieId && formData.theaterId && formData.roomId && formData.date && (
                      <div className="glass-card rounded-lg p-4 bg-cyan-500/10 border border-cyan-500/30">
                        <h4 className="text-cyan-400 font-semibold mb-2">Tóm tắt lịch chiếu:</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>🎬 <strong>{getCurrentMovie()?.title}</strong></p>
                          <p>📅 <strong>{getAvailableDatesForMovie().find(d => d.value === formData.date)?.label}</strong></p>
                          <p>🏠 <strong>{getCurrentTheater()?.name} - {getCurrentRoom()?.name}</strong></p>
                          <p>💰 Giá vé: <strong>{formData.price ? parseInt(formData.price).toLocaleString('vi-VN') + ' VND' : 'Chưa nhập'}</strong></p>
                          <p>🎫 Số ghế: <strong>{formData.totalSeats || 'Chưa nhập'}</strong></p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Time Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Chọn khung giờ cho "{getCurrentMovie()?.title}"
                      </h3>
                      <p className="text-gray-400">
                        {new Date(formData.date).toLocaleDateString('vi-VN')} - {getCurrentTheater()?.name} - {getCurrentRoom()?.name}
                      </p>
                    </div>

                    {/* Success message when time is selected */}
                    {formData.time && (
                      <div className="glass-card rounded-lg p-3 bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>✅ Đã chọn khung giờ: <strong>{formData.time}</strong></span>
                        </div>
                      </div>
                    )}

                    {slotsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Đang tìm khung giờ khả dụng...</p>
                      </div>
                    ) : availableSlots ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {availableSlots.allSlots?.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => slot.available && handleTimeSlotSelect(slot)}
                              disabled={!slot.available}
                              className={`p-3 rounded-lg border transition-all duration-200 ${
                                formData.time === slot.time
                                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                                  : slot.available
                                    ? 'border-gray-600 bg-slate-800/50 text-white hover:border-gray-500'
                                    : 'border-red-500/50 bg-red-500/10 text-red-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {slot.available ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                <span className="font-semibold">{slot.time}</span>
                              </div>
                              <div className="text-xs">
                                {slot.available ? 'Khả dụng' : 'Bị trùng'}
                              </div>
                              {!slot.available && slot.conflict && (
                                <div className="text-xs mt-1 text-red-300">
                                  {slot.conflict.movieTitle}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Khung giờ khả dụng</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-gray-300">Khung giờ bị trùng</span>
                          </div>
                        </div>

                        {/* Manual time input */}
                        <div className="border-t border-gray-700 pt-4">
                          <label className="block text-white mb-2">Hoặc nhập giờ thủ công:</label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                
                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                    >
                      Quay lại
                    </button>
                  )}
                  
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!formData.movieId || !formData.theaterId || !formData.roomId || !formData.date || !formData.price || !formData.totalSeats}
                      className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {!formData.movieId ? 'Chọn phim để tiếp tục' :
                       !formData.date ? 'Chọn ngày chiếu để tiếp tục' :
                       !formData.theaterId ? 'Chọn rạp để tiếp tục' :
                       !formData.roomId ? 'Chọn phòng để tiếp tục' :
                       !formData.price ? 'Nhập giá vé để tiếp tục' :
                       !formData.totalSeats ? 'Nhập số ghế để tiếp tục' :
                       'Tiếp theo - Chọn khung giờ'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!formData.time}
                      className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {editingShowtime ? 'Cập nhật lịch chiếu' : 'Tạo lịch chiếu'}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowAddForm(false);
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Copy Showtimes Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Copy className="w-6 h-6" />
                Sao chép lịch chiếu
              </h2>
              
              <form onSubmit={handleCopyShowtimes} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Từ ngày *</label>
                  <input
                    type="date"
                    value={copyData.fromDate}
                    onChange={(e) => setCopyData(prev => ({...prev, fromDate: e.target.value}))}
                    required
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Đến ngày *</label>
                  <input
                    type="date"
                    value={copyData.toDate}
                    onChange={(e) => setCopyData(prev => ({...prev, toDate: e.target.value}))}
                    required
                    min={copyData.fromDate}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Rạp chiếu *</label>
                  <select
                    value={copyData.theaterId}
                    onChange={(e) => setCopyData(prev => ({...prev, theaterId: e.target.value, roomId: ''}))}
                    required
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Chọn rạp</option>
                    {theaters.map(theater => (
                      <option key={theater._id || theater.id} value={theater._id || theater.id}>
                        {theater.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Phòng chiếu (tùy chọn)</label>
                  <select
                    value={copyData.roomId}
                    onChange={(e) => setCopyData(prev => ({...prev, roomId: e.target.value}))}
                    disabled={!copyData.theaterId}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  >
                    <option value="">Tất cả phòng</option>
                    {copyData.theaterId && theaters.find(t => (t._id || t.id) === copyData.theaterId)?.rooms?.map(room => (
                      <option key={room._id || room.id} value={room._id || room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
                  >
                    Sao chép
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCopyModal(false);
                      setCopyData({ fromDate: '', toDate: '', theaterId: '', roomId: '' });
                    }}
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

export default ShowtimeManagement;