import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { formatDate, formatWeight } from '../../lib/utils';
export default function AdminPickupsPage() {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        adminApi
            .getAllPickups({ limit: 50 })
            .then((res) => {
            if (res.data.data) {
                setPickups(res.data.data);
            }
        })
            .catch((err) => console.error('Admin pickups failed:', err))
            .finally(() => setLoading(false));
    }, []);
    return (<div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader title="Platform Household Pickups" subtitle="Global audit list of all private waste collection bookings and fulfillment receipts." breadcrumbs={[
            { label: 'Admin Command', href: '/admin/dashboard' },
            { label: 'Pickups' },
        ]}/>

      {loading ? (<LoadingSkeleton type="card"/>) : (<div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Citizen</th>
                <th className="px-5 py-3">Collector</th>
                <th className="px-5 py-3">Ward</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Preferred Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {pickups.map((p) => (<tr key={p._id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-semibold text-text">
                    {p.wasteCategory?.name || 'Waste'}
                  </td>
                  <td className="px-5 py-4 font-bold text-primary">
                    {formatWeight(p.actualQuantity || p.estimatedQuantity, p.unit)}
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    {p.citizen?.firstName} {p.citizen?.lastName}
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    {p.assignedCollector
                    ? `${p.assignedCollector.firstName} ${p.assignedCollector.lastName}`
                    : 'Unassigned'}
                  </td>
                  <td className="px-5 py-4 text-text-muted">{p.serviceArea?.name || 'Central'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={p.status} type="pickup" size="sm"/>
                  </td>
                  <td className="px-5 py-4 text-text-muted text-right">{formatDate(p.preferredDate)}</td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
    </div>);
}
