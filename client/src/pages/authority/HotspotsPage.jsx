import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { authorityApi } from '../../api/authority';
import { formatDate } from '../../lib/utils';
import { RefreshCw, Calculator, Info } from 'lucide-react';
export default function HotspotsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const fetchHotspots = () => {
        setLoading(true);
        authorityApi
            .getHotspots()
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load hotspots:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchHotspots();
    }, []);
    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await authorityApi.recalculateHotspots();
            fetchHotspots();
        }
        catch (err) {
            console.error('Recalculation failed:', err);
        }
        finally {
            setRecalculating(false);
        }
    };
    return (<div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Area Hotspot Risk Index" subtitle="Dynamic municipal solid waste accumulation and recurrence index." breadcrumbs={[
            { label: 'Operations Command', href: '/authority/dashboard' },
            { label: 'Hotspots' },
        ]} className="border-0 pb-0 mb-0"/>

        <button onClick={handleRecalculate} disabled={recalculating} className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`}/>
          {recalculating ? 'Recalculating...' : 'Recalculate Scores'}
        </button>
      </div>

      {/* Formula Explanation Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary"/> Hotspot Score Formulation
          </h3>
          <span className="text-[11px] text-text-muted italic flex items-center gap-1">
            <Info className="w-3.5 h-3.5"/> Project-defined scoring metric
          </span>
        </div>
        <div className="p-3 bg-white/70 border border-primary/20 rounded-md font-mono text-xs text-charcoal leading-relaxed overflow-x-auto">
          hotspotScore = (reportFrequency × 0.25 + unresolvedRatio × 0.25 + severityScore × 0.20 + recurrenceRate × 0.15 + resolutionDelay × 0.15) × 100
        </div>
        <div className="grid sm:grid-cols-5 gap-2 text-[11px] text-text-muted pt-1">
          <div>• <strong>0–20:</strong> LOW</div>
          <div>• <strong>21–40:</strong> MODERATE</div>
          <div>• <strong>41–60:</strong> ELEVATED</div>
          <div>• <strong>61–80:</strong> HIGH</div>
          <div>• <strong>81–100:</strong> CRITICAL</div>
        </div>
      </div>

      {/* Areas Grid */}
      {loading ? (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>) : (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.areas?.map((area) => (<div key={area._id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-gray-300 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text">{area.name}</h3>
                  <div className="text-xs text-text-muted">{area.district} District • {area.city}</div>
                </div>
                <StatusBadge status={area.hotspotLevel} type="hotspot" size="sm"/>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs font-semibold text-text-muted">Hotspot Score</span>
                  <span className="text-2xl font-black text-charcoal">{area.hotspotScore} <span className="text-xs text-text-muted font-normal">/ 100</span></span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${area.hotspotScore > 80
                    ? 'bg-status-error'
                    : area.hotspotScore > 60
                        ? 'bg-orange-500'
                        : area.hotspotScore > 40
                            ? 'bg-status-warning'
                            : area.hotspotScore > 20
                                ? 'bg-status-info'
                                : 'bg-status-success'}`} style={{ width: `${Math.min(100, Math.max(8, area.hotspotScore))}%` }}/>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Coordinates: {area.coordinates.lat.toFixed(3)}, {area.coordinates.lng.toFixed(3)}</span>
                {area.hotspotLastCalculated && (<span>Updated {formatDate(area.hotspotLastCalculated)}</span>)}
              </div>
            </div>))}
        </div>)}
    </div>);
}
