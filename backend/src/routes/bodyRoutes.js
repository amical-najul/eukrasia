const express = require('express');
const router = express.Router();
const bodyController = require('../controllers/bodyController');
const authenticateToken = require('../middleware/authMiddleware');

// All routes are protected
router.use(authenticateToken);

// GET
router.get('/summary', bodyController.getSummary);
router.get('/history', bodyController.getHistory);

// POST
router.post('/log/weight', bodyController.logWeight);
router.post('/log/measurement', bodyController.logMeasurement);
router.post('/goal', bodyController.setGoal);

module.exports = router;
