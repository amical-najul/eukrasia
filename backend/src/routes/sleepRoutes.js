const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleepController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', sleepController.startSleep);
router.get('/status', sleepController.getStatus);
router.get('/history', sleepController.getHistory);
router.put('/end', sleepController.endSleep);
router.delete('/cancel', sleepController.cancelSleep); // Cancel active session
router.patch('/:id', sleepController.updateSleep);     // Update specific record
router.delete('/:id', sleepController.deleteSleep);    // Delete specific record

module.exports = router;
