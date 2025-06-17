const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// This route is protected. User must be logged in.
router.get('/', protect, getProfile);

module.exports = router;