const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Auth middleware should have already run and populated req.user
    // But we check just in case
    if (!req.user) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    next();
};
