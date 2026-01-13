const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// All routes require admin access
router.get('/', auth, admin, templateController.getAllTemplates);
router.get('/:key', auth, admin, templateController.getTemplate);
router.put('/:key', auth, admin, templateController.updateTemplate);

module.exports = router;
