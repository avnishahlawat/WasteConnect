import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { Star } from 'lucide-react';

export default function AdminCollectorsPage() {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getCollectors()
      .then((res) => {
        if (res.data.data) {
          setCollectors(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load collectors:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Collector Fleet Performance"
        subtitle="Operational metrics, rating scores, and collection tonnages for independent and municipal drivers."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin/dashboard' },
          { label: 'Collectors' },
        ]}
      />

      {loading ? (
        <LoadingSkeleton type="card" />
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-5 py-3">Collector</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Total Collections</th>
                <th className="px-5 py-3">Weight Gathered</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {collectors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 font-semibold text-text">{c.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {c.rating} ({c.totalRatings})
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-charcoal">{c.totalCollections} pickups</td>
                  <td className="px-5 py-4 font-bold text-primary">{Math.round(c.totalWeightCollected)} kg</td>
                  <td className="px-5 py-4 text-right">
                    <span className="capitalize px-2 py-0.5 rounded font-medium bg-gray-100 text-charcoal">
                      {c.availability.toLowerCase()}
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
