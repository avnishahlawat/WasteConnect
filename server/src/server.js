import app from './app.js';
import { connectDatabase } from './config/database.js';
import { config } from './config/index.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';
import { UserRole } from './types/enums.js';

const initDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({
            $or: [{ email: 'admin@wasteconnect.in' }, { email: 'admin@wasteconnect.io' }],
        });
        if (!adminExists) {
            console.log('⚡ Initializing default Admin accounts...');
            const hashedPassword = await bcrypt.hash('Admin@123!', 12);
            await User.create([
                {
                    email: 'admin@wasteconnect.in',
                    password: hashedPassword,
                    role: UserRole.ADMIN,
                    firstName: 'Rajiv',
                    lastName: 'Mehta (Admin)',
                    isActive: true,
                    isEmailVerified: true,
                },
                {
                    email: 'admin@wasteconnect.io',
                    password: hashedPassword,
                    role: UserRole.ADMIN,
                    firstName: 'System',
                    lastName: 'Admin',
                    isActive: true,
                    isEmailVerified: true,
                }
            ]);
            console.log('✅ Default Admin accounts verified (admin@wasteconnect.in / Admin@123!)');
        }
    } catch (err) {
        console.error('Note on default admin initialization:', err.message);
    }
};

const startServer = async () => {
    try {
        await connectDatabase();
        await initDefaultAdmin();
        const server = app.listen(config.port, () => {
            console.log(`WasteConnect API running on port ${config.port} [${config.nodeEnv}]`);
            console.log(`Health: http://localhost:${config.port}/api/health`);
        });
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                const { disconnectDatabase } = await import('./config/database.js');
                await disconnectDatabase();
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
