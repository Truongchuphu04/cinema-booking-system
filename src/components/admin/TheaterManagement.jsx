import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Users, Settings, Star } from 'lucide-react';
import { useTheater } from '../../contexts/TheaterContext';

const TheaterManagement = () => {
  const {
    theaters,
    loading,
    error,
    getTheaters,
    createTheater,
    updateTheater,
    deleteTheater,
    searchTheaters,
    clearError
  } = useTheater();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location: {
      city: '',
      district: '',
      address: ''
    },
    capacity: '',
    rooms: [{ name: '', capacity: '', type: '2D', facilities: [] }],
    facilities: [],
    description: '',
    status: 'active'
  });

  const roomTypes = [
    { value: '2D', label: '2D', color: 'bg-blue-500/20 text-blue-400' },
    { value: '3D', label: '3D', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'IMAX', label: 'IMAX', color: 'bg-red-500/20 text-red-400' },
    { value: '4DX', label: '4DX', color: 'bg-green-500/20 text-green-400' }
  ];

  const availableFacilities = [
    '3D Projection', 'Dolby Atmos', 'IMAX', '4DX Motion', 'Laser Projection', 
    'Recliner Seats', 'Premium Sound', 'Private Lounge', 'Digital Sound',
    'Concession Stand', 'VIP Service', 'Air Conditioning', 'Parking'
  ];

  // Load theaters on component mount
  useEffect(() => {
    console.log('TheaterManagement useEffect: calling getTheaters');
    // Try to load from API, if fails, we'll show empty state
    getTheaters().catch(() => {
      console.log('Backend not available, showing empty state');
    });
  }, []);

  useEffect(() => {
    console.log('TheaterManagement: theaters changed:', theaters);
    console.log('Theaters length:', theaters?.length);
  }, [theaters]);

  // Filter theaters based on search term
  const filteredTheaters = (theaters || []).filter(theater => {
    if (!theater || !theater.name) return false;
    
    return (
      theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.location?.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      theater.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location fields
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFacilityChange = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleRoomChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  const handleRoomFacilityChange = (roomIndex, facility) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map((room, i) =>
        i === roomIndex ? {
          ...room,
          facilities: (room.facilities || []).includes(facility)
            ? (room.facilities || []).filter(f => f !== facility)
            : [...(room.facilities || []), facility]
        } : room
      )
    }));
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, { name: '', capacity: '', type: '2D', facilities: [] }]
    }));
  };

  const removeRoom = (index) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const theaterData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        rooms: formData.rooms.map(room => ({
          ...room,
          capacity: parseInt(room.capacity)
        }))
      };

      if (editingTheater) {
        await updateTheater(editingTheater._id, theaterData);
        setEditingTheater(null);
      } else {
        await createTheater(theaterData);
      }

      // Reload theaters list after successful create/update
      await getTheaters();
      resetForm();
    } catch (error) {
      console.error('Error saving theater:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      location: {
        city: '',
        district: '',
        address: ''
      },
      capacity: '',
      rooms: [{ name: '', capacity: '', type: '2D', facilities: [] }],
      facilities: [],
      description: '',
      status: 'active'
    });
    setShowAddForm(false);
  };

  const handleEdit = (theater) => {
    setEditingTheater(theater);
    setFormData({
      name: theater.name || '',
      address: theater.address || '',
      location: {
        city: theater.location?.city || '',
        district: theater.location?.district || '',
        address: theater.location?.address || ''
      },
      capacity: theater.capacity?.toString() || '',
      rooms: (theater.rooms || [{ name: '', capacity: '', type: '2D', facilities: [] }]).map(room => ({
        ...room,
        facilities: room.facilities || []
      })),
      facilities: theater.facilities || [],
      description: theater.description || '',
      status: theater.status || 'active'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (theaterId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp chiếu này?')) {
      try {
        await deleteTheater(theaterId);
      } catch (error) {
        console.error('Error deleting theater:', error);
      }
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim()) {
      await searchTheaters(term);
    } else {
      await getTheaters();
    }
  };

  const getTypeColor = (type) => {
    const typeConfig = roomTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-500/20 text-gray-400';
  };

  const getTypeLabel = (type) => {
    const typeConfig = roomTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý rạp chiếu</h1>
          <p className="text-gray-400">Quản lý các rạp chiếu và trang thiết bị</p>
        </div>
        <button 
          onClick={() => {
            setEditingTheater(null);
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm rạp mới
        </button>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-6 border border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên rạp, thành phố, trạng thái..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="text-gray-400 mt-2">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="glass-card rounded-xl p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Theaters Grid */}
      {!loading && filteredTheaters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Không có rạp chiếu nào</p>
          <p className="text-gray-500 text-sm mt-2">Thêm rạp chiếu đầu tiên của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTheaters.map((theater) => (
          <div key={theater._id} className="glass-card rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{theater?.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    theater?.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : theater?.status === 'maintenance'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {theater?.status === 'active' ? 'Hoạt động' : 
                     theater?.status === 'maintenance' ? 'Bảo trì' : 'Tạm dừng'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                    {theater?.rooms?.length || 0} phòng
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEdit(theater)}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(theater?._id)}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Sức chứa: {theater?.capacity || 0} ghế</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>
                  {theater?.location?.city && theater?.location?.district
                    ? `${theater?.location?.district}, ${theater?.location?.city}`
                    : theater?.address || 'Chưa có địa chỉ'
                  }
                </span>
              </div>
              
              {theater?.description && (
                <p className="text-gray-400">{theater.description}</p>
              )}

              {/* Rooms Information */}
              {theater?.rooms && theater.rooms.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4" />
                    <span>Phòng chiếu:</span>
                  </div>
                  <div className="space-y-1">
                    {theater.rooms.map((room, index) => (
                      <div key={index} className="text-xs text-gray-400">
                        <span className="text-cyan-400">{room?.name}</span>
                        <span className="ml-2">({room?.capacity} ghế)</span>
                        <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getTypeColor(room?.type)}`}>
                          {getTypeLabel(room?.type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {theater?.facilities && theater.facilities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4" />
                    <span>Trang thiết bị:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {theater.facilities.map((facility, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-slate-700/50 text-cyan-400 text-xs rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add/Edit Theater Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingTheater ? 'Sửa rạp chiếu' : 'Thêm rạp mới'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Tên rạp *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Đường ABC, Quận XYZ"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white mb-2">Thành phố *</label>
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Hồ Chí Minh"
                        className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white mb-2">Quận/Huyện *</label>
                      <input
                        type="text"
                        name="location.district"
                        value={formData.location.district}
                        onChange={handleInputChange}
                        required
                        placeholder="Quận 1"
                        className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Địa chỉ cụ thể</label>
                      <input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        placeholder="123 Đường ABC"
                        className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Tổng sức chứa (ghế) *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="200"
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
                      <option value="active">Hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="inactive">Tạm dừng</option>
                    </select>
                  </div>
                </div>
                
                {/* Rooms Management */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white">Phòng chiếu *</label>
                    <button
                      type="button"
                      onClick={addRoom}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors"
                    >
                      + Thêm phòng
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.rooms.map((room, index) => (
                      <div key={index} className="p-4 bg-slate-800/30 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium">Phòng {index + 1}</h4>
                          {formData.rooms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRoom(index)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Tên phòng *</label>
                            <input
                              type="text"
                              value={room.name}
                              onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                              placeholder="Phòng A1"
                              required
                              className="w-full px-3 py-2 bg-slate-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Sức chứa *</label>
                            <input
                              type="number"
                              value={room.capacity}
                              onChange={(e) => handleRoomChange(index, 'capacity', e.target.value)}
                              placeholder="50"
                              required
                              min="1"
                              className="w-full px-3 py-2 bg-slate-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Loại phòng</label>
                            <select
                              value={room.type}
                              onChange={(e) => handleRoomChange(index, 'type', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700/50 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                            >
                              {roomTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 text-sm mb-2">Trang thiết bị phòng</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {availableFacilities.slice(0, 6).map(facility => (
                              <label key={facility} className="flex items-center text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={room.facilities?.includes(facility) || false}
                                  onChange={() => handleRoomFacilityChange(index, facility)}
                                  className="mr-2 accent-cyan-500"
                                />
                                <span className="text-xs">{facility}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Trang thiết bị chung</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableFacilities.slice(6).map(facility => (
                      <label key={facility} className="flex items-center text-white">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityChange(facility)}
                          className="mr-2 accent-cyan-500"
                        />
                        <span className="text-sm">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-white mb-2">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
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
                    {editingTheater ? 'Cập nhật' : 'Thêm rạp'}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Tổng rạp</h3>
          <p className="text-3xl font-bold text-cyan-400">{(theaters || []).length}</p>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Đang hoạt động</h3>
          <p className="text-3xl font-bold text-green-400">
            {(theaters || []).filter(t => t && t.status === 'active').length}
          </p>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Tổng ghế</h3>
          <p className="text-3xl font-bold text-blue-400">
            {(theaters || []).reduce((sum, t) => sum + (t?.capacity || 0), 0)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Tổng phòng</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {(theaters || []).reduce((sum, t) => sum + (t?.rooms?.length || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TheaterManagement;