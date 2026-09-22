import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router = Router();

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/collectors', adminController.getCollectors);
router.get('/issues', adminController.getAllIssues);
router.get('/pickups', adminController.getAllPickups);
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/service-areas', adminController.createServiceArea);
router.put('/service-areas/:id', adminController.updateServiceArea);
router.post('/categories', adminController.createWasteCategory);
router.put('/categories/:id', adminController.updateWasteCategory);
router.get('/analytics', adminController.getAnalytics);

export default router;
