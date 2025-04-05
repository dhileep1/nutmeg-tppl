
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./Database');
const { updateUserTable } = require('./db/user_scripts');
const userRoutes = require('./routes/userRoutes');
const timesheetRoutes = require('./routes/timesheetRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test database connection
testConnection().then(connected => {
  if (connected) {
    // Run database migrations
    updateUserTable().then(updated => {
      if (updated) {
        console.log('Database migrations completed successfully');
      } else {
        console.error('Failed to update database schema');
      }
    });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('NutMeg Time Pulse API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
