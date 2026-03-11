const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Demo admin accounts for development
    const demoAdminAccounts = [
      { email: 'admin@cinema.com', password: 'admin123', fullName: 'Cinema Administrator' },
      { email: 'demo@admin.com', password: 'demo123', fullName: 'Demo Administrator' }
    ];

    // Check if it's a demo admin account
    const demoAdmin = demoAdminAccounts.find(
      admin => admin.email === email.toLowerCase() && admin.password === password
    );

    if (demoAdmin) {
      // Create demo admin user object
      const adminUser = {
        _id: 'admin_' + Date.now(),
        fullName: demoAdmin.fullName,
        email: demoAdmin.email,
        role: 'admin',
        isActive: true
      };

      // Generate token
      const token = generateToken(adminUser._id);

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập admin thành công',
        data: {
          user: adminUser,
          token
        }
      });
    }

    // Try to find admin user in database
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu admin không đúng'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập admin'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu admin không đúng'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản admin đã bị vô hiệu hóa'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập admin thành công',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập admin'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau'
    });
  }
};

// Admin logout
const adminLogout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Đăng xuất admin thành công'
  });
};

module.exports = {
  adminLogin,
  getAdminProfile,
  adminLogout
};