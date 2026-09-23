import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, Truck, AlertTriangle, AlertCircle, XCircle, Info, Ban, Flame } from 'lucide-react';
export function StatusBadge({ status, type: _type, size = 'md', className }) {
    const getColors = () => {
        switch (status) {
            // Success / Green
            case 'COMPLETED':
            case 'CLOSED':
            case 'RESOLVED':
            case 'LOW': // For priority/severity
                return 'bg-status-successBg text-status-success border-status-success/20 border';
            // Info / Blue
            case 'IN_PROGRESS':
            case 'ASSIGNED':
            case 'ACCEPTED':
            case 'MODERATE':
                return 'bg-status-infoBg text-status-info border-status-info/20 border';
            // Warning / Amber
            case 'PENDING':
            case 'AVAILABLE':
            case 'REPORTED':
            case 'UNDER_REVIEW':
            case 'VERIFIED':
            case 'MEDIUM':
            case 'ELEVATED':
                return 'bg-status-warningBg text-status-warning border-status-warning/20 border';
            // Error / Red
            case 'CRITICAL':
            case 'HIGH':
                return 'bg-status-errorBg text-status-error border-status-error/20 border';
            // Gray
            case 'CANCELLED':
            case 'REJECTED':
            case 'DUPLICATE':
                return 'bg-gray-100 text-gray-600 border-gray-200 border';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200 border';
        }
    };
    const Icon = () => {
        switch (status) {
            case 'COMPLETED':
            case 'CLOSED':
            case 'RESOLVED': return <CheckCircle2 className="mr-1.5 h-3.5 w-3.5"/>;
            case 'PENDING':
            case 'REPORTED':
            case 'UNDER_REVIEW': return <Clock className="mr-1.5 h-3.5 w-3.5"/>;
            case 'IN_PROGRESS':
            case 'ASSIGNED': return <Truck className="mr-1.5 h-3.5 w-3.5"/>;
            case 'CANCELLED':
            case 'REJECTED': return <XCircle className="mr-1.5 h-3.5 w-3.5"/>;
            case 'DUPLICATE': return <Ban className="mr-1.5 h-3.5 w-3.5"/>;
            case 'CRITICAL': return <AlertCircle className="mr-1.5 h-3.5 w-3.5"/>;
            case 'HIGH': return <AlertTriangle className="mr-1.5 h-3.5 w-3.5"/>;
            case 'ELEVATED': return <Flame className="mr-1.5 h-3.5 w-3.5"/>;
            default: return <Info className="mr-1.5 h-3.5 w-3.5"/>;
        }
    };
    const getLabel = () => {
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    };
    return (<span className={cn('inline-flex items-center rounded-full font-medium', {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
        }, getColors(), className)}>
      <Icon />
      {getLabel()}
    </span>);
}
