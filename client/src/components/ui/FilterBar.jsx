import { cn } from '../../lib/utils';
export function FilterBar({ filters, values, onChange, className }) {
    return (<div className={cn("flex flex-wrap items-center gap-3", className)}>
      {filters.map((filter) => (<div key={filter.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">{filter.label}</label>
          {filter.type === 'select' ? (<select value={values[filter.key] || ''} onChange={(e) => onChange(filter.key, e.target.value)} className="h-9 px-3 py-1 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">{filter.placeholder || 'All'}</option>
              {filter.options?.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>) : filter.type === 'text' ? (<input type="text" placeholder={filter.placeholder} value={values[filter.key] || ''} onChange={(e) => onChange(filter.key, e.target.value)} className="h-9 px-3 py-1 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/>) : (<input type="date" value={values[filter.key] || ''} onChange={(e) => onChange(filter.key, e.target.value)} className="h-9 px-3 py-1 bg-surface border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/>)}
        </div>))}
    </div>);
}
