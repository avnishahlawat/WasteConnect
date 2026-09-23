import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { authorityApi } from '../../api/authority';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, } from 'recharts';
import { BarChart2, TrendingUp, CheckCircle, Package } from 'lucide-react';
export default function AuthorityAnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        authorityApi
            .getAnalytics()
            .then((res) => {
            if (res.data.data) {
                setData(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load analytics:', err))
            .finally(() => setLoading(false));
    }, []);
    if (loading) {
        return (<div className="space-y-6">
        <LoadingSkeleton type="card"/>
        <div className="grid lg:grid-cols-2 gap-6">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>
      </div>);
    }
    const wasteTrends = data?.wasteStats?.trends?.map((t) => ({
        name: `${t._id.month}/${t._id.year}`,
        weight: Math.round(t.totalWeight),
        count: t.collectionsCount,
    })) || [];
    const categoryBreakdown = data?.wasteStats?.categoryBreakdown?.map((c) => ({
        name: c._id,
        weight: Math.round(c.totalWeight),
        count: c.count,
    })) || [];
    const issueTrends = data?.issueStats?.issuesByMonth?.map((i) => ({
        name: `${i._id.month}/${i._id.year}`,
        reported: i.totalReported,
        resolved: i.totalResolved,
    })) || [];
    const areaComparison = data?.areaStats?.map((a) => ({
        name: a.name.split(' ')[0],
        total: a.totalIssues,
        resolved: a.resolvedIssues,
        score: a.hotspotScore,
    })) || [];
    return (<div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader title="Municipal Operations Intelligence" subtitle="Historical reporting trends, waste diversion volume, and service area resolution metrics." breadcrumbs={[
            { label: 'Operations Command', href: '/authority/dashboard' },
            { label: 'Analytics' },
        ]}/>

      {/* Chart 1 & Chart 2 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly Waste Weight Collected */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <Package className="w-4 h-4 text-primary"/> Monthly Waste Collected (kg)
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

        {/* Issue Reported vs Resolved Trends */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary"/> Public Issues: Reported vs Resolved
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

      {/* Chart 3 & Chart 4 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Waste Categories Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary"/> Waste Volume by Category (kg)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis type="number" stroke="#6B7280" fontSize={11}/>
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={11} width={80}/>
                <Tooltip />
                <Bar dataKey="weight" fill="#52B788" radius={[0, 4, 4, 0]} name="Weight (kg)"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Comparison */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-text flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary"/> Ward Incident Resolution Comparison
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11}/>
                <YAxis stroke="#6B7280" fontSize={11}/>
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Total Issues"/>
                <Bar dataKey="resolved" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Resolved Issues"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);
}
