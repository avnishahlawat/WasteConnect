import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();
export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wasteconnect',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    upload: {
        maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
        maxFilesPerRequest: parseInt(process.env.MAX_FILES_PER_REQUEST || '5', 10),
        uploadDir: process.env.UPLOAD_DIR || 'uploads',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
    ai: {
        provider: (process.env.AI_PROVIDER || 'mock'),
        openaiApiKey: process.env.OPENAI_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY,
    },
    mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
};
