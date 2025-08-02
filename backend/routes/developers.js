const express = require('express');
const User = require('../models/User');
const { auth, ownerOnly } = require('../middleware/auth');
const router = express.Router();

// Get all developers (owners only)
router.get('/', auth, ownerOnly, async (req, res) => {
  try {
    const developers = await User.find({ role: 'developer' })
      .select('-password')
      .populate('assignedProjects', 'name');
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get developer profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedProjects', 'name description status startDate endDate');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update developer profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'school', 'grade', 'hoursPerWeek', 'resume', 'skills'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;