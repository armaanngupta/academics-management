const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  addMarksheet,
  getAllMarksheets,
  getMarksheetSummary,
  searchMarksheets,
  getMarksheetById,
  updateMarksheet,
  deleteMarksheet,
  toggleIssuedStatus,
} = require('../controllers/marksheetController');

// Apply auth middleware to all marksheet routes
router.use(authMiddleware);

// Add new marksheet
router.post('/add', addMarksheet);

// Get all marksheets
router.get('/', getAllMarksheets);

// Dashboard summary
router.get('/summary', getMarksheetSummary);

// Search marksheets
router.get('/search', searchMarksheets);

// Get marksheet by ID
router.get('/:id', getMarksheetById);

// Update marksheet
router.put('/:id', updateMarksheet);

// Delete marksheet
router.delete('/:id', deleteMarksheet);

// Toggle issued status
router.patch('/:id/toggle-issued', toggleIssuedStatus);

module.exports = router;
