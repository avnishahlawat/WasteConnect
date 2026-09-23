import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { WasteCategory } from '../models/WasteCategory.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { Notification } from '../models/Notification.js';
import { Announcement } from '../models/Announcement.js';
import { aiService } from '../services/aiService.js';
const router = Router();
router.get('/categories', asyncHandler(async (_req, res) => {
    const categories = await WasteCategory.find({ active: true }).sort({ name: 1 });
    sendSuccess(res, categories);
}));
router.get('/service-areas', asyncHandler(async (_req, res) => {
    const areas = await ServiceArea.find({ isActive: true }).sort({ hotspotScore: -1 });
    sendSuccess(res, areas);
}));
router.get('/notifications', asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    sendSuccess(res, notifications);
}));
router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true, readAt: new Date() }, { new: true });
    sendSuccess(res, notification);
}));
router.put('/notifications/read-all', asyncHandler(async (req, res) => {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    sendSuccess(res, null, 'All notifications marked as read');
}));
router.get('/announcements', asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({
        isActive: true,
        targetRole: { $in: ['ALL', req.user.role] },
    }).sort({ publishedAt: -1 });
    sendSuccess(res, announcements);
}));
router.post('/ai/classify-issue', asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const result = await aiService.getProvider().classifyIssue(description || '', title || '');
    sendSuccess(res, result);
}));
export default router;
