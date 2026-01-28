const express = require('express');
const router = express.Router();
const supplementController = require('../controllers/supplementController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.get('/log', supplementController.getDailyLog);
router.post('/log', supplementController.toggleLog);

module.exports = router;
