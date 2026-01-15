const express = require('express');
const router = express.Router();
const mindController = require('../controllers/mindController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Session endpoints
router.post('/session', mindController.saveSession);
router.get('/history', mindController.getHistory);

// Configuration endpoints
router.get('/config', mindController.getConfig);
router.post('/config', mindController.saveConfig);

module.exports = router;
