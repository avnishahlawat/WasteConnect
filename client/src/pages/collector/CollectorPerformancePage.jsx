import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { dashboardsApi } from '../../api/dashboards';
import { Star, Truck, Scale, Award, ThumbsUp } from 'lucide-react';
export default function CollectorPerformancePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        dashboardsApi
            .getCollectorDashboard()
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load performance:', err))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return <LoadingSkeleton type="card"/>;
    const profile = data?.profile || {
        rating: 4.8,
        totalRatings: 18,
        totalCollections: 42,
        totalWeightCollected: 380,
    };
    return (<div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Collector Performance & Ratings" subtitle="Review your service reliability, volume gathered, and citizen ratings." breadcrumbs={[
            { label: 'Collector Hub', href: '/collector/dashboard' },
            { label: 'Performance' },
        ]}/>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Overall Rating" value={`${profile.rating} / 5`} subtitle={`Based on ${profile.totalRatings} citizen reviews`} icon={Star} variant="default"/>
        <MetricCard title="Total Collections" value={profile.totalCollections} subtitle="Household pickups completed" icon={Truck} variant="info"/>
        <MetricCard title="Volume Gathered" value={`${Math.round(profile.totalWeightCollected)} kg`} subtitle="Recyclables diverted" icon={Scale} variant="success"/>
        <MetricCard title="Service Tier" value="Gold Partner" subtitle="Top 10% reliable collector" icon={Award} variant="warning"/>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-text flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-primary"/> Service Quality Guidelines
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Municipal standards require that collectors arrive within the preferred time window, inspect segregation
          for hazardous or non-compliant materials, and record the exact net weight before transporting to the material recovery facility.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 bg-background border border-border rounded-lg">
            <div className="font-bold text-text mb-1">Punctuality Score</div>
            <div className="text-sm font-semibold text-primary">96% on-time</div>
          </div>
          <div className="p-3 bg-background border border-border rounded-lg">
            <div className="font-bold text-text mb-1">Weigh-in Accuracy</div>
            <div className="text-sm font-semibold text-primary">99.2% verified</div>
          </div>
          <div className="p-3 bg-background border border-border rounded-lg">
            <div className="font-bold text-text mb-1">Acceptance Rate</div>
            <div className="text-sm font-semibold text-primary">91% route rate</div>
          </div>
        </div>
      </div>
    </div>);
}
