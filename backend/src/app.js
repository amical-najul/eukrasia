const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers (Helmet)
app.set('trust proxy', 1); // Trust first proxy (Traefik) for correct IP identification
app.use(helmet());

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.' }
});

// Apply to all requests
app.use(limiter);

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8090',
    'http://localhost:8080'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/translations', require('./routes/translationRoutes'));

// Basic Health Check
app.get('/', (req, res) => {
    res.send('API Backend Running');
});

// Error Middleware
app.use(errorHandler);

module.exports = app;
