// NOTE: These dependencies must be provided by the platform
// When integrating, adjust paths to point to portal's db pool and middleware
const pool = require('../db/pool');  // Adjust path: ../../db/pool or /opt/bzt-portal/app/src/db/pool
const { getTenantId } = require('../middleware/tenantMiddleware');  // Adjust path accordingly

/**
 * Get tenant ID from context
 * @returns {number} Tenant ID
 */
function getTenantContext() {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context required');
  }
  return tenantId;
}

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

/**
 * Get all categories for the current tenant
 * @param {boolean} includeInactive - Include inactive categories
 * @returns {Promise<Array>} Array of categories
 */
async function getCategories(includeInactive = false) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    let query = 'SELECT * FROM training_categories WHERE tenant_id = ?';
    if (!includeInactive) {
      query += ' AND active = TRUE';
    }
    query += ' ORDER BY sort_order ASC, display_name ASC';
    const [rows] = await conn.query(query, [tenantId]);
    return rows;
  } finally {
    conn.release();
  }
}

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category object or null
 */
async function getCategoryById(categoryId) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM training_categories WHERE id = ? AND tenant_id = ?',
      [categoryId, tenantId]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category
 */
async function createCategory(categoryData) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO training_categories (id, tenant_id, name, display_name, icon, sort_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryData.id,
        tenantId,
        categoryData.name || categoryData.id,
        categoryData.display_name || categoryData.name || categoryData.id,
        categoryData.icon || null,
        categoryData.sort_order || 0,
        categoryData.active !== undefined ? categoryData.active : true
      ]
    );
    return await getCategoryById(categoryData.id);
  } finally {
    conn.release();
  }
}

/**
 * Update a category
 * @param {string} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category
 */
async function updateCategory(categoryId, categoryData) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    const updates = [];
    const values = [];
    
    if (categoryData.name !== undefined) {
      updates.push('name = ?');
      values.push(categoryData.name);
    }
    if (categoryData.display_name !== undefined) {
      updates.push('display_name = ?');
      values.push(categoryData.display_name);
    }
    if (categoryData.icon !== undefined) {
      updates.push('icon = ?');
      values.push(categoryData.icon);
    }
    if (categoryData.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(categoryData.sort_order);
    }
    if (categoryData.active !== undefined) {
      updates.push('active = ?');
      values.push(categoryData.active);
    }
    
    if (updates.length === 0) {
      return await getCategoryById(categoryId);
    }
    
    values.push(categoryId, tenantId);
    await conn.query(
      `UPDATE training_categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND tenant_id = ?`,
      values
    );
    return await getCategoryById(categoryId);
  } finally {
    conn.release();
  }
}

// ============================================================================
// CLASS MANAGEMENT
// ============================================================================

/**
 * Get all classes for the current tenant
 * @param {string} category - Optional category filter
 * @param {string} search - Optional search term
 * @returns {Promise<Array>} Array of classes
 */
async function getClasses(category = null, search = null) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    let query = 'SELECT * FROM training_classes WHERE tenant_id = ? AND active = TRUE';
    const params = [tenantId];
    
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR summary LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY 
      CASE level 
        WHEN 'Beginner' THEN 1 
        WHEN 'Intermediate' THEN 2 
        WHEN 'Advanced' THEN 3 
        ELSE 4 
      END,
      sort_order ASC,
      name ASC`;
    
    const [rows] = await conn.query(query, params);
    return rows;
  } finally {
    conn.release();
  }
}

/**
 * Get class by ID
 * @param {string} classId - Class ID
 * @returns {Promise<Object|null>} Class object or null
 */
async function getClassById(classId) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM training_classes WHERE id = ? AND tenant_id = ? AND active = TRUE',
      [classId, tenantId]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

/**
 * Create a new class
 * @param {Object} classData - Class data
 * @returns {Promise<Object>} Created class
 */
async function createClass(classData) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO training_classes 
       (id, tenant_id, name, level, duration, tuition, category, sort_order, badge, 
        summary, description, highlights, equipment, prerequisites, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        classData.id,
        tenantId,
        classData.name,
        classData.level,
        classData.duration,
        classData.tuition,
        classData.category || 'other',
        classData.sort_order || 0,
        classData.badge || null,
        classData.summary || null,
        classData.description || null,
        classData.highlights || null,
        classData.equipment || null,
        classData.prerequisites || null,
        classData.active !== undefined ? classData.active : true
      ]
    );
    return await getClassById(classData.id);
  } finally {
    conn.release();
  }
}

/**
 * Update a class
 * @param {string} classId - Class ID
 * @param {Object} classData - Updated class data
 * @returns {Promise<Object>} Updated class
 */
async function updateClass(classId, classData) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    const updates = [];
    const values = [];
    
    if (classData.name) updates.push('name = ?'), values.push(classData.name);
    if (classData.level) updates.push('level = ?'), values.push(classData.level);
    if (classData.duration) updates.push('duration = ?'), values.push(classData.duration);
    if (classData.tuition !== undefined) updates.push('tuition = ?'), values.push(classData.tuition);
    if (classData.category !== undefined) updates.push('category = ?'), values.push(classData.category);
    if (classData.sort_order !== undefined) updates.push('sort_order = ?'), values.push(classData.sort_order);
    if (classData.badge !== undefined) updates.push('badge = ?'), values.push(classData.badge);
    if (classData.summary !== undefined) updates.push('summary = ?'), values.push(classData.summary);
    if (classData.description !== undefined) updates.push('description = ?'), values.push(classData.description);
    if (classData.highlights !== undefined) updates.push('highlights = ?'), values.push(classData.highlights);
    if (classData.equipment !== undefined) updates.push('equipment = ?'), values.push(classData.equipment);
    if (classData.prerequisites !== undefined) updates.push('prerequisites = ?'), values.push(classData.prerequisites);
    if (classData.active !== undefined) updates.push('active = ?'), values.push(classData.active);
    
    if (updates.length === 0) {
      return await getClassById(classId);
    }
    
    values.push(classId, tenantId);
    await conn.query(
      `UPDATE training_classes SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
      values
    );
    return await getClassById(classId);
  } finally {
    conn.release();
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get sessions for a class
 * @param {string} classId - Class ID
 * @param {boolean} futureOnly - Only return future sessions
 * @returns {Promise<Array>} Array of sessions
 */
async function getClassSessions(classId, futureOnly = true) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    let query = 'SELECT * FROM training_class_sessions WHERE class_id = ? AND tenant_id = ?';
    const params = [classId, tenantId];
    
    if (futureOnly) {
      query += ' AND date >= CURDATE() AND status = "scheduled"';
    }
    
    query += ' ORDER BY date, start_time';
    
    const [rows] = await conn.query(query, params);
    return rows;
  } finally {
    conn.release();
  }
}

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session object or null
 */
async function getSessionById(sessionId) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT * FROM training_class_sessions WHERE id = ? AND tenant_id = ?',
      [sessionId, tenantId]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

/**
 * Create or update a session
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} Created/updated session
 */
async function upsertSession(sessionData) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Check if session exists
    const [existing] = await conn.query(
      'SELECT id, max_seats, available_seats FROM training_class_sessions WHERE id = ? AND tenant_id = ?',
      [sessionData.id, tenantId]
    );
    
    const isUpdate = existing.length > 0;
    let availableSeats;
    
    if (isUpdate) {
      const oldMaxSeats = existing[0].max_seats;
      const oldAvailableSeats = existing[0].available_seats;
      const newMaxSeats = sessionData.max_seats || 12;
      
      if (newMaxSeats < oldMaxSeats) {
        const reduction = oldMaxSeats - newMaxSeats;
        availableSeats = Math.max(0, oldAvailableSeats - reduction);
      } else {
        availableSeats = oldAvailableSeats;
      }
    } else {
      availableSeats = sessionData.max_seats || 12;
    }
    
    await conn.query(
      `INSERT INTO training_class_sessions 
       (id, tenant_id, class_id, date, start_time, end_time, location, instructor, max_seats, available_seats, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       date = VALUES(date),
       start_time = VALUES(start_time),
       end_time = VALUES(end_time),
       location = VALUES(location),
       instructor = VALUES(instructor),
       max_seats = VALUES(max_seats),
       available_seats = VALUES(available_seats),
       status = VALUES(status)`,
      [
        sessionData.id,
        tenantId,
        sessionData.class_id,
        sessionData.date,
        sessionData.start_time,
        sessionData.end_time,
        sessionData.location || null,
        sessionData.instructor || null,
        sessionData.max_seats || 12,
        availableSeats,
        sessionData.status || 'scheduled'
      ]
    );
    
    await conn.commit();
    return await getSessionById(sessionData.id);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
async function deleteSession(sessionId) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'DELETE FROM training_class_sessions WHERE id = ? AND tenant_id = ?',
      [sessionId, tenantId]
    );
  } finally {
    conn.release();
  }
}

// ============================================================================
// REGISTRATION MANAGEMENT
// ============================================================================

/**
 * Create a new registration
 * @param {Object} registrationData - Registration data
 * @returns {Promise<Object>} Created registration
 */
async function createRegistration(registrationData) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    // Insert registration
    const [result] = await conn.query(
      `INSERT INTO training_registrations 
       (tenant_id, transaction_id, class_id, session_id, first_name, last_name, email, phone, 
        experience_level, amount, status, auth_code, waiver_accepted, rules_accepted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        registrationData.transaction_id,
        registrationData.class_id,
        registrationData.session_id,
        registrationData.first_name,
        registrationData.last_name,
        registrationData.email,
        registrationData.phone,
        registrationData.experience_level,
        registrationData.amount,
        registrationData.status || 'confirmed',
        registrationData.auth_code || null,
        registrationData.waiver_accepted || false,
        registrationData.rules_accepted || false
      ]
    );
    
    // Update available seats
    await conn.query(
      'UPDATE training_class_sessions SET available_seats = available_seats - 1 WHERE id = ? AND tenant_id = ?',
      [registrationData.session_id, tenantId]
    );
    
    // Check if session is now full
    const [session] = await conn.query(
      'SELECT available_seats FROM training_class_sessions WHERE id = ? AND tenant_id = ?',
      [registrationData.session_id, tenantId]
    );
    
    if (session[0] && session[0].available_seats <= 0) {
      await conn.query(
        'UPDATE training_class_sessions SET status = "full" WHERE id = ? AND tenant_id = ?',
        [registrationData.session_id, tenantId]
      );
    }
    
    await conn.commit();
    
    // Fetch created registration
    const [registration] = await conn.query(
      'SELECT * FROM training_registrations WHERE id = ?',
      [result.insertId]
    );
    
    return registration[0];
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Get all registrations with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of registrations
 */
async function getRegistrations(filters = {}) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    let query = `SELECT r.*, c.name as class_name, cs.date, cs.start_time, cs.end_time, cs.location
                 FROM training_registrations r
                 JOIN training_classes c ON r.class_id = c.id AND r.tenant_id = c.tenant_id
                 JOIN training_class_sessions cs ON r.session_id = cs.id AND r.tenant_id = cs.tenant_id
                 WHERE r.tenant_id = ?`;
    
    const params = [tenantId];
    
    if (filters.class_id) {
      query += ' AND r.class_id = ?';
      params.push(filters.class_id);
    }
    if (filters.session_id) {
      query += ' AND r.session_id = ?';
      params.push(filters.session_id);
    }
    if (filters.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }
    if (filters.email) {
      query += ' AND r.email = ?';
      params.push(filters.email);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const [rows] = await conn.query(query, params);
    return rows;
  } finally {
    conn.release();
  }
}

/**
 * Update registration status
 * @param {number} registrationId - Registration ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
async function updateRegistrationStatus(registrationId, status) {
  const tenantId = getTenantContext();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'UPDATE training_registrations SET status = ? WHERE id = ? AND tenant_id = ?',
      [status, registrationId, tenantId]
    );
  } finally {
    conn.release();
  }
}

module.exports = {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  
  // Classes
  getClasses,
  getClassById,
  createClass,
  updateClass,
  
  // Sessions
  getClassSessions,
  getSessionById,
  upsertSession,
  deleteSession,
  
  // Registrations
  createRegistration,
  getRegistrations,
  updateRegistrationStatus
};
