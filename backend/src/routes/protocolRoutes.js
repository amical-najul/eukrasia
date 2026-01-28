// Rutas para el Sistema de Protocolos
const express = require('express');
const router = express.Router();
const protocolController = require('../controllers/protocolController');
const protect = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas públicas de protocolos
router.get('/', protocolController.getProtocols);
router.get('/active', protocolController.getActiveProtocol);
router.get('/:id', protocolController.getProtocolById);

// Acciones sobre protocolos
router.post('/:id/start', protocolController.startProtocol);
router.post('/active/log', protocolController.logTask);
router.post('/active/unlog', protocolController.unlogTask);
router.put('/active/abandon', protocolController.abandonProtocol);
router.put('/active/complete', protocolController.completeProtocol);

module.exports = router;
