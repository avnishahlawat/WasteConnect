import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { sharedApi } from '../../api/shared';
import type { WasteCategory } from '../../types';
import { Tag } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sharedApi
      .getCategories()
      .then((res) => {
        if (res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load categories:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Waste Classification Taxonomy"
        subtitle="Configured material categories, disposal protocols, and safety compliance rules."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin/dashboard' },
          { label: 'Categories' },
        ]}
      />

      {loading ? (
        <LoadingSkeleton type="card" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c._id} className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-text">{c.name}</h3>
                  <div className="text-xs text-text-muted">{c.description}</div>
                </div>
                <Tag className="w-4 h-4 text-primary" />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                {c.recyclable && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 font-medium">
                    Recyclable
                  </span>
                )}
                {c.compostable && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                    Compostable
                  </span>
                )}
                {c.hazardous && (
                  <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold">
                    Hazardous
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-background border border-border rounded-lg text-xs">
                <div className="font-semibold text-text mb-0.5">Disposal Guidance</div>
                <div className="text-text-muted">{c.disposalGuidance}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
