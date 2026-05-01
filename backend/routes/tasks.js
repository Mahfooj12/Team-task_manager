const express = require('express');
// ✅ FIXED: Import from Task.js (singular) not Tasks.js
const Task = require('../models/Task');  // Changed from '../models/Tasks' to '../models/Task'
const Project = require('../models/Projects');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching tasks for user:', req.user._id);
    
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { assignedBy: req.user._id }
      ]
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${tasks.length} tasks`);
    
    res.json({
      success: true,
      tasks: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Check access
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.json({
      success: true,
      tasks: tasks
    });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, priority } = req.body;
    
    console.log('Creating task:', { title, projectId, userId: req.user._id });
    
    if (!title || !projectId) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and project are required' 
      });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Check if user is project member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    const task = new Task({
      title: title.trim(),
      description: description || '',
      project: projectId,
      assignedTo: assignedTo || null,
      assignedBy: req.user._id,
      dueDate: dueDate || null,
      priority: priority || 'Medium'
    });
    
    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');
    
    console.log('Task created successfully:', task._id);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update task status (FIXED VERSION)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log(`🔄 Updating task ${req.params.id} to status: ${status}`);
    
    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid status is required' 
      });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    console.log(`Task found - Title: ${task.title}, Current Status: ${task.status}`);
    
    // Check if user has permission
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isCreator = task.assignedBy && task.assignedBy.toString() === req.user._id.toString();
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === 'Admin';
    
    console.log(`Permissions - Assigned: ${isAssigned}, Creator: ${isCreator}, Owner: ${isOwner}, Admin: ${isAdminUser}`);
    
    if (!isAssigned && !isCreator && !isOwner && !isAdminUser) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You cannot update this task status.' 
      });
    }
    
    // Update the status
    task.status = status;
    await task.save();
    
    console.log(`✅ Task ${task._id} status updated to ${status}`);
    
    // Return updated task with populated fields
    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.json({
      success: true,
      message: `Task status updated to ${status}`,
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update task status',
      error: error.message 
    });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Only project owner or admin can update tasks' 
      });
    }
    
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    
    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      task: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete task - FIXED VERSION
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Deleting task:', req.params.id);
    console.log('👤 User:', req.user._id, 'Role:', req.user.role);
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    console.log('📋 Task found:', task.title);
    console.log('📁 Project ID:', task.project);
    
    // Check if project exists
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Check permissions - Allow if user is:
    // 1. Project owner
    // 2. Task creator (assignedBy)
    // 3. Admin user
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCreator = task.assignedBy && task.assignedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    
    console.log('Permissions - isOwner:', isOwner, 'isCreator:', isCreator, 'isAdmin:', isAdmin);
    
    if (!isOwner && !isCreator && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only project owner, task creator, or admin can delete tasks.' 
      });
    }
    
    await task.deleteOne();
    
    console.log('✅ Task deleted successfully');
    
    res.json({ 
      success: true,
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete task',
      error: error.message 
    });
  }
});

// Delete task
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
    
//     if (!task) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Task not found' 
//       });
//     }
    
//     const project = await Project.findById(task.project);
//     const isOwner = project.owner.toString() === req.user._id.toString();
//     const isAdmin = req.user.role === 'Admin';
    
//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ 
//         success: false,
//         message: 'Only project owner or admin can delete tasks' 
//       });
//     }
    
//     await task.deleteOne();
    
//     res.json({ 
//       success: true,
//       message: 'Task deleted successfully' 
//     });
//   } catch (error) {
//     console.error('Error deleting task:', error);
//     res.status(500).json({ 
//       success: false,
//       message: error.message 
//     });
//   }
// });

module.exports = router;