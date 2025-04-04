
const db = require('../Database');

// Get all payroll entries
const getPayroll = async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'admin' || req.user.role === 'finance') {
      // Admin/Finance can see all payroll entries
      result = await db.query(
        'SELECT p.*, u.username, u.full_name FROM payroll p JOIN users u ON p.user_id = u.id ORDER BY p.pay_period DESC'
      );
    } else {
      // Regular user can only see their payroll
      result = await db.query(
        'SELECT * FROM payroll WHERE user_id = $1 ORDER BY pay_period DESC',
        [req.user.id]
      );
    }
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Payroll retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving payroll' });
  }
};

// Get specific payroll by id
const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query with permission check
    let result;
    if (req.user.role === 'admin' || req.user.role === 'finance') {
      result = await db.query('SELECT * FROM payroll WHERE id = $1', [id]);
    } else {
      result = await db.query('SELECT * FROM payroll WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Payroll retrieval error:', error);
    res.status(500).json({ message: 'Server error retrieving payroll record' });
  }
};

// Generate payroll (admin only)
const generatePayroll = async (req, res) => {
  try {
    const { payPeriodStart, payPeriodEnd, userId } = req.body;
    
    // Check if user is admin or finance
    if (req.user.role !== 'admin' && req.user.role !== 'finance') {
      return res.status(403).json({ message: 'Not authorized to generate payroll' });
    }
    
    // If userId is provided, generate for specific user, otherwise for all users
    if (userId) {
      // Check if user exists
      const userExists = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userExists.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Calculate hours worked from timesheets
      const timesheetResult = await db.query(
        'SELECT SUM(hours_worked) as total_hours FROM timesheets WHERE user_id = $1 AND date BETWEEN $2 AND $3',
        [userId, payPeriodStart, payPeriodEnd]
      );
      
      const totalHours = Number(timesheetResult.rows[0].total_hours) || 0;
      
      // Get user's hourly rate
      const userResult = await db.query('SELECT hourly_rate FROM users WHERE id = $1', [userId]);
      const hourlyRate = Number(userResult.rows[0].hourly_rate) || 0;
      
      // Calculate gross pay
      const grossPay = totalHours * hourlyRate;
      
      // Simple tax calculation (example: 20% tax)
      const taxes = grossPay * 0.2;
      const netPay = grossPay - taxes;
      
      // Create payroll record
      const result = await db.query(
        'INSERT INTO payroll (user_id, pay_period_start, pay_period_end, total_hours, gross_pay, taxes, net_pay, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
        [userId, payPeriodStart, payPeriodEnd, totalHours, grossPay, taxes, netPay, 'processed']
      );
      
      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } else {
      // Generate for all users
      // Get all users
      const usersResult = await db.query('SELECT id, hourly_rate FROM users');
      
      const payrollRecords = [];
      
      for (const user of usersResult.rows) {
        // Calculate hours worked from timesheets
        const timesheetResult = await db.query(
          'SELECT SUM(hours_worked) as total_hours FROM timesheets WHERE user_id = $1 AND date BETWEEN $2 AND $3',
          [user.id, payPeriodStart, payPeriodEnd]
        );
        
        const totalHours = Number(timesheetResult.rows[0].total_hours) || 0;
        const hourlyRate = Number(user.hourly_rate) || 0;
        
        // Calculate gross pay
        const grossPay = totalHours * hourlyRate;
        
        // Simple tax calculation (example: 20% tax)
        const taxes = grossPay * 0.2;
        const netPay = grossPay - taxes;
        
        // Create payroll record
        const result = await db.query(
          'INSERT INTO payroll (user_id, pay_period_start, pay_period_end, total_hours, gross_pay, taxes, net_pay, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
          [user.id, payPeriodStart, payPeriodEnd, totalHours, grossPay, taxes, netPay, 'processed']
        );
        
        payrollRecords.push(result.rows[0]);
      }
      
      res.status(201).json({
        success: true,
        count: payrollRecords.length,
        data: payrollRecords
      });
    }
  } catch (error) {
    console.error('Payroll generation error:', error);
    res.status(500).json({ message: 'Server error generating payroll' });
  }
};

module.exports = {
  getPayroll,
  getPayrollById,
  generatePayroll
};
