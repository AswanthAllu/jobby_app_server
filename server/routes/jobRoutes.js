const express = require('express');
const router = express.Router();
const { getAllJobs, getJobById } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// All job routes are protected
router.route('/').get(protect, getAllJobs);
router.route('/:id').get(protect, getJobById);

module.exports = router;