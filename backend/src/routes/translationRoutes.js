const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public routes (no auth required)
router.get('/languages', translationController.getAvailableLanguages);
router.get('/:lang', translationController.getTranslations);
router.get('/:lang/:category', translationController.getTranslationsByCategory);

// Admin routes (protected)
router.post('/', auth, admin, translationController.upsertTranslation);

module.exports = router;
