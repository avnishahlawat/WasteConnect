import { cn } from '../../lib/utils';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';
export function DataTable({ columns, data, loading, emptyState, className }) {
    if (loading) {
        return <LoadingSkeleton type="table" lines={5} className={className}/>;
    }
    if (data.length === 0) {
        return (<div className={className}>
        {emptyState || <EmptyState icon={Inbox} title="No data found" description="There is currently no data to display in this table."/>}
      </div>);
    }
    return (<div className={cn("w-full overflow-auto rounded-lg border border-border bg-surface", className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-text-muted bg-gray-50 border-b border-border">
          <tr>
            {columns.map((col) => (<th key={col.key} scope="col" className="px-6 py-3 font-medium uppercase tracking-wider" style={{ width: col.width }}>
                {col.header}
              </th>))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, idx) => (<tr key={row.id || row._id || idx} className="bg-surface hover:bg-gray-50 transition-colors">
              {columns.map((col) => (<td key={`${row.id || row._id || idx}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-text">
                  {col.render ? col.render(row) : row[col.key]}
                </td>))}
            </tr>))}
        </tbody>
      </table>
    </div>);
}
