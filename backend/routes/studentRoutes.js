const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAllStudents, createStudent, checkEnrollment, searchStudents } = require('../controllers/studentController');

router.use(authMiddleware);
router.get('/check', checkEnrollment);
router.get('/search', searchStudents);
router.get('/', getAllStudents);
router.post('/', createStudent);

module.exports = router;
