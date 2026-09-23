import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { issueService } from '../services/issueService.js';
import { hotspotService } from '../services/hotspotService.js';
import { dashboardService } from '../services/dashboardService.js';
import { analyticsService } from '../services/analyticsService.js';
import { AuthorityProfile } from '../models/AuthorityProfile.js';
import { Announcement } from '../models/Announcement.js';
import { z } from 'zod';
import { IssueStatus, Priority, Severity } from '../types/enums.js';
const triageSchema = z.object({
    status: z.enum([
        IssueStatus.UNDER_REVIEW,
        IssueStatus.VERIFIED,
        IssueStatus.ASSIGNED,
        IssueStatus.REJECTED,
        IssueStatus.DUPLICATE,
    ]).optional(),
    priority: z.enum([Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL]).optional(),
    severity: z.enum([Severity.LOW, Severity.MODERATE, Severity.HIGH, Severity.CRITICAL]).optional(),
    assignedTeam: z.string().optional(),
    internalNotes: z.string().optional(),
    duplicateOf: z.string().optional(),
});
const assignSchema = z.object({
    assignedAuthority: z.string().min(1),
    assignedTeam: z.string().optional(),
});
const resolveSchema = z.object({
    resolutionNotes: z.string().min(5),
    resolutionEvidence: z.array(z.string()).optional(),
});
const announcementSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(10),
    type: z.enum(['INFO', 'WARNING', 'ALERT', 'SCHEDULE']),
    targetRole: z.enum(['ALL', 'CITIZEN', 'COLLECTOR', 'AUTHORITY']).default('ALL'),
    targetServiceArea: z.string().optional(),
});
export const authorityController = {
    getDashboard: asyncHandler(async (req, res) => {
        const profile = await AuthorityProfile.findOne({ user: req.user._id });
        const allowedAreas = profile?.serviceAreas.map((id) => id.toString()) || [];
        const data = await dashboardService.getAuthorityDashboard(req.user._id.toString(), allowedAreas);
        sendSuccess(res, data);
    }),
    getIssues: asyncHandler(async (req, res) => {
        const profile = await AuthorityProfile.findOne({ user: req.user._id });
        const allowedAreas = profile?.serviceAreas.map((id) => id.toString()) || [];
        const { status, severity, priority, isOverdue, serviceArea, city, onlyMyAreas, search, page, limit } = req.query;
        const result = await issueService.getIssues({
            allowedServiceAreas: allowedAreas,
            onlyMyAreas: onlyMyAreas === 'true',
            serviceArea: serviceArea,
            city: city,
            status: status,
            severity: severity,
            priority: priority,
            isOverdue: isOverdue === 'true' ? true : isOverdue === 'false' ? false : undefined,
            search: search,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
        sendSuccess(res, result.issues, 'Issues retrieved', 200, result.meta);
    }),
    getIssueById: asyncHandler(async (req, res) => {
        const result = await issueService.getIssueById(req.params.id, req.user.role);
        sendSuccess(res, result);
    }),
    triageIssue: asyncHandler(async (req, res) => {
        const body = triageSchema.parse(req.body);
        const issue = await issueService.triageIssue(req.params.id, req.user._id.toString(), body);
        sendSuccess(res, issue, 'Issue triaged successfully');
    }),
    assignIssue: asyncHandler(async (req, res) => {
        const body = assignSchema.parse(req.body);
        const issue = await issueService.assignIssue(req.params.id, req.user._id.toString(), body.assignedAuthority, body.assignedTeam);
        sendSuccess(res, issue, 'Issue assigned successfully');
    }),
    resolveIssue: asyncHandler(async (req, res) => {
        const body = resolveSchema.parse(req.body);
        const issue = await issueService.resolveIssue(req.params.id, req.user._id.toString(), body);
        sendSuccess(res, issue, 'Issue resolved successfully');
    }),
    getHotspots: asyncHandler(async (_req, res) => {
        const summary = await hotspotService.getHotspotSummary();
        sendSuccess(res, summary);
    }),
    recalculateHotspots: asyncHandler(async (_req, res) => {
        const details = await hotspotService.recalculateAll();
        sendSuccess(res, details, 'Hotspot scores recalculated successfully');
    }),
    getAnalytics: asyncHandler(async (_req, res) => {
        const [wasteStats, issueStats, areaStats] = await Promise.all([
            analyticsService.getWasteTrends(6),
            analyticsService.getIssueTrends(6),
            analyticsService.getAreaComparison(),
        ]);
        sendSuccess(res, { wasteStats, issueStats, areaStats });
    }),
    createAnnouncement: asyncHandler(async (req, res) => {
        const body = announcementSchema.parse(req.body);
        const announcement = await Announcement.create({
            author: req.user._id,
            ...body,
            publishedAt: new Date(),
        });
        sendSuccess(res, announcement, 'Announcement published successfully', 201);
    }),
    getAnnouncements: asyncHandler(async (_req, res) => {
        const announcements = await Announcement.find({ isActive: true })
            .populate('author', 'firstName lastName')
            .populate('targetServiceArea', 'name')
            .sort({ publishedAt: -1 });
        sendSuccess(res, announcements);
    }),
};
