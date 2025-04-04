
const db = require('../Database');

// Request leave
const requestLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;
    const userId = req.user.id;
    
    const result = await db.query(
      'INSERT INTO leave_requests (user_id, start_date, end_date, leave_type, reason, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [userId, startDate, endDate, leaveType, reason, 'pending']
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ message: 'Server error creating leave request' });
  }
};

// Get all leave requests
const getLeaveRequests = async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admin/Manager can see all leave requests
      result = await db.query(
        'SELECT l.*, u.username, u.full_name FROM leave_requests l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC'
      );
    } else {
      // Regular user can only see their leave requests
      result = await db.query(
        'SELECT * FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
    }
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Leave requests retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving leave requests' });
  }
};

// Get specific leave request by id
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query with permission check
    let result;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      result = await db.query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    } else {
      result = await db.query('SELECT * FROM leave_requests WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Leave request retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving leave request' });
  }
};

// Update leave request
const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, leaveType, reason, status } = req.body;
    
    // Check if leave request exists and user has permission
    let checkResult;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      checkResult = await db.query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    } else {
      // Regular users can only update their own pending requests
      checkResult = await db.query(
        'SELECT * FROM leave_requests WHERE id = $1 AND user_id = $2 AND status = $3', 
        [id, req.user.id, 'pending']
      );
    }
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found or unauthorized' });
    }
    
    // Define what fields can be updated based on role
    let result;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      // Admins/managers can update all fields
      result = await db.query(
        'UPDATE leave_requests SET start_date = $1, end_date = $2, leave_type = $3, reason = $4, status = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
        [startDate, endDate, leaveType, reason, status, id]
      );
    } else {
      // Regular users can only update dates, type and reason, not status
      result = await db.query(
        'UPDATE leave_requests SET start_date = $1, end_date = $2, leave_type = $3, reason = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
        [startDate, endDate, leaveType, reason, id]
      );
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Leave request update error:', error);
    res.status(500).json({ message: 'Server error updating leave request' });
  }
};

// Delete leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if leave request exists and user has permission
    let checkResult;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      checkResult = await db.query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    } else {
      // Regular users can only delete their own pending requests
      checkResult = await db.query(
        'SELECT * FROM leave_requests WHERE id = $1 AND user_id = $2 AND status = $3', 
        [id, req.user.id, 'pending']
      );
    }
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found or unauthorized' });
    }
    
    // Delete the leave request
    await db.query('DELETE FROM leave_requests WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    console.error('Leave request deletion error:', error);
    res.status(500).json({ message: 'Server error deleting leave request' });
  }
};

module.exports = {
  requestLeave,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest
};
