// server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();

// --- UPDATED: Import the new controller functions ---
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// --- UPDATED: Import the new admin middleware ---
const { protect, admin } = require('../middleware/authMiddleware');

// --- Public / Student Routes ---
router.route('/').get(protect, getAllJobs);
router.route('/:id').get(protect, getJobById);

// --- NEW: Admin-Only Routes ---
// Only a logged-in admin can access these routes
router.route('/').post(protect, admin, createJob); 
router.route('/:id').put(protect, admin, updateJob).delete(protect, admin, deleteJob);

module.exports = router;