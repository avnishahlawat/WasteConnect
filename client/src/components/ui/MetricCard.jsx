import { cn } from '../../lib/utils';
export function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', className }) {
    const getBorderColor = () => {
        switch (variant) {
            case 'success': return 'border-l-status-success';
            case 'warning': return 'border-l-status-warning';
            case 'error': return 'border-l-status-error';
            case 'info': return 'border-l-status-info';
            default: return 'border-l-primary';
        }
    };
    return (<div className={cn('bg-surface p-6 rounded-xl border border-border shadow-sm border-l-4', getBorderColor(), className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-muted">{title}</h3>
        <div className="p-2 rounded-lg bg-background">
          <Icon className="w-5 h-5 text-charcoal"/>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tight text-text">{value}</div>
        {trend !== undefined && (<div className={cn('text-sm font-medium flex items-center', trend >= 0 ? 'text-status-success' : 'text-status-error')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>)}
      </div>
      {subtitle && <p className="text-sm text-text-muted mt-2">{subtitle}</p>}
    </div>);
}
