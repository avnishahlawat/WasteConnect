import { User } from '../models/User.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { PublicIssue } from '../models/PublicIssue.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { Feedback } from '../models/Feedback.js';
import { CollectorProfile } from '../models/CollectorProfile.js';
import { Notification } from '../models/Notification.js';
import { Announcement } from '../models/Announcement.js';
import { PickupStatus, IssueStatus, UserRole, HotspotLevel } from '../types/enums.js';
import mongoose from 'mongoose';
export const dashboardService = {
    async getCitizenDashboard(citizenId) {
        const userId = new mongoose.Types.ObjectId(citizenId);
        const [totalPickups, activePickups, completedPickups, totalIssues, resolvedIssues, recentPickups, recentIssues, announcements, unreadNotificationsCount,] = await Promise.all([
            PickupRequest.countDocuments({ citizen: userId }),
            PickupRequest.countDocuments({
                citizen: userId,
                status: { $in: [PickupStatus.PENDING, PickupStatus.AVAILABLE, PickupStatus.ASSIGNED, PickupStatus.ACCEPTED, PickupStatus.IN_PROGRESS] },
            }),
            PickupRequest.countDocuments({ citizen: userId, status: PickupStatus.COMPLETED }),
            PublicIssue.countDocuments({ reporter: userId }),
            PublicIssue.countDocuments({ reporter: userId, status: { $in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] } }),
            PickupRequest.find({ citizen: userId })
                .populate('wasteCategory')
                .populate('assignedCollector', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .limit(5),
            PublicIssue.find({ reporter: userId })
                .populate('serviceArea')
                .sort({ createdAt: -1 })
                .limit(5),
            Announcement.find({ isActive: true, targetRole: { $in: ['ALL', UserRole.CITIZEN] } })
                .sort({ publishedAt: -1 })
                .limit(3),
            Notification.countDocuments({ recipient: userId, isRead: false }),
        ]);
        return {
            metrics: {
                totalPickups,
                activePickups,
                completedPickups,
                totalIssues,
                resolvedIssues,
                resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100,
                unreadNotificationsCount,
            },
            recentPickups,
            recentIssues,
            announcements,
        };
    },
    async getCollectorDashboard(collectorId) {
        const userId = new mongoose.Types.ObjectId(collectorId);
        const profile = await CollectorProfile.findOne({ user: userId });
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [assignedPickups, todayCompleted, inProgressPickups, availableInArea, recentAssignments, recentFeedback,] = await Promise.all([
            PickupRequest.countDocuments({
                assignedCollector: userId,
                status: { $in: [PickupStatus.ACCEPTED, PickupStatus.SCHEDULED, PickupStatus.IN_PROGRESS] },
            }),
            PickupRequest.countDocuments({
                assignedCollector: userId,
                status: PickupStatus.COMPLETED,
                completedAt: { $gte: todayStart },
            }),
            PickupRequest.countDocuments({
                assignedCollector: userId,
                status: PickupStatus.IN_PROGRESS,
            }),
            PickupRequest.countDocuments({
                status: { $in: [PickupStatus.AVAILABLE, PickupStatus.PENDING] },
                ...(profile?.serviceAreas?.length ? { serviceArea: { $in: profile.serviceAreas } } : {}),
            }),
            PickupRequest.find({ assignedCollector: userId })
                .populate('wasteCategory')
                .populate('serviceArea')
                .populate('citizen', 'firstName lastName phone')
                .sort({ preferredDate: 1, createdAt: -1 })
                .limit(6),
            Feedback.find({ collector: userId })
                .populate('citizen', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .limit(4),
        ]);
        return {
            profile: {
                availability: profile?.availability || 'AVAILABLE',
                rating: profile?.rating || 5.0,
                totalRatings: profile?.totalRatings || 0,
                totalCollections: profile?.totalCollections || 0,
                totalWeightCollected: profile?.totalWeightCollected || 0,
            },
            metrics: {
                assignedPickups,
                todayCompleted,
                inProgressPickups,
                availableInArea,
            },
            recentAssignments,
            recentFeedback,
        };
    },
    async getAuthorityDashboard(authorityId, allowedServiceAreas = []) {
        const areaQuery = allowedServiceAreas.length > 0 ? { serviceArea: { $in: allowedServiceAreas } } : {};
        const [totalReports, underReviewCount, inProgressCount, overdueCount, resolvedCount, criticalHotspots, urgentIssues, hotspotSummary,] = await Promise.all([
            PublicIssue.countDocuments(areaQuery),
            PublicIssue.countDocuments({ ...areaQuery, status: IssueStatus.UNDER_REVIEW }),
            PublicIssue.countDocuments({ ...areaQuery, status: { $in: [IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS] } }),
            PublicIssue.countDocuments({ ...areaQuery, isOverdue: true }),
            PublicIssue.countDocuments({ ...areaQuery, status: { $in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] } }),
            ServiceArea.countDocuments({
                hotspotLevel: HotspotLevel.CRITICAL,
                ...(allowedServiceAreas.length > 0 ? { _id: { $in: allowedServiceAreas } } : {}),
            }),
            PublicIssue.find({
                ...areaQuery,
                status: { $nin: [IssueStatus.RESOLVED, IssueStatus.CLOSED, IssueStatus.REJECTED] },
            })
                .populate('serviceArea')
                .populate('reporter', 'firstName lastName')
                .sort({ isOverdue: -1, priority: -1, createdAt: -1 })
                .limit(6),
            ServiceArea.find(allowedServiceAreas.length > 0 ? { _id: { $in: allowedServiceAreas } } : {})
                .sort({ hotspotScore: -1 })
                .limit(5),
        ]);
        return {
            metrics: {
                totalReports,
                underReviewCount,
                inProgressCount,
                overdueCount,
                resolvedCount,
                criticalHotspots,
                slaComplianceRate: totalReports > 0 ? Math.round(((totalReports - overdueCount) / totalReports) * 100) : 100,
            },
            urgentIssues,
            hotspotSummary,
        };
    },
    async getAdminDashboard() {
        const [totalUsers, totalCollectors, totalAuthorities, totalCitizens, totalPickups, completedPickups, totalIssues, resolvedIssues, criticalHotspots, recentIssues, recentPickups, topHotspots,] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: UserRole.COLLECTOR, isActive: true }),
            User.countDocuments({ role: UserRole.AUTHORITY, isActive: true }),
            User.countDocuments({ role: UserRole.CITIZEN, isActive: true }),
            PickupRequest.countDocuments(),
            PickupRequest.countDocuments({ status: PickupStatus.COMPLETED }),
            PublicIssue.countDocuments(),
            PublicIssue.countDocuments({ status: { $in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] } }),
            ServiceArea.countDocuments({ hotspotLevel: HotspotLevel.CRITICAL }),
            PublicIssue.find().populate('serviceArea').populate('reporter', 'firstName lastName').sort({ createdAt: -1 }).limit(5),
            PickupRequest.find().populate('wasteCategory').populate('serviceArea').sort({ createdAt: -1 }).limit(5),
            ServiceArea.find().sort({ hotspotScore: -1 }).limit(5),
        ]);
        return {
            metrics: {
                totalUsers,
                totalCollectors,
                totalAuthorities,
                totalCitizens,
                totalPickups,
                completedPickups,
                totalIssues,
                resolvedIssues,
                criticalHotspots,
                collectionSuccessRate: totalPickups > 0 ? Math.round((completedPickups / totalPickups) * 100) : 100,
                issueResolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100,
            },
            recentIssues,
            recentPickups,
            topHotspots,
        };
    },
};
