const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { assignedBy: req.user._id }
      ]
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check access
    if (project.owner.toString() !== req.user._id.toString() && 
        !project.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is project member
    if (project.owner.toString() !== req.user._id.toString() && 
        !project.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      assignedBy: req.user._id,
      dueDate,
      priority: priority || 'Medium'
    });
    
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is assigned to task or is admin/project owner
    const project = await Project.findById(task.project);
    const isAuthorized = task.assignedTo?.toString() === req.user._id.toString() ||
                         project.owner.toString() === req.user._id.toString() ||
                         req.user.role === 'Admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    task.status = status;
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const project = await Project.findById(task.project);
    const isAuthorized = project.owner.toString() === req.user._id.toString() ||
                         req.user.role === 'Admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const project = await Project.findById(task.project);
    const isAuthorized = project.owner.toString() === req.user._id.toString() ||
                         req.user.role === 'Admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;