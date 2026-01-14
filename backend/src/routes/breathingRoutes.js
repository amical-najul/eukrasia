const express = require('express');
const router = express.Router();
const breathingController = require('../controllers/breathingController');
const authMiddleware = require('../middleware/authMiddleware'); // Asumiendo existencia de middleware de auth

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/session', breathingController.saveSession);
router.get('/history', breathingController.getHistory);

module.exports = router;
