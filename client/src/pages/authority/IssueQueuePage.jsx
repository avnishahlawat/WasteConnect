import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { authorityApi } from '../../api/authority';
import { sharedApi } from '../../api/shared';
import { formatDate } from '../../lib/utils';
import { List, Search, Eye } from 'lucide-react';
export default function IssueQueuePage() {
    const [searchParams] = useSearchParams();
    const [issues, setIssues] = useState([]);
    const [serviceAreas, setServiceAreas] = useState([]);
    const [selectedCity, setSelectedCity] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [severity, setSeverity] = useState(searchParams.get('severity') || '');
    const [isOverdue, setIsOverdue] = useState(searchParams.get('isOverdue') || '');
    const [serviceArea, setServiceArea] = useState(searchParams.get('serviceArea') || '');
    const [search, setSearch] = useState('');
    useEffect(() => {
        sharedApi.getServiceAreas().then((res) => {
            if (res.data.data)
                setServiceAreas(res.data.data);
        });
    }, []);
    const fetchIssues = () => {
        setLoading(true);
        authorityApi
            .getIssues({
            status: status || undefined,
            severity: severity || undefined,
            isOverdue: isOverdue === 'true' ? true : isOverdue === 'false' ? false : undefined,
            serviceArea: serviceArea || undefined,
            city: selectedCity === 'ALL' ? undefined : selectedCity,
            search: search || undefined,
        })
            .then((res) => {
            if (res.data.data) {
                setIssues(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load issues:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchIssues();
    }, [status, severity, isOverdue, serviceArea, selectedCity]);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchIssues();
    };
    return (<div className="space-y-6">
      <PageHeader title="Municipal Issue Queue" subtitle="Manage, triage, and dispatch crews for citizen-reported sanitation reports." breadcrumbs={[
            { label: 'Operations Command', href: '/authority/dashboard' },
            { label: 'Issue Queue' },
        ]}/>

      {/* Filters Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2"/>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, description, address, or category..." className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark">
            Search
          </button>
        </form>

        {/* Region / City Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-text-muted mr-1">Region:</span>
            {['ALL', 'Ghaziabad', 'New Delhi', 'Noida'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  setServiceArea('');
                }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                  selectedCity === city
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-background hover:bg-gray-100 text-text-muted border border-border'
                }`}
              >
                {city === 'ALL' ? 'All NCR Cities' : city}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-text-muted">
            Showing {issues.length} reported issue{issues.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-text-muted font-semibold mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md focus:outline-none">
              <option value="">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
              <option value="DUPLICATE">Duplicate</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted font-semibold mb-1">Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md focus:outline-none">
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted font-semibold mb-1">SLA Overdue</label>
            <select value={isOverdue} onChange={(e) => setIsOverdue(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md focus:outline-none">
              <option value="">All Reports</option>
              <option value="true">Overdue SLA Only</option>
              <option value="false">Within SLA Deadline</option>
            </select>
          </div>

          <div>
            <label className="block text-text-muted font-semibold mb-1">Ward Zone</label>
            <select value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md focus:outline-none">
              <option value="">
                {selectedCity === 'ALL'
                  ? `All Service Areas (${serviceAreas.length})`
                  : `All ${selectedCity} Wards (${serviceAreas.filter((a) => a.city === selectedCity).length})`}
              </option>
              {selectedCity === 'ALL' ? (
                <>
                  <optgroup label="Ghaziabad Wards">
                    {serviceAreas.filter((a) => a.city === 'Ghaziabad').map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="New Delhi Wards">
                    {serviceAreas.filter((a) => a.city === 'New Delhi').map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Noida Wards">
                    {serviceAreas.filter((a) => a.city === 'Noida').map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                serviceAreas.filter((a) => a.city === selectedCity).map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.district})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (<div className="space-y-3">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>) : issues.length === 0 ? (<div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState icon={List} title="No Issues Match Query" description="Adjust your filters or search keywords to view other municipal reports."/>
        </div>) : (<div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Issue Title & Category</th>
                <th className="px-5 py-3">Location / Ward</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reported</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {issues.map((i) => (<tr key={i._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <StatusBadge status={i.severity} type="severity" size="sm"/>
                    {i.isOverdue && (<div className="mt-1 text-[10px] text-red-600 font-bold">OVERDUE SLA</div>)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-text text-sm">{i.title}</div>
                    <div className="text-text-muted text-[11px]">{i.category}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-text">{i.address}</div>
                    <div className="text-text-muted text-[11px]">{i.serviceArea?.name || 'Central'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={i.status} type="issue" size="sm"/>
                  </td>
                  <td className="px-5 py-4 text-text-muted">{formatDate(i.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/authority/issues/${i._id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-medium text-xs rounded hover:bg-primary-dark shadow-sm">
                      <Eye className="w-3.5 h-3.5"/> Triage
                    </Link>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
    </div>);
}
