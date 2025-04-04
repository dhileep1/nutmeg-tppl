
const db = require('../Database');

// Create a new timesheet entry
const createTimesheet = async (req, res) => {
  try {
    const { date, hoursWorked, projectId, description } = req.body;
    const userId = req.user.id;
    
    const result = await db.query(
      'INSERT INTO timesheets (user_id, date, hours_worked, project_id, description, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, date, hoursWorked, projectId, description]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Timesheet creation error:', error);
    res.status(500).json({ message: 'Server error creating timesheet' });
  }
};

// Get all timesheets for user or all (for admin)
const getTimesheets = async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'admin') {
      // Admin can see all timesheets
      result = await db.query(
        'SELECT t.*, u.username, u.full_name FROM timesheets t JOIN users u ON t.user_id = u.id ORDER BY t.date DESC'
      );
    } else {
      // Regular user can only see their timesheets
      result = await db.query(
        'SELECT * FROM timesheets WHERE user_id = $1 ORDER BY date DESC',
        [req.user.id]
      );
    }
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Timesheet retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving timesheets' });
  }
};

// Get specific timesheet by id
const getTimesheetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query with permission check (admin sees all, users see only their own)
    let result;
    if (req.user.role === 'admin') {
      result = await db.query('SELECT * FROM timesheets WHERE id = $1', [id]);
    } else {
      result = await db.query('SELECT * FROM timesheets WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Timesheet retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving timesheet' });
  }
};

// Update timesheet
const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hoursWorked, projectId, description } = req.body;
    
    // Check if timesheet exists and user has permission
    let checkResult;
    if (req.user.role === 'admin') {
      checkResult = await db.query('SELECT * FROM timesheets WHERE id = $1', [id]);
    } else {
      checkResult = await db.query('SELECT * FROM timesheets WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Timesheet not found or unauthorized' });
    }
    
    // Update the timesheet
    const result = await db.query(
      'UPDATE timesheets SET date = $1, hours_worked = $2, project_id = $3, description = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [date, hoursWorked, projectId, description, id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Timesheet update error:', error);
    res.status(500).json({ message: 'Server error updating timesheet' });
  }
};

// Delete timesheet
const deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if timesheet exists and user has permission
    let checkResult;
    if (req.user.role === 'admin') {
      checkResult = await db.query('SELECT * FROM timesheets WHERE id = $1', [id]);
    } else {
      checkResult = await db.query('SELECT * FROM timesheets WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Timesheet not found or unauthorized' });
    }
    
    // Delete the timesheet
    await db.query('DELETE FROM timesheets WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Timesheet deletion error:', error);
    res.status(500).json({ message: 'Server error deleting timesheet' });
  }
};

module.exports = {
  createTimesheet,
  getTimesheets,
  getTimesheetById,
  updateTimesheet,
  deleteTimesheet
};
