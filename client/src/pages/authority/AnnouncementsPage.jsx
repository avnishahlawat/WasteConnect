import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { authorityApi } from '../../api/authority';
import { sharedApi } from '../../api/shared';
import { formatDate } from '../../lib/utils';
import { Megaphone, Plus, X } from 'lucide-react';
export default function AuthorityAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [serviceAreas, setServiceAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('INFO');
    const [targetRole, setTargetRole] = useState('ALL');
    const [targetServiceArea, setTargetServiceArea] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fetchAnnouncements = () => {
        setLoading(true);
        authorityApi
            .getAnnouncements()
            .then((res) => {
            if (res.data.data) {
                setAnnouncements(res.data.data);
            }
        })
            .catch((err) => console.error('Failed to load announcements:', err))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchAnnouncements();
        sharedApi.getServiceAreas().then((res) => {
            if (res.data.data)
                setServiceAreas(res.data.data);
        });
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await authorityApi.createAnnouncement({
                title,
                content,
                type,
                targetRole,
                targetServiceArea: targetServiceArea || undefined,
            });
            setModalOpen(false);
            setTitle('');
            setContent('');
            fetchAnnouncements();
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to publish announcement');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Civic Announcements" subtitle="Broadcast notices, schedule changes, and weather advisories to citizens and collectors." breadcrumbs={[
            { label: 'Operations Command', href: '/authority/dashboard' },
            { label: 'Announcements' },
        ]} className="border-0 pb-0 mb-0"/>

        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-primary-dark transition-colors shadow-sm">
          <Plus className="w-4 h-4"/> New Announcement
        </button>
      </div>

      {loading ? (<div className="space-y-3">
          <LoadingSkeleton type="card"/>
          <LoadingSkeleton type="card"/>
        </div>) : (<div className="grid gap-4">
          {announcements.map((a) => {
                const badgeColors = {
                    INFO: 'bg-blue-50 text-blue-700 border-blue-200',
                    WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
                    ALERT: 'bg-red-50 text-red-700 border-red-200',
                    SCHEDULE: 'bg-green-50 text-green-700 border-green-200',
                };
                return (<div key={a._id} className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeColors[a.type] || 'bg-gray-100'}`}>
                      {a.type}
                    </span>
                    <h3 className="font-bold text-base text-text">{a.title}</h3>
                  </div>
                  <span className="text-xs text-text-muted">{formatDate(a.publishedAt)}</span>
                </div>

                <p className="text-sm text-text-muted leading-relaxed">{a.content}</p>

                <div className="text-xs text-text-muted pt-2 border-t border-border flex items-center gap-4">
                  <span>Target Audience: <strong className="text-charcoal capitalize">{a.targetRole.toLowerCase()}</strong></span>
                  {a.targetServiceArea && (<span>Zone: <strong className="text-charcoal">{a.targetServiceArea.name}</strong></span>)}
                  <span className="ml-auto">Author: {a.author?.firstName} {a.author?.lastName}</span>
                </div>
              </div>);
            })}
        </div>)}

      {/* New Announcement Modal */}
      {modalOpen && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-text flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary"/> Create Municipal Announcement
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-muted mb-1">Headline / Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Schedule Update: East Ward Collection Timing" className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:outline-none" required/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-muted mb-1">Announcement Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none">
                    <option value="INFO">Information (Blue)</option>
                    <option value="WARNING">Warning (Amber)</option>
                    <option value="ALERT">Critical Alert (Red)</option>
                    <option value="SCHEDULE">Cleanup Schedule (Green)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-text-muted mb-1">Target Persona</label>
                  <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none">
                    <option value="ALL">Everyone (Public & Staff)</option>
                    <option value="CITIZEN">Citizens Only</option>
                    <option value="COLLECTOR">Collectors Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-muted mb-1">Target Service Area (Optional)</label>
                <select value={targetServiceArea} onChange={(e) => setTargetServiceArea(e.target.value)} className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none">
                  <option value="">All Greenfield Regions</option>
                  {serviceAreas.map((a) => (<option key={a._id} value={a._id}>
                      {a.name}
                    </option>))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-muted mb-1">Announcement Body</label>
                <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Provide complete details, affected streets, instructions, or contact channels..." className="w-full p-2.5 bg-background border border-border rounded-md text-xs focus:outline-none" required/>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-background border border-border text-xs font-medium rounded text-charcoal hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark disabled:opacity-50">
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
