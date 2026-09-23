import { Router } from 'express';
import authRoutes from './auth.js';
import citizenRoutes from './citizen.js';
import collectorRoutes from './collector.js';
import authorityRoutes from './authority.js';
import adminRoutes from './admin.js';
import sharedRoutes from './shared.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '../types/enums.js';
import { PublicIssue } from '../models/PublicIssue.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();
router.use('/auth', authRoutes);

// Unauthenticated public stats endpoint for real-time landing page counters
router.get('/public-stats', asyncHandler(async (_req, res) => {
    const totalIssues = await PublicIssue.countDocuments();
    const resolvedIssues = await PublicIssue.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });
    const serviceAreasCount = await ServiceArea.countDocuments({ isActive: true });
    const activeCollectors = await User.countDocuments({ role: UserRole.COLLECTOR, isActive: true });
    const completedPickups = await PickupRequest.countDocuments({ status: 'COMPLETED' });
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

    sendSuccess(res, {
        totalIssues,
        resolvedIssues,
        resolutionRate,
        serviceAreasCount: serviceAreasCount || 5,
        activeCollectors: activeCollectors || 4,
        completedPickups,
    });
}));

router.use('/citizen', authenticate, authorize(UserRole.CITIZEN), citizenRoutes);
router.use('/collector', authenticate, authorize(UserRole.COLLECTOR), collectorRoutes);
router.use('/authority', authenticate, authorize(UserRole.AUTHORITY), authorityRoutes);
router.use('/admin', authenticate, authorize(UserRole.ADMIN), adminRoutes);
router.use('/', authenticate, sharedRoutes);
export default router;
