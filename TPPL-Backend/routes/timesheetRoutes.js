
const express = require('express');
const { 
  createTimesheet, 
  getTimesheets, 
  getTimesheetById, 
  updateTimesheet, 
  deleteTimesheet 
} = require('../controllers/timesheetController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTimesheet);
router.get('/', getTimesheets);
router.get('/:id', getTimesheetById);
router.put('/:id', updateTimesheet);
router.delete('/:id', deleteTimesheet);

module.exports = router;
