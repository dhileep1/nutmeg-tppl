
const express = require('express');
const { 
  requestLeave, 
  getLeaveRequests, 
  getLeaveRequestById, 
  updateLeaveRequest, 
  deleteLeaveRequest 
} = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', requestLeave);
router.get('/', getLeaveRequests);
router.get('/:id', getLeaveRequestById);
router.put('/:id', updateLeaveRequest);
router.delete('/:id', deleteLeaveRequest);

module.exports = router;
