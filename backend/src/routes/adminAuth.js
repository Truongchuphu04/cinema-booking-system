const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile, adminLogout } = require('../controllers/adminAuthController');
const { auth } = require('../middleware/auth');

// Admin authentication routes
router.post('/admin-login', adminLogin);
router.get('/admin-profile', auth, getAdminProfile);
router.post('/admin-logout', adminLogout);

module.exports = router;