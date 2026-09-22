import { PublicIssue, type IPublicIssue } from '../models/PublicIssue';
import { IssueEvent } from '../models/IssueEvent';
import { ServiceArea } from '../models/ServiceArea';
import { Notification } from '../models/Notification';
import { CitizenProfile } from '../models/CitizenProfile';
import { issueStateService } from './issueStateService';
import { AppError } from '../utils/AppError';
import {
  IssueStatus,
  Severity,
  Priority,
  VerificationStatus,
  CitizenVerification,
  UserRole,
  NotificationType,
} from '../types/enums';
import mongoose from 'mongoose';

export interface ReportIssueInput {
  category: string;
  title: string;
  description: string;
  photos?: string[];
  address: string;
  coordinates: [number, number];
  serviceArea: string;
  severity?: Severity;
}

export interface TriageIssueInput {
  status?: IssueStatus;
  priority?: Priority;
  severity?: Severity;
  assignedTeam?: string;
  internalNotes?: string;
  duplicateOf?: string;
}

export interface ResolveIssueInput {
  resolutionNotes: string;
  resolutionEvidence?: string[];
}

// SLA standard deadlines (in hours) based on severity
const SLA_HOURS: Record<Severity, number> = {
  [Severity.CRITICAL]: 24,
  [Severity.HIGH]: 48,
  [Severity.MODERATE]: 72,
  [Severity.LOW]: 120,
};

export const issueService = {
  async reportIssue(reporterId: string, input: ReportIssueInput): Promise<IPublicIssue> {
    const severity = input.severity || Severity.MODERATE;
    const slaHours = SLA_HOURS[severity];
    const overdueAt = new Date(Date.now() + slaHours * 3600 * 1000);

    const issue = await PublicIssue.create({
      reporter: reporterId,
      category: input.category,
      title: input.title,
      description: input.description,
      photos: input.photos || [],
      address: input.address,
      location: {
        type: 'Point',
        coordinates: input.coordinates,
      },
      serviceArea: input.serviceArea,
      severity,
      status: IssueStatus.REPORTED,
      priority: severity === Severity.CRITICAL ? Priority.CRITICAL : Priority.MEDIUM,
      overdueAt,
      isOverdue: false,
    });

    await IssueEvent.create({
      issue: issue._id,
      newStatus: IssueStatus.REPORTED,
      actor: reporterId,
      actorRole: UserRole.CITIZEN,
      note: 'Public waste issue reported by citizen',
      isPublic: true,
      timestamp: new Date(),
    });

    // Update citizen profile
    await CitizenProfile.findOneAndUpdate(
      { user: reporterId },
      { $inc: { totalIssuesReported: 1 } }
    );

    // Notify citizen
    await Notification.create({
      recipient: reporterId,
      type: NotificationType.ISSUE_RECEIVED,
      title: 'Issue Report Received',
      message: `Your report "${input.title}" in ${input.address} has been received by municipal operations.`,
      relatedEntityType: 'PublicIssue',
      relatedEntityId: issue._id,
    });

    return issue;
  },

  async getIssues(filters: {
    serviceArea?: string;
    allowedServiceAreas?: string[];
    status?: string;
    severity?: string;
    priority?: string;
    isOverdue?: boolean;
    reporter?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.reporter) query.reporter = filters.reporter;
    if (filters.status) query.status = filters.status;
    if (filters.severity) query.severity = filters.severity;
    if (filters.priority) query.priority = filters.priority;
    if (typeof filters.isOverdue === 'boolean') query.isOverdue = filters.isOverdue;

    if (filters.serviceArea) {
      query.serviceArea = filters.serviceArea;
    } else if (filters.allowedServiceAreas && filters.allowedServiceAreas.length > 0) {
      query.serviceArea = { $in: filters.allowedServiceAreas };
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { address: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [issues, total] = await Promise.all([
      PublicIssue.find(query)
        .populate('serviceArea')
        .populate('reporter', 'firstName lastName email')
        .populate('assignedAuthority', 'firstName lastName designation')
        .sort({ isOverdue: -1, priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PublicIssue.countDocuments(query),
    ]);

    return {
      issues,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getIssueById(issueId: string, userRole?: string) {
    const query = PublicIssue.findById(issueId)
      .populate('serviceArea')
      .populate('reporter', 'firstName lastName phone email avatar')
      .populate('assignedAuthority', 'firstName lastName designation email');

    // Authorities and Admins can see internalNotes
    if (([UserRole.AUTHORITY, UserRole.ADMIN] as string[]).includes(userRole || '')) {
      query.select('+internalNotes');
    }

    const issue = await query;
    if (!issue) throw new AppError('Public issue not found', 404, 'ISSUE_NOT_FOUND');

    const eventsQuery: Record<string, unknown> = { issue: issueId };
    if (userRole === UserRole.CITIZEN) {
      eventsQuery.isPublic = true;
    }

    const events = await IssueEvent.find(eventsQuery)
      .populate('actor', 'firstName lastName role')
      .sort({ timestamp: 1 });

    return { issue, events };
  },

  async triageIssue(issueId: string, authorityId: string, input: TriageIssueInput) {
    const issue = await PublicIssue.findById(issueId);
    if (!issue) throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');

    const updates: Record<string, unknown> = {};
    if (input.priority) updates.priority = input.priority;
    if (input.severity) updates.severity = input.severity;
    if (input.assignedTeam) updates.assignedTeam = input.assignedTeam;
    if (input.internalNotes) updates.internalNotes = input.internalNotes;
    if (input.duplicateOf) {
      updates.duplicateOf = input.duplicateOf;
      updates.status = IssueStatus.DUPLICATE;
    }

    const targetStatus = input.status || (input.duplicateOf ? IssueStatus.DUPLICATE : IssueStatus.UNDER_REVIEW);

    if (targetStatus !== issue.status) {
      await issueStateService.transition(
        issue._id,
        targetStatus,
        authorityId,
        UserRole.AUTHORITY,
        input.internalNotes || 'Issue triaged by municipal authority',
        updates
      );
    } else {
      Object.assign(issue, updates);
      await issue.save();
    }

    // Notify citizen of verification
    await Notification.create({
      recipient: issue.reporter,
      type: NotificationType.ISSUE_STATUS_CHANGED,
      title: 'Issue Status Update',
      message: `Your report "${issue.title}" is now marked as ${targetStatus.replace(/_/g, ' ')}.`,
      relatedEntityType: 'PublicIssue',
      relatedEntityId: issue._id,
    });

    return issue;
  },

  async assignIssue(issueId: string, authorityId: string, targetAuthorityId: string, assignedTeam?: string) {
    const issue = await PublicIssue.findById(issueId);
    if (!issue) throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');

    await issueStateService.transition(
      issue._id,
      IssueStatus.ASSIGNED,
      authorityId,
      UserRole.AUTHORITY,
      `Assigned to officer / team ${assignedTeam || ''}`,
      {
        assignedAuthority: targetAuthorityId,
        assignedTeam,
      }
    );

    // Notify assigned authority
    await Notification.create({
      recipient: targetAuthorityId,
      type: NotificationType.ISSUE_ASSIGNED,
      title: 'New Issue Assignment',
      message: `You have been assigned to coordinate resolution for issue: "${issue.title}".`,
      relatedEntityType: 'PublicIssue',
      relatedEntityId: issue._id,
    });

    return issue;
  },

  async resolveIssue(issueId: string, authorityId: string, input: ResolveIssueInput) {
    const issue = await PublicIssue.findById(issueId);
    if (!issue) throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');

    await issueStateService.transition(
      issue._id,
      IssueStatus.RESOLVED,
      authorityId,
      UserRole.AUTHORITY,
      input.resolutionNotes,
      {
        resolutionNotes: input.resolutionNotes,
        resolutionEvidence: input.resolutionEvidence || [],
        resolvedAt: new Date(),
        citizenVerification: CitizenVerification.PENDING,
      }
    );

    // Update citizen profile resolved counter
    await CitizenProfile.findOneAndUpdate(
      { user: issue.reporter },
      { $inc: { totalIssuesResolved: 1 } }
    );

    // Notify citizen to verify resolution
    await Notification.create({
      recipient: issue.reporter,
      type: NotificationType.ISSUE_RESOLVED,
      title: 'Issue Marked Resolved',
      message: `Municipal officers have marked your report "${issue.title}" as resolved. Please confirm or dispute the resolution.`,
      relatedEntityType: 'PublicIssue',
      relatedEntityId: issue._id,
    });

    return issue;
  },

  async verifyByCitizen(
    issueId: string,
    citizenId: string,
    input: { confirmed: boolean; disputeReason?: string }
  ) {
    const issue = await PublicIssue.findOne({ _id: issueId, reporter: citizenId });
    if (!issue) throw new AppError('Issue not found or unauthorized', 404, 'ISSUE_NOT_FOUND');

    if (input.confirmed) {
      issue.citizenVerification = CitizenVerification.CONFIRMED;
      await issueStateService.transition(
        issue._id,
        IssueStatus.CLOSED,
        citizenId,
        UserRole.CITIZEN,
        'Citizen verified resolution — issue officially closed'
      );
    } else {
      issue.citizenVerification = CitizenVerification.DISPUTED;
      await issueStateService.transition(
        issue._id,
        IssueStatus.REOPENED,
        citizenId,
        UserRole.CITIZEN,
        input.disputeReason || 'Citizen disputed resolution'
      );

      // Alert assigned authority
      if (issue.assignedAuthority) {
        await Notification.create({
          recipient: issue.assignedAuthority,
          type: NotificationType.ISSUE_REOPENED,
          title: 'Issue Resolution Disputed',
          message: `The citizen disputed the resolution of "${issue.title}". Reason: ${input.disputeReason || 'Not satisfactory'}.`,
          relatedEntityType: 'PublicIssue',
          relatedEntityId: issue._id,
        });
      }
    }

    return issue;
  },

  async checkOverdueIssues(): Promise<number> {
    const now = new Date();
    const result = await PublicIssue.updateMany(
      {
        status: { $in: [IssueStatus.REPORTED, IssueStatus.UNDER_REVIEW, IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS] },
        overdueAt: { $lte: now },
        isOverdue: false,
      },
      { $set: { isOverdue: true } }
    );
    return result.modifiedCount;
  },
};
