import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from 'recharts';
import { TrendingUp, Package } from 'lucide-react';
export default function AdminAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        adminApi
            .getAnalytics()
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load admin analytics:', err))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return <LoadingSkeleton type="card"/>;
    const wasteTrends = data?.wasteStats?.trends?.map((t) => ({
        name: `${t._id.month}/${t._id.year}`,
        weight: Math.round(t.totalWeight),
    })) || [];
    const issueTrends = data?.issueStats?.issuesByMonth?.map((i) => ({
        name: `${i._id.month}/${i._id.year}`,
        reported: i.totalReported,
        resolved: i.totalResolved,
    })) || [];
    return (<div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader title="City-Wide Operations Intelligence" subtitle="Executive reporting on waste diversion volumes, incident SLA resolution curves, and fleet performance." breadcrumbs={[
            { label: 'Admin Command', href: '/admin/dashboard' },
            { label: 'Analytics' },
        ]}/>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <Package className="w-4 h-4 text-primary"/> Monthly Tonnage Recovered (kg)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11}/>
                <YAxis stroke="#6B7280" fontSize={11}/>
                <Tooltip />
                <Bar dataKey="weight" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Weight (kg)"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary"/> Public Incident Resolution Velocity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={issueTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11}/>
                <YAxis stroke="#6B7280" fontSize={11}/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reported" stroke="#D97706" strokeWidth={2} name="Reported"/>
                <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} name="Resolved"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);
}
