const express = require('express');
const router = express.Router();
const { getAcademics, updateAcademics } = require('../controllers/academicController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getAcademics);
router.put('/', updateAcademics);

module.exports = router;
