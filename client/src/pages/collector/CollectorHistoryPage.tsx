import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { pickupsApi } from '../../api/pickups';
import { formatDate } from '../../lib/utils';
import type { PickupRequest } from '../../types';
import { Clock, CheckCircle2 } from 'lucide-react';

export default function CollectorHistoryPage() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pickupsApi
      .getCollectorHistory()
      .then((res) => {
        if (res.data.data) {
          setPickups(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection History"
        subtitle="Historical log of all completed household waste pickups fulfilled by you."
        breadcrumbs={[
          { label: 'Collector Hub', href: '/collector/dashboard' },
          { label: 'History' },
        ]}
      />

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState
            icon={Clock}
            title="No Past Collections"
            description="Completed collections and delivery weight receipts will be archived here."
          />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Actual Weight</th>
                <th className="px-6 py-3">Citizen & Address</th>
                <th className="px-6 py-3">Ward</th>
                <th className="px-6 py-3">Completed On</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {pickups.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-text">
                    {(p.wasteCategory as any)?.name || 'Waste'}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">
                    {p.actualQuantity || p.estimatedQuantity} {p.unit}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text">
                      {(p.citizen as any)?.firstName} {(p.citizen as any)?.lastName}
                    </div>
                    <div className="text-text-muted text-[11px]">{p.address}</div>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{(p.serviceArea as any)?.name || 'Central'}</td>
                  <td className="px-6 py-4 text-text-muted">{formatDate(p.completedAt || p.updatedAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
