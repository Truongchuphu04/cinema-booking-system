import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BlurCircle from '../components/BlurCircle';

const AccountInfo = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || ''
  });

  // Check if user is logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <BlurCircle top="100px" left="0" />
      <BlurCircle bottom="100px" right="0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Thông tin tài khoản</h1>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Basic Info */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {user?.fullName || 'Người dùng'}
                </h2>
                <p className="text-cyan-400 mb-1">{user?.email}</p>
                <p className="text-gray-400">
                  Thành viên từ {new Date(user?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Edit Button */}
              <div className="ml-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {user?.fullName || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400">
                  {user?.email || 'Chưa cập nhật'}
                  <span className="text-xs ml-2">(Không thể thay đổi)</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {user?.phone || 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Địa chỉ
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white min-h-[80px]">
                    {user?.address || 'Chưa cập nhật'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;