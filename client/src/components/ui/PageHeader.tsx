import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  className?: string;
}

export function PageHeader({ title, subtitle, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-border mb-6", className)}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-sm text-text-muted mb-2">
            {breadcrumbs.map((bc, idx) => (
              <div key={idx} className="flex items-center">
                {bc.href ? (
                  <Link to={bc.href} className="hover:text-primary transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-text">{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <ChevronRight className="w-4 h-4 mx-1" />}
              </div>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
