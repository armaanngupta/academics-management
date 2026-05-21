const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/authController');
const { authMiddleware, requireSuperadmin } = require('../middleware/authMiddleware');

// Register Admin (superadmin only)
router.post('/register', authMiddleware, requireSuperadmin, registerAdmin);

// Login Admin
router.post('/login', loginAdmin);

module.exports = router;
