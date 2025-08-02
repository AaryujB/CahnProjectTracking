const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
    default: 'Planning'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDevelopers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  phases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);