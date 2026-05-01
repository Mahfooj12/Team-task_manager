const express = require('express');
const Project = require('../models/Projects');
const User = require('../models/Users');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all projects (user's projects)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user._id);
    
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });
    
    console.log(`Found ${projects.length} projects`);
    
    res.json({
      success: true,
      projects: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch projects',
      error: error.message 
    });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Check if user has access
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }
    
    res.json({
      success: true,
      project: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch project',
      error: error.message 
    });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    console.log('Creating project:', { name, description, userId: req.user._id });
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Project name is required' 
      });
    }
    
    const project = new Project({
      name: name.trim(),
      description: description || '',
      owner: req.user._id,
      members: members || []
    });
    
    await project.save();
    await project.populate('owner', 'name email');
    
    console.log('Project created successfully:', project._id);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create project',
      error: error.message 
    });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Only owner or admin can update
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only project owner can update this project' 
      });
    }
    
    const { name, description, status, members } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (members) project.members = members;
    
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      project: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update project',
      error: error.message 
    });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Only owner or admin can delete
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only project owner can delete this project' 
      });
    }
    
    await project.deleteOne();
    
    console.log('Project deleted:', req.params.id);
    
    res.json({ 
      success: true,
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete project',
      error: error.message 
    });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Only project owner can add members' 
      });
    }
    
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (project.members.includes(user._id)) {
      return res.status(400).json({ 
        success: false,
        message: 'User is already a member' 
      });
    }
    
    project.members.push(user._id);
    await project.save();
    await project.populate('members', 'name email');
    
    res.json({
      success: true,
      message: 'Member added successfully',
      project: project
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add member',
      error: error.message 
    });
  }
});

// Remove member from project
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Only project owner can remove members' 
      });
    }
    
    project.members = project.members.filter(
      m => m.toString() !== req.params.memberId
    );
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Member removed successfully',
      project: project
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove member',
      error: error.message 
    });
  }
});

module.exports = router;