const express = require('express');
const router = express.Router();
const { listAdmins, createAdmin, deleteAdmin } = require('../controllers/adminController');
const { authMiddleware, requireSuperadmin } = require('../middleware/authMiddleware');

router.use(authMiddleware, requireSuperadmin);

router.get('/', listAdmins);
router.post('/', createAdmin);
router.delete('/:id', deleteAdmin);

module.exports = router;
