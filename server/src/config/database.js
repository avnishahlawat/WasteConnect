import mongoose from 'mongoose';
import { config } from './index.js';
export const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
export const disconnectDatabase = async () => {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
};
