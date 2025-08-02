//backend/routes/projects.js

const express = require('express');
const Project = require('../models/Project');
const Phase = require('../models/Phase');
const User = require('../models/User');
const { auth, ownerOnly } = require('../middleware/auth');
const router = express.Router();

// Get all projects (owners see all, developers see assigned)
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'owner') {
      projects = await Project.find()
        .populate('assignedDevelopers', 'name email')
        .populate('phases')
        .populate('owner', 'name username');
    } else {
      projects = await Project.find({ assignedDevelopers: req.user._id })
        .populate('assignedDevelopers', 'name email')
        .populate('phases')
        .populate('owner', 'name username');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedDevelopers', 'name email school grade hoursPerWeek')
      .populate({
        path: 'phases',
        populate: {
          path: 'assignedDevelopers tasks.assignedTo',
          select: 'name email'
        }
      })
      .populate('owner', 'name username');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if developer has access to this project
    if (req.user.role === 'developer' && 
        !project.assignedDevelopers.some(dev => dev._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project (owners only)
router.post('/', auth, ownerOnly, async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      owner: req.user._id
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project (owners and assigned developers)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'developer') {
      // Check if developer is assigned to this project
      if (!project.assignedDevelopers.includes(req.user._id)) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this project.' });
      }
      
      // Developers can only update status
      const allowedUpdates = ['status'];
      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No valid updates provided' });
      }
      
      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      ).populate('assignedDevelopers', 'name email');
      
      return res.json(updatedProject);
    } else {
      // Owners can update all fields
      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('assignedDevelopers', 'name email');
      
      return res.json(updatedProject);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project (owners only)
router.delete('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Find the project first to check if it exists and get owner info
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if the authenticated user is the owner of this project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own projects.' });
    }

    // Delete all phases associated with this project
    await Phase.deleteMany({ project: projectId });
    
    // Remove project from assigned developers' assignedProjects arrays
    await User.updateMany(
      { assignedProjects: projectId },
      { $pull: { assignedProjects: projectId } }
    );
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove developers from project (owners only)
router.post('/:id/remove', auth, ownerOnly, async (req, res) => {
  try {
    const { developerIds } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { assignedDevelopers: { $in: developerIds } } },
      { new: true }
    ).populate('assignedDevelopers', 'name email');

    // Remove project from developers' assignedProjects
    await User.updateMany(
      { _id: { $in: developerIds } },
      { $pull: { assignedProjects: req.params.id } }
    );

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign developers to project (owners only)
router.post('/:id/assign', auth, ownerOnly, async (req, res) => {
  try {
    const { developerIds } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assignedDevelopers: { $each: developerIds } } },
      { new: true }
    ).populate('assignedDevelopers', 'name email');

    // Update developers' assignedProjects
    await User.updateMany(
      { _id: { $in: developerIds } },
      { $addToSet: { assignedProjects: req.params.id } }
    );

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add phase to project (owners only)
router.post('/:id/phases', auth, ownerOnly, async (req, res) => {
  try {
    const { name, startDate, endDate, tasks } = req.body;

    const phase = new Phase({
      name,
      project: req.params.id,
      startDate,
      endDate,
      tasks: tasks.map(task => ({ name: task, completed: false }))
    });

    await phase.save();

    await Project.findByIdAndUpdate(
      req.params.id,
      { $push: { phases: phase._id } }
    );

    res.status(201).json(phase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update phase status (developers can update assigned phases)
router.put('/:projectId/phases/:phaseId', auth, async (req, res) => {
  try {
    const { status, tasks } = req.body;
    const phase = await Phase.findById(req.params.phaseId);

    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' });
    }

    // Check permissions
    if (req.user.role === 'developer') {
      const project = await Project.findById(req.params.projectId);
      if (!project.assignedDevelopers.includes(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (status) phase.status = status;
    if (tasks) phase.tasks = tasks;

    await phase.save();
    res.json(phase);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;