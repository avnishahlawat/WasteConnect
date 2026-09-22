export const UserRole = {
  CITIZEN: 'CITIZEN',
  COLLECTOR: 'COLLECTOR',
  AUTHORITY: 'AUTHORITY',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const PickupStatus = {
  PENDING: 'PENDING',
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
} as const;
export type PickupStatus = typeof PickupStatus[keyof typeof PickupStatus];

export const IssueStatus = {
  REPORTED: 'REPORTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
  DUPLICATE: 'DUPLICATE',
  REOPENED: 'REOPENED',
} as const;
export type IssueStatus = typeof IssueStatus[keyof typeof IssueStatus];

export const Severity = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

export const CollectorAvailability = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  OFFLINE: 'OFFLINE',
  ON_LEAVE: 'ON_LEAVE',
} as const;
export type CollectorAvailability = typeof CollectorAvailability[keyof typeof CollectorAvailability];

export const TimeSlot = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  EVENING: 'EVENING',
} as const;
export type TimeSlot = typeof TimeSlot[keyof typeof TimeSlot];

export const HotspotLevel = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  ELEVATED: 'ELEVATED',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type HotspotLevel = typeof HotspotLevel[keyof typeof HotspotLevel];

export const NotificationType = {
  PICKUP_CREATED: 'PICKUP_CREATED',
  PICKUP_ASSIGNED: 'PICKUP_ASSIGNED',
  PICKUP_ACCEPTED: 'PICKUP_ACCEPTED',
  PICKUP_STARTED: 'PICKUP_STARTED',
  PICKUP_COMPLETED: 'PICKUP_COMPLETED',
  PICKUP_CANCELLED: 'PICKUP_CANCELLED',
  ISSUE_RECEIVED: 'ISSUE_RECEIVED',
  ISSUE_VERIFIED: 'ISSUE_VERIFIED',
  ISSUE_ASSIGNED: 'ISSUE_ASSIGNED',
  ISSUE_STATUS_CHANGED: 'ISSUE_STATUS_CHANGED',
  ISSUE_RESOLVED: 'ISSUE_RESOLVED',
  ISSUE_REOPENED: 'ISSUE_REOPENED',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;
export type VerificationStatus = typeof VerificationStatus[keyof typeof VerificationStatus];

export const CitizenVerification = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DISPUTED: 'DISPUTED',
} as const;
export type CitizenVerification = typeof CitizenVerification[keyof typeof CitizenVerification];
