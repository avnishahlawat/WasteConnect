import { PublicIssue } from '../models/PublicIssue.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { HotspotLevel, IssueStatus, Severity } from '../types/enums.js';
export const hotspotService = {
    getHotspotLevel(score) {
        if (score <= 20)
            return HotspotLevel.LOW;
        if (score <= 40)
            return HotspotLevel.MODERATE;
        if (score <= 60)
            return HotspotLevel.ELEVATED;
        if (score <= 80)
            return HotspotLevel.HIGH;
        return HotspotLevel.CRITICAL;
    },
    async calculateAreaScore(serviceAreaId) {
        const area = await ServiceArea.findById(serviceAreaId);
        if (!area)
            throw new Error('Service area not found');
        const totalIssues = await PublicIssue.countDocuments({ serviceArea: area._id });
        if (totalIssues === 0) {
            return {
                serviceAreaId: area._id.toString(),
                name: area.name,
                totalIssues: 0,
                unresolvedCount: 0,
                unresolvedRatio: 0,
                reportFrequency: 0,
                severityScore: 0,
                recurrenceRate: 0,
                resolutionDelay: 0,
                calculatedScore: 0,
                hotspotLevel: HotspotLevel.LOW,
            };
        }
        // 1. Unresolved Ratio (Active vs Total)
        const unresolvedCount = await PublicIssue.countDocuments({
            serviceArea: area._id,
            status: { $nin: [IssueStatus.RESOLVED, IssueStatus.CLOSED, IssueStatus.REJECTED] },
        });
        const unresolvedRatio = unresolvedCount / totalIssues;
        // 2. Report Frequency (Issues in last 30 days normalized to 0-1, 20+ issues = 1.0)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
        const recentIssues = await PublicIssue.countDocuments({
            serviceArea: area._id,
            createdAt: { $gte: thirtyDaysAgo },
        });
        const reportFrequency = Math.min(1.0, recentIssues / 20);
        // 3. Severity Score (Weighted average of severities)
        const criticalCount = await PublicIssue.countDocuments({ serviceArea: area._id, severity: Severity.CRITICAL });
        const highCount = await PublicIssue.countDocuments({ serviceArea: area._id, severity: Severity.HIGH });
        const moderateCount = await PublicIssue.countDocuments({ serviceArea: area._id, severity: Severity.MODERATE });
        const severityScore = (criticalCount * 1.0 + highCount * 0.75 + moderateCount * 0.4) / totalIssues;
        // 4. Recurrence Rate (Ratio of recurring dumping or duplicates)
        const duplicatesCount = await PublicIssue.countDocuments({ serviceArea: area._id, status: IssueStatus.DUPLICATE });
        const recurrenceRate = Math.min(1.0, (duplicatesCount * 2) / totalIssues + (recentIssues > 10 ? 0.3 : 0));
        // 5. Resolution Delay (Ratio of overdue issues)
        const overdueCount = await PublicIssue.countDocuments({ serviceArea: area._id, isOverdue: true });
        const resolutionDelay = Math.min(1.0, overdueCount / Math.max(1, unresolvedCount));
        // WasteConnect Hotspot Score Formula:
        // (reportFrequency * 0.25 + unresolvedRatio * 0.25 + severityScore * 0.20 + recurrenceRate * 0.15 + resolutionDelay * 0.15) * 100
        const rawScore = (reportFrequency * 0.25 +
            unresolvedRatio * 0.25 +
            severityScore * 0.20 +
            recurrenceRate * 0.15 +
            resolutionDelay * 0.15) *
            100;
        const calculatedScore = Math.min(100, Math.max(0, Math.round(rawScore)));
        const hotspotLevel = this.getHotspotLevel(calculatedScore);
        // Update the service area model
        area.hotspotScore = calculatedScore;
        area.hotspotLevel = hotspotLevel;
        area.hotspotLastCalculated = new Date();
        await area.save();
        return {
            serviceAreaId: area._id.toString(),
            name: area.name,
            totalIssues,
            unresolvedCount,
            unresolvedRatio: Math.round(unresolvedRatio * 100) / 100,
            reportFrequency: Math.round(reportFrequency * 100) / 100,
            severityScore: Math.round(severityScore * 100) / 100,
            recurrenceRate: Math.round(recurrenceRate * 100) / 100,
            resolutionDelay: Math.round(resolutionDelay * 100) / 100,
            calculatedScore,
            hotspotLevel,
        };
    },
    async recalculateAll() {
        const areas = await ServiceArea.find({ isActive: true });
        const results = [];
        for (const area of areas) {
            const details = await this.calculateAreaScore(area._id);
            results.push(details);
        }
        return results;
    },
    async getHotspotSummary() {
        const areas = await ServiceArea.find({ isActive: true }).sort({ hotspotScore: -1 });
        const criticalAreas = areas.filter((a) => a.hotspotLevel === HotspotLevel.CRITICAL);
        const highAreas = areas.filter((a) => a.hotspotLevel === HotspotLevel.HIGH);
        const averageScore = Math.round(areas.reduce((acc, a) => acc + a.hotspotScore, 0) / (areas.length || 1));
        return {
            areas,
            criticalCount: criticalAreas.length,
            highCount: highAreas.length,
            averageScore,
            topHotspot: areas[0] || null,
        };
    },
};
