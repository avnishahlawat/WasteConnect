import { WasteRecord } from '../models/WasteRecord';
import { PublicIssue } from '../models/PublicIssue';
import { ServiceArea } from '../models/ServiceArea';
import { CollectorProfile } from '../models/CollectorProfile';
import { IssueStatus } from '../types/enums';

export const analyticsService = {
  async getWasteTrends(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await WasteRecord.aggregate([
      { $match: { collectedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$collectedAt' },
            month: { $month: '$collectedAt' },
          },
          totalWeight: { $sum: '$actualQuantity' },
          collectionsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const categoryBreakdown = await WasteRecord.aggregate([
      { $match: { collectedAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'wastecategories',
          localField: 'wasteCategory',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          color: { $first: '$categoryInfo.color' },
          totalWeight: { $sum: '$actualQuantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalWeight: -1 } },
    ]);

    return { trends, categoryBreakdown };
  },

  async getIssueTrends(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const issuesByMonth = await PublicIssue.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalReported: { $sum: 1 },
          totalResolved: {
            $sum: {
              $cond: [{ $in: ['$status', [IssueStatus.RESOLVED, IssueStatus.CLOSED]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const issuesByCategory = await PublicIssue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          unresolved: {
            $sum: {
              $cond: [{ $in: ['$status', [IssueStatus.RESOLVED, IssueStatus.CLOSED, IssueStatus.REJECTED]] }, 0, 1],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { issuesByMonth, issuesByCategory };
  },

  async getAreaComparison() {
    const areas = await ServiceArea.find({ isActive: true });

    const stats = await Promise.all(
      areas.map(async (area) => {
        const totalIssues = await PublicIssue.countDocuments({ serviceArea: area._id });
        const resolvedIssues = await PublicIssue.countDocuments({
          serviceArea: area._id,
          status: { $in: [IssueStatus.RESOLVED, IssueStatus.CLOSED] },
        });
        const overdueCount = await PublicIssue.countDocuments({
          serviceArea: area._id,
          isOverdue: true,
        });

        return {
          id: area._id,
          name: area.name,
          hotspotScore: area.hotspotScore,
          hotspotLevel: area.hotspotLevel,
          totalIssues,
          resolvedIssues,
          overdueCount,
          resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100,
        };
      })
    );

    return stats;
  },

  async getCollectorPerformance() {
    const collectors = await CollectorProfile.find()
      .populate('user', 'firstName lastName email avatar')
      .sort({ totalCollections: -1 })
      .limit(10);

    return collectors.map((c) => ({
      id: c._id,
      name: (c.user as unknown as { firstName: string; lastName: string })?.firstName
        ? `${(c.user as unknown as { firstName: string; lastName: string }).firstName} ${(c.user as unknown as { firstName: string; lastName: string }).lastName}`
        : 'Collector',
      rating: c.rating,
      totalRatings: c.totalRatings,
      totalCollections: c.totalCollections,
      totalWeightCollected: c.totalWeightCollected,
      availability: c.availability,
    }));
  },
};
