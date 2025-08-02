const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const owners = require('../data/owners.json');
const router = express.Router();

// Developer Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, school, grade, hoursPerWeek, resume, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      school,
      grade,
      hoursPerWeek,
      resume,
      password,
      role: 'developer',
      skills: []
    });

    await user.save();
    res.status(201).json({ message: 'Developer registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login (both owners and developers)
router.post('/login', async (req, res) => {
  try {
    const { email, password, username, type } = req.body;

    if (type === 'owner') {
      // Check against JSON file for owners
      const owner = owners.find(o => o.username === username && o.password === password);
      if (!owner) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create or find owner in database
      let ownerUser = await User.findOne({ username, role: 'owner' });
      if (!ownerUser) {
        ownerUser = new User({
          name: username,
          email: `${username}@company.com`,
          username,
          password,
          role: 'owner'
        });
        await ownerUser.save();
      }

      const token = jwt.sign(
        { userId: ownerUser._id, role: 'owner' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: ownerUser._id,
          name: ownerUser.name,
          email: ownerUser.email,
          username: ownerUser.username,
          role: 'owner'
        }
      });
    } else {
      // Developer login
      const user = await User.findOne({ email, role: 'developer' });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, role: 'developer' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'developer',
          school: user.school,
          grade: user.grade,
          hoursPerWeek: user.hoursPerWeek
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;