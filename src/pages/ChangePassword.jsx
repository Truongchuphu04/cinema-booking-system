import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BlurCircle from '../components/BlurCircle';

const ChangePassword = () => {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      await changePassword(formData.currentPassword, formData.newPassword);
      
      // Success
      alert('Đổi mật khẩu thành công!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Change password error:', error);
      setErrors({
        currentPassword: error.message || 'Mật khẩu hiện tại không đúng'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Rất yếu', color: 'bg-red-500' },
      { strength: 2, label: 'Yếu', color: 'bg-orange-500' },
      { strength: 3, label: 'Trung bình', color: 'bg-yellow-500' },
      { strength: 4, label: 'Mạnh', color: 'bg-blue-500' },
      { strength: 5, label: 'Rất mạnh', color: 'bg-green-500' }
    ];

    return levels[strength] || levels[0];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 pb-12">
      <BlurCircle top="100px" left="0" />
      <BlurCircle bottom="100px" right="0" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Đổi mật khẩu</h1>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Bảo mật tài khoản</h2>
                <p className="text-gray-400">Thay đổi mật khẩu để bảo vệ tài khoản của bạn</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none transition-colors ${
                      errors.currentPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-cyan-500'
                    }`}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="flex items-center gap-1 text-red-400 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none transition-colors ${
                      errors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-cyan-500'
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="flex items-center gap-1 text-red-400 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none transition-colors ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-cyan-500'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-red-400 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>

            {/* Security Tips */}
            <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h3 className="flex items-center gap-2 text-blue-400 font-medium mb-3">
                <Shield className="w-5 h-5" />
                Mẹo bảo mật
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Sử dụng mật khẩu có ít nhất 8 ký tự</li>
                <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>• Không sử dụng thông tin cá nhân trong mật khẩu</li>
                <li>• Thay đổi mật khẩu định kỳ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;