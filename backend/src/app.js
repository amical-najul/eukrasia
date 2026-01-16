const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers (Helmet) - Adjusted for development
app.set('trust proxy', 1); // Trust first proxy (Traefik) for correct IP identification
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development to avoid blocking
    crossOriginEmbedderPolicy: false // Disable for development
}));
app.use(cookieParser());

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.' }
});

// Apply to all requests
app.use(limiter);

// Middleware - CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:8090',
    'http://localhost:8080',
    'http://localhost:3000' // Add common dev ports
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // In development, be more permissive
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/translations', require('./routes/translationRoutes'));
app.use('/api/breathing', require('./routes/breathingRoutes'));
app.use('/api/metabolic', require('./routes/metabolicRoutes'));
app.use('/api/sleep', require('./routes/sleepRoutes'));
app.use('/api/mind', require('./routes/mindRoutes'));
app.use('/api/body', require('./routes/bodyRoutes'));

// Basic Health Check
app.get('/', (req, res) => {
    res.send('API Backend Running');
});

// Error Middleware
app.use(errorHandler);

module.exports = app;
