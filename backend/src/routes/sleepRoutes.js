const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleepController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', sleepController.startSleep);
router.get('/status', sleepController.getStatus);
router.get('/history', sleepController.getHistory);
router.put('/end', sleepController.endSleep);

module.exports = router;
