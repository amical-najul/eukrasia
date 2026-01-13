const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Maintenance Routes
router.post('/maintenance/analysis', auth, admin, maintenanceController.analyzeOrphanedFiles);
router.post('/maintenance/cleanup', auth, admin, maintenanceController.cleanupOrphanedFiles);

const advancedSettingsController = require('../controllers/advancedSettingsController');

// SMTP settings (admin only)
router.get('/smtp', auth, admin, settingsController.getSmtpSettings);
router.put('/smtp', auth, admin, settingsController.updateSmtpSettings);

// Public settings (no auth) - for branding
router.get('/public', settingsController.getPublicSettings);

// OAuth settings (admin only)
router.get('/oauth', auth, admin, settingsController.getOAuthSettings);
router.put('/oauth', auth, admin, settingsController.updateOAuthSettings);

// Public OAuth settings (no auth) - for login page
router.get('/oauth/public', settingsController.getPublicOAuthSettings);

// === ADVANCED SETTINGS (JWT & AI) ===
router.get('/security/jwt', auth, admin, advancedSettingsController.getSecuritySettings);
router.put('/security/jwt', auth, admin, advancedSettingsController.updateJwtSecret);

router.get('/ai', auth, admin, advancedSettingsController.getAiSettings);
router.put('/ai', auth, admin, advancedSettingsController.updateAiSettings);

// Legal content (public - no auth required)
router.get('/legal/:type', settingsController.getLegalContent);

// Favicon upload (admin only)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
router.post('/favicon', auth, admin, upload.single('favicon'), settingsController.uploadFavicon);

module.exports = router;
