const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: function() {
      return this.role === 'owner';
    }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'developer'],
    required: true
  },
  // Developer specific fields
  school: {
    type: String,
    required: function() {
      return this.role === 'developer';
    }
  },
  grade: {
    type: String,
    required: function() {
      return this.role === 'developer';
    }
  },
  hoursPerWeek: {
    type: Number,
    required: function() {
      return this.role === 'developer';
    }
  },
  resume: {
    type: String,
    required: function() {
      return this.role === 'developer';
    }
  },
  skills: [{
    type: String
  }],
  assignedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);