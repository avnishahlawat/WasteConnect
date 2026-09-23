import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Security
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
].filter(Boolean);

if (process.env.CLIENT_URLS) {
    allowedOrigins.push(...process.env.CLIENT_URLS.split(',').map((s) => s.trim()));
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.onrender.com') ||
            config.nodeEnv === 'development'
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Logging
if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}
// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'WasteConnect API is running', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api', routes);
// 404
app.use(notFoundHandler);
// Error handler (must be last)
app.use(errorHandler);
export default app;
