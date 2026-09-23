import { cn } from '../../lib/utils';
export function LoadingSkeleton({ className, lines = 1, type = 'text' }) {
    if (type === 'card') {
        return (<div className={cn("rounded-xl border bg-surface p-6 animate-pulse", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>);
    }
    if (type === 'table') {
        return (<div className={cn("w-full border rounded-lg bg-surface animate-pulse", className)}>
        <div className="h-12 bg-gray-100 border-b"></div>
        {Array.from({ length: lines }).map((_, i) => (<div key={i} className="flex h-16 items-center px-4 border-b">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-2"></div>
          </div>))}
      </div>);
    }
    return (<div className={cn("animate-pulse space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (<div key={i} className="h-4 bg-gray-200 rounded w-full"></div>))}
    </div>);
}
