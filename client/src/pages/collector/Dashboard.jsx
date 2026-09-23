import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { dashboardsApi } from '../../api/dashboards';
import { pickupsApi } from '../../api/pickups';
import { formatDate, formatWeight } from '../../lib/utils';
import { Truck, Inbox, CheckCircle2, Star, ArrowRight, Play } from 'lucide-react';
export default function CollectorDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);
    const fetchDashboard = () => {
        dashboardsApi
            .getCollectorDashboard()
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Collector dashboard failed:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchDashboard();
    }, []);
    const handleToggleAvailability = async () => {
        if (!data)
            return;
        const nextStatus = data.profile.availability === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
        setUpdatingAvailability(true);
        try {
            await pickupsApi.updateAvailability(nextStatus);
            fetchDashboard();
        }
        catch (err) {
            console.error('Availability update failed:', err);
        }
        finally {
            setUpdatingAvailability(false);
        }
    };
    if (loading) {
        return (<div className="space-y-6">
        <LoadingSkeleton type="card"/>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>
      </div>);
    }
    const profile = data?.profile || {
        availability: 'AVAILABLE',
        rating: 5.0,
        totalRatings: 0,
        totalCollections: 0,
        totalWeightCollected: 0,
    };
    const metrics = data?.metrics || {
        assignedPickups: 0,
        todayCompleted: 0,
        inProgressPickups: 0,
        availableInArea: 0,
    };
    return (<div className="space-y-8">
      {/* Header with Availability Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title={`Collector Hub • ${user?.firstName || 'Collector'}`} subtitle="View active assignments and browse open pickups in your authorized service zones." className="border-0 pb-0 mb-0"/>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleAvailability} disabled={updatingAvailability} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${profile.availability === 'AVAILABLE'
            ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}>
            <div className={`w-2 h-2 rounded-full ${profile.availability === 'AVAILABLE' ? 'bg-status-success animate-pulse' : 'bg-gray-400'}`}/>
            {profile.availability === 'AVAILABLE' ? 'Online / Accepting Requests' : 'Offline'}
          </button>
          <Link to="/collector/available" className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm">
            <Inbox className="w-4 h-4"/> Available Marketplace
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Route Pickups" value={metrics.assignedPickups} subtitle={`${metrics.inProgressPickups} currently in transit`} icon={Truck} variant="info"/>
        <MetricCard title="Completed Today" value={metrics.todayCompleted} subtitle="Collections fulfilled" icon={CheckCircle2} variant="success"/>
        <MetricCard title="Marketplace Requests" value={metrics.availableInArea} subtitle="Available in your service area" icon={Inbox} variant="warning"/>
        <MetricCard title="Average Rating" value={`${profile.rating} / 5`} subtitle={`From ${profile.totalRatings} citizen reviews`} icon={Star} variant="default"/>
      </div>

      {/* Active Route & Recent Feedback */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Route Pickups */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Your Scheduled Route</h3>
            <Link to="/collector/pickups" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Manage Pickups <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          {!data?.recentAssignments?.length ? (<EmptyState icon={Truck} title="No Pickups on Route" description="Browse the marketplace to accept new waste collection jobs." action={<Link to="/collector/available" className="inline-flex items-center gap-2 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-md mt-2">
                  <Inbox className="w-3.5 h-3.5"/> View Available Pickups
                </Link>}/>) : (<div className="divide-y divide-border">
              {data.recentAssignments.map((p) => (<div key={p._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-text">
                      {p.wasteCategory?.name || 'Waste'} ({formatWeight(p.actualQuantity || p.estimatedQuantity, p.unit)})
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {p.address} • Date: {formatDate(p.preferredDate)} ({p.timeSlot})
                    </div>
                    <div className="text-[11px] text-charcoal mt-1">
                      Citizen: {p.citizen?.firstName} {p.citizen?.lastName} ({p.citizen?.phone || 'No phone'})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} type="pickup" size="sm"/>
                    <Link to="/collector/pickups" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                      <Play className="w-3.5 h-3.5"/> Fulfill
                    </Link>
                  </div>
                </div>))}
            </div>)}
        </div>

        {/* Citizen Reviews */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text">Recent Citizen Reviews</h3>
            <Link to="/collector/performance" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Performance <ArrowRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          {!data?.recentFeedback?.length ? (<EmptyState icon={Star} title="No Ratings Yet" description="Complete pickups and citizens will provide service feedback here."/>) : (<div className="divide-y divide-border">
              {data.recentFeedback.map((f) => (<div key={f._id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`w-3.5 h-3.5 ${s <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}/>))}
                      <span className="text-xs font-bold text-charcoal ml-1">{f.rating}.0</span>
                    </div>
                    <div className="text-[11px] text-text-muted">{formatDate(f.createdAt)}</div>
                  </div>
                  {f.comment && <p className="text-xs text-text italic">"{f.comment}"</p>}
                  <div className="text-[11px] text-text-muted">
                    Reviewed by: {f.citizen?.firstName} {f.citizen?.lastName}
                  </div>
                </div>))}
            </div>)}
        </div>
      </div>
    </div>);
}
