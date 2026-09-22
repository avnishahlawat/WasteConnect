import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { WasteCategory } from '../models/WasteCategory';
import { ServiceArea } from '../models/ServiceArea';
import { Notification } from '../models/Notification';
import { Announcement } from '../models/Announcement';
import { aiService } from '../services/aiService';

const router = Router();

router.get('/categories', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await WasteCategory.find({ active: true }).sort({ name: 1 });
  sendSuccess(res, categories);
}));

router.get('/service-areas', asyncHandler(async (_req: Request, res: Response) => {
  const areas = await ServiceArea.find({ isActive: true }).sort({ hotspotScore: -1 });
  sendSuccess(res, areas);
}));

router.get('/notifications', asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ recipient: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(50);
  sendSuccess(res, notifications);
}));

router.put('/notifications/:id/read', asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user!._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  sendSuccess(res, notification);
}));

router.put('/notifications/read-all', asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { recipient: req.user!._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  sendSuccess(res, null, 'All notifications marked as read');
}));

router.get('/announcements', asyncHandler(async (req: Request, res: Response) => {
  const announcements = await Announcement.find({
    isActive: true,
    targetRole: { $in: ['ALL', req.user!.role] },
  }).sort({ publishedAt: -1 });
  sendSuccess(res, announcements);
}));

router.post('/ai/classify-issue', asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body;
  const result = await aiService.getProvider().classifyIssue(description || '', title || '');
  sendSuccess(res, result);
}));

export default router;
