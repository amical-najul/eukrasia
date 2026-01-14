const express = require('express');
const router = express.Router();
const multer = require('multer');
const metabolicController = require('../controllers/metabolicController');
const protect = require('../middleware/authMiddleware');

// Multer config (Memory Storage for Sharp processing)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protect all routes
router.use(protect);

router.post('/log', upload.single('image'), metabolicController.logEvent);
router.get('/status', metabolicController.getStatus);
router.get('/history', metabolicController.getHistory);
router.delete('/log/:id', metabolicController.deleteEvent); // New delete endpoint

module.exports = router;
