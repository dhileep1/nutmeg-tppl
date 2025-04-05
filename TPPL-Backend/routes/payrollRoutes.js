
const express = require('express');
const { 
  getPayroll, 
  getPayrollById,
  generatePayroll 
} = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPayroll);
router.get('/:id', getPayrollById);
router.post('/generate', generatePayroll);

module.exports = router;
