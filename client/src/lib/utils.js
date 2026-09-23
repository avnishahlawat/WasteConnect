import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatWeight(qty, unit = 'kg') {
    if (qty === undefined || qty === null || qty === '' || isNaN(Number(qty))) return `0 ${unit}`;
    const num = Number(qty);
    const rounded = Math.round(num * 100) / 100;
    return `${rounded} ${unit}`;
}
export function formatDate(date, opts) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        ...opts,
    }).format(new Date(date));
}
export function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(date));
}
export function formatRelativeTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return formatDate(date);
}
export const PICKUP_STATUS_LABEL = {
    PENDING: 'Pending',
    AVAILABLE: 'Available',
    ASSIGNED: 'Assigned',
    ACCEPTED: 'Accepted',
    SCHEDULED: 'Scheduled',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
};
export const ISSUE_STATUS_LABEL = {
    REPORTED: 'Reported',
    UNDER_REVIEW: 'Under Review',
    VERIFIED: 'Verified',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
    DUPLICATE: 'Duplicate',
    REOPENED: 'Reopened',
};
export const SEVERITY_LABEL = {
    LOW: 'Low',
    MODERATE: 'Moderate',
    HIGH: 'High',
    CRITICAL: 'Critical',
};
export const PRIORITY_LABEL = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
};
export const HOTSPOT_LEVEL_LABEL = {
    LOW: 'Low',
    MODERATE: 'Moderate',
    ELEVATED: 'Elevated',
    HIGH: 'High',
    CRITICAL: 'Critical',
};
