import { Router } from 'express';
import authRoutes from './auth';
import citizenRoutes from './citizen';
import collectorRoutes from './collector';
import authorityRoutes from './authority';
import adminRoutes from './admin';
import sharedRoutes from './shared';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/enums';

const router = Router();

router.use('/auth', authRoutes);
router.use('/citizen', authenticate, authorize(UserRole.CITIZEN), citizenRoutes);
router.use('/collector', authenticate, authorize(UserRole.COLLECTOR), collectorRoutes);
router.use('/authority', authenticate, authorize(UserRole.AUTHORITY), authorityRoutes);
router.use('/admin', authenticate, authorize(UserRole.ADMIN), adminRoutes);
router.use('/', authenticate, sharedRoutes);

export default router;
