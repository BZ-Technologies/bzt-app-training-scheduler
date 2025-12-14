const express = require('express');
const router = express.Router();
const trainingService = require('../services/TrainingSchedulerService');

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

/**
 * GET /api/training/categories
 * Get all categories for the current tenant
 */
router.get('/categories', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await trainingService.getCategories(includeInactive);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/training/categories/:id
 * Get a specific category
 */
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await trainingService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

/**
 * POST /api/training/categories
 * Create a new category
 */
router.post('/categories', async (req, res) => {
  try {
    const category = await trainingService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

/**
 * PUT /api/training/categories/:id
 * Update a category
 */
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await trainingService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// ============================================================================
// CLASS ROUTES
// ============================================================================

/**
 * GET /api/training/classes
 * Get all classes for the current tenant
 */
router.get('/classes', async (req, res) => {
  try {
    const category = req.query.category || null;
    const search = req.query.search || null;
    const classes = await trainingService.getClasses(category, search);
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

/**
 * GET /api/training/classes/:id
 * Get a specific class
 */
router.get('/classes/:id', async (req, res) => {
  try {
    const classItem = await trainingService.getClassById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classItem);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

/**
 * POST /api/training/classes
 * Create a new class
 */
router.post('/classes', async (req, res) => {
  try {
    const classItem = await trainingService.createClass(req.body);
    res.status(201).json(classItem);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

/**
 * PUT /api/training/classes/:id
 * Update a class
 */
router.put('/classes/:id', async (req, res) => {
  try {
    const classItem = await trainingService.updateClass(req.params.id, req.body);
    res.json(classItem);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// ============================================================================
// SESSION ROUTES
// ============================================================================

/**
 * GET /api/training/classes/:classId/sessions
 * Get all sessions for a class
 */
router.get('/classes/:classId/sessions', async (req, res) => {
  try {
    const futureOnly = req.query.futureOnly !== 'false';
    const sessions = await trainingService.getClassSessions(req.params.classId, futureOnly);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/training/sessions/:id
 * Get a specific session
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await trainingService.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * POST /api/training/sessions
 * Create or update a session
 */
router.post('/sessions', async (req, res) => {
  try {
    const session = await trainingService.upsertSession(req.body);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating/updating session:', error);
    res.status(500).json({ error: 'Failed to create/update session' });
  }
});

/**
 * PUT /api/training/sessions/:id
 * Update a session
 */
router.put('/sessions/:id', async (req, res) => {
  try {
    const sessionData = { ...req.body, id: req.params.id };
    const session = await trainingService.upsertSession(sessionData);
    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

/**
 * DELETE /api/training/sessions/:id
 * Delete a session
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    await trainingService.deleteSession(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ============================================================================
// REGISTRATION ROUTES
// ============================================================================

/**
 * GET /api/training/registrations
 * Get all registrations with optional filters
 */
router.get('/registrations', async (req, res) => {
  try {
    const filters = {
      class_id: req.query.class_id || null,
      session_id: req.query.session_id || null,
      status: req.query.status || null,
      email: req.query.email || null
    };
    const registrations = await trainingService.getRegistrations(filters);
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

/**
 * POST /api/training/registrations
 * Create a new registration
 */
router.post('/registrations', async (req, res) => {
  try {
    const registration = await trainingService.createRegistration(req.body);
    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
});

/**
 * PUT /api/training/registrations/:id/status
 * Update registration status
 */
router.put('/registrations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    await trainingService.updateRegistrationStatus(req.params.id, status);
    res.json({ message: 'Registration status updated' });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ error: 'Failed to update registration status' });
  }
});

module.exports = router;
