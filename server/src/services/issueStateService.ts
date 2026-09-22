import { IssueStatus, UserRole } from '../types/enums';
import { AppError } from '../utils/AppError';
import { IssueEvent } from '../models/IssueEvent';
import { PublicIssue } from '../models/PublicIssue';
import mongoose from 'mongoose';

/**
 * Valid state transitions for a Public Waste Issue:
 * REPORTED -> UNDER_REVIEW -> VERIFIED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
 * REPORTED, UNDER_REVIEW -> REJECTED
 * UNDER_REVIEW -> DUPLICATE
 * CLOSED, RESOLVED -> REOPENED (citizen disputes resolution)
 * REOPENED -> ASSIGNED / IN_PROGRESS
 */
const ALLOWED_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  REPORTED: [IssueStatus.UNDER_REVIEW, IssueStatus.VERIFIED, IssueStatus.REJECTED, IssueStatus.DUPLICATE],
  UNDER_REVIEW: [IssueStatus.VERIFIED, IssueStatus.REJECTED, IssueStatus.DUPLICATE, IssueStatus.ASSIGNED],
  VERIFIED: [IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS, IssueStatus.REJECTED],
  ASSIGNED: [IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED, IssueStatus.UNDER_REVIEW],
  IN_PROGRESS: [IssueStatus.RESOLVED, IssueStatus.ASSIGNED],
  RESOLVED: [IssueStatus.CLOSED, IssueStatus.REOPENED],
  CLOSED: [IssueStatus.REOPENED],
  REJECTED: [IssueStatus.UNDER_REVIEW],
  DUPLICATE: [IssueStatus.UNDER_REVIEW],
  REOPENED: [IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS, IssueStatus.UNDER_REVIEW],
};

export const issueStateService = {
  isValidTransition(currentStatus: IssueStatus, newStatus: IssueStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
  },

  async transition(
    issueId: mongoose.Types.ObjectId | string,
    newStatus: IssueStatus,
    actorId: mongoose.Types.ObjectId | string,
    actorRole: UserRole,
    note?: string,
    extraUpdates: Record<string, unknown> = {},
    isPublic = true
  ) {
    const issue = await PublicIssue.findById(issueId);
    if (!issue) {
      throw new AppError('Public issue not found', 404, 'ISSUE_NOT_FOUND');
    }

    if (!this.isValidTransition(issue.status, newStatus)) {
      throw new AppError(
        `Invalid status transition from ${issue.status} to ${newStatus}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const previousStatus = issue.status;
    issue.status = newStatus;

    if (newStatus === IssueStatus.RESOLVED) {
      issue.resolvedAt = new Date();
    }
    if (newStatus === IssueStatus.CLOSED) {
      issue.closedAt = new Date();
    }

    Object.assign(issue, extraUpdates);
    await issue.save();

    const event = await IssueEvent.create({
      issue: issue._id,
      previousStatus,
      newStatus,
      actor: actorId,
      actorRole,
      note,
      metadata: extraUpdates,
      isPublic,
      timestamp: new Date(),
    });

    return { issue, event };
  },
};
