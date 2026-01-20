const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.post('/analyze', auth, aiController.triggerAnalysis);
router.get('/reports', auth, aiController.getReports);
router.get('/reports/:id', auth, aiController.getReportById);
router.post('/chat', auth, aiController.sendChat);

module.exports = router;
