import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { sharedApi } from '../../api/shared';
import { formatDateTime } from '../../lib/utils';
import type { Notification } from '../../types';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    sharedApi
      .getNotifications()
      .then((res) => {
        if (res.data.data) {
          setNotifications(res.data.data);
        }
      })
      .catch((err) => console.error('Notifications load failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await sharedApi.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await sharedApi.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Notification Center"
          subtitle="System updates, pickup confirmations, and issue resolution alerts."
          className="border-0 pb-0 mb-0"
        />

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-xs font-semibold text-charcoal rounded hover:bg-gray-50 shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-primary" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8">
          <EmptyState
            icon={Bell}
            title="All Caught Up"
            description="You don't have any notifications at the moment."
          />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-sm divide-y divide-border overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? 'bg-surface hover:bg-gray-50/50' : 'bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  <h4 className="font-semibold text-sm text-text">{n.title}</h4>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{n.message}</p>
                <div className="text-[11px] text-text-muted">{formatDateTime(n.createdAt)}</div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  title="Mark as read"
                  className="p-1.5 text-text-muted hover:text-primary rounded hover:bg-white"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
