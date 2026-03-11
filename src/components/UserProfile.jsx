import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, LogOut, Edit2, Check, X, MapPin, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, logout, updateUserProfile: updateAuthUser } = useAuth();
  const { updateUserProfile } = useUsers();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || user?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!editData.name || !editData.phone) {
        toast.error('Vui lòng điền đầy đủ tên và số điện thoại');
        return;
      }
      
      // Update user profile through UserContext
      const updatedUser = await updateUserProfile(editData);
      
      // Update user in AuthContext if available
      if (updateAuthUser && updatedUser) {
        updateAuthUser(updatedUser);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Error already handled in updateUserProfile
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || user?.fullName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Thông tin cá nhân</h2>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Họ và tên</label>
              {!isEditing && (
                <button onClick={handleEdit} className="text-red-500 hover:text-red-400">
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full bg-white/10 text-white text-lg font-medium focus:outline-none px-3 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                placeholder="Nhập họ và tên"
              />
            ) : (
              <p className="text-white text-lg font-medium">{user?.name || user?.fullName || 'Chưa cập nhật'}</p>
            )}
          </div>

          {/* Email */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="text-sm text-gray-400">Email</label>
            <div className="flex items-center gap-3 mt-2">
              <Mail size={20} className="text-gray-400" />
              <p className="text-white">{user?.email}</p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="text-sm text-gray-400">Ngày sinh</label>
            {isEditing ? (
              <input
                type="date"
                value={editData.dateOfBirth}
                onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                className="w-full bg-white/10 text-white mt-2 px-3 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <Calendar size={20} className="text-gray-400" />
                <p className="text-white">
                  {user?.dateOfBirth 
                    ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') 
                    : 'Chưa cập nhật'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Account Status */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="text-sm text-gray-400">Trạng thái tài khoản</label>
            <div className="flex items-center gap-3 mt-2">
              <div className={`w-3 h-3 rounded-full ${user?.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
              <p className={`font-medium ${user?.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                {user?.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="text-sm text-gray-400">Số điện thoại</label>
            {isEditing ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                className="w-full bg-white/10 text-white mt-2 px-3 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <Phone size={20} className="text-gray-400" />
                <p className="text-white">{user?.phone || 'Chưa cập nhật'}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="text-sm text-gray-400">Địa chỉ</label>
            {isEditing ? (
              <textarea
                value={editData.address}
                onChange={(e) => setEditData({...editData, address: e.target.value})}
                className="w-full bg-white/10 text-white mt-2 px-3 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
                rows="3"
                placeholder="Nhập địa chỉ"
              />
            ) : (
              <div className="flex items-start gap-3 mt-2">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <p className="text-white">{user?.address || 'Chưa cập nhật'}</p>
              </div>
            )}
          </div>

          {/* Join Date */}
          <div className="bg-white/5 rounded-xl p-4">
            <label className="text-sm text-gray-400">Ngày tham gia</label>
            <div className="flex items-center gap-3 mt-2">
              <Calendar size={20} className="text-gray-400" />
              <p className="text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Lưu
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
