export type UserRole = 'CITIZEN' | 'COLLECTOR' | 'AUTHORITY' | 'ADMIN';

export type PickupStatus = 
  | 'PENDING' | 'AVAILABLE' | 'ASSIGNED' | 'ACCEPTED'
  | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type IssueStatus = 
  | 'REPORTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'ASSIGNED'
  | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED' | 'DUPLICATE' | 'REOPENED';

export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HotspotLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type CollectorAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_LEAVE';
export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type NotificationType = 
  | 'PICKUP_CREATED' | 'PICKUP_ASSIGNED' | 'PICKUP_ACCEPTED' | 'PICKUP_STARTED'
  | 'PICKUP_COMPLETED' | 'PICKUP_CANCELLED'
  | 'ISSUE_RECEIVED' | 'ISSUE_VERIFIED' | 'ISSUE_ASSIGNED'
  | 'ISSUE_STATUS_CHANGED' | 'ISSUE_RESOLVED' | 'ISSUE_REOPENED'
  | 'ANNOUNCEMENT' | 'SYSTEM';

export interface User {
  id?: string;
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  serviceArea?: ServiceArea;
  lastLogin?: string;
  createdAt: string;
}

export interface ServiceArea {
  _id: string;
  name: string;
  city: string;
  district: string;
  description?: string;
  coordinates: { lat: number; lng: number };
  hotspotScore: number;
  hotspotLevel: HotspotLevel;
  hotspotLastCalculated?: string;
  isActive: boolean;
}

export interface WasteCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  recyclable: boolean;
  compostable: boolean;
  hazardous: boolean;
  disposalGuidance: string;
  color: string;
  icon: string;
  active: boolean;
}

export interface PickupRequest {
  _id: string;
  citizen: User | string;
  wasteCategory: WasteCategory | string;
  estimatedQuantity: number;
  actualQuantity?: number;
  unit: string;
  address: string;
  location: { type: string; coordinates: [number, number] };
  serviceArea: ServiceArea | string;
  preferredDate: string;
  timeSlot: TimeSlot;
  notes?: string;
  photos: string[];
  status: PickupStatus;
  assignedCollector?: User | string;
  collectorNotes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickupEvent {
  _id: string;
  pickupRequest: string;
  previousStatus?: PickupStatus;
  newStatus: PickupStatus;
  actor: User | string;
  actorRole: UserRole;
  note?: string;
  timestamp: string;
}

export interface PublicIssue {
  _id: string;
  reporter: User | string;
  category: string;
  title: string;
  description: string;
  photos: string[];
  location: { type: string; coordinates: [number, number] };
  address: string;
  serviceArea: ServiceArea | string;
  severity: Severity;
  status: IssueStatus;
  priority: Priority;
  assignedAuthority?: User | string;
  assignedTeam?: string;
  resolutionNotes?: string;
  resolutionEvidence: string[];
  duplicateOf?: string;
  verificationStatus: string;
  citizenVerification: string;
  isOverdue: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueEvent {
  _id: string;
  issue: string;
  previousStatus?: IssueStatus;
  newStatus: IssueStatus;
  actor: User | string;
  actorRole: UserRole;
  note?: string;
  isPublic: boolean;
  timestamp: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface CollectorProfile {
  user: User | string;
  serviceAreas: ServiceArea[];
  availability: CollectorAvailability;
  rating: number;
  totalRatings: number;
  totalCollections: number;
  totalWeightCollected: number;
  vehicleType?: string;
  bio?: string;
}

export interface AuthorityProfile {
  user: User | string;
  serviceAreas: ServiceArea[];
  designation: string;
  department: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
  code?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
