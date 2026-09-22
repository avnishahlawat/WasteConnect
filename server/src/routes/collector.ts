import { Router } from 'express';
import { collectorController } from '../controllers/collectorController';

const router = Router();

router.get('/dashboard', collectorController.getDashboard);
router.get('/available-pickups', collectorController.getAvailablePickups);
router.get('/pickups', collectorController.getMyPickups);
router.post('/pickups/:id/accept', collectorController.acceptPickup);
router.post('/pickups/:id/start', collectorController.startPickup);
router.post('/pickups/:id/complete', collectorController.completePickup);
router.put('/availability', collectorController.updateAvailability);
router.get('/history', collectorController.getHistory);

export default router;
