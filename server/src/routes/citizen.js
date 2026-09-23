import { Router } from 'express';
import { citizenController } from '../controllers/citizenController.js';
const router = Router();
// Dashboard
router.get('/dashboard', citizenController.getDashboard);
// Pickups
router.post('/pickups', citizenController.requestPickup);
router.get('/pickups', citizenController.getPickups);
router.get('/pickups/:id', citizenController.getPickupById);
router.put('/pickups/:id/cancel', citizenController.cancelPickup);
router.post('/pickups/:id/feedback', citizenController.submitFeedback);
// Issues
router.post('/issues', citizenController.reportIssue);
router.get('/issues', citizenController.getMyIssues);
router.get('/issues/:id', citizenController.getIssueById);
router.put('/issues/:id/verify', citizenController.verifyIssueResolution);
// AI classification assistant
router.post('/ai/classify-waste', citizenController.classifyWasteAi);
export default router;
