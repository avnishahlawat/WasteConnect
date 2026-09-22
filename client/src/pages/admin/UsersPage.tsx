import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { formatDate } from '../../lib/utils';
import type { User } from '../../types';
import { Search, CheckCircle, Ban } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    adminApi
      .getUsers({
        role: role || undefined,
        search: search || undefined,
      })
      .then((res) => {
        if (res.data.data) {
          setUsers(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id);
    try {
      await adminApi.toggleUserStatus(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="User Access Administration"
        subtitle="Manage citizen accounts, verify collectors, and govern authority staff permissions."
        breadcrumbs={[
          { label: 'Admin Command', href: '/admin/dashboard' },
          { label: 'Users' },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-md text-xs focus:outline-none"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded">
            Search
          </button>
        </form>

        <div className="w-full sm:w-48">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none"
          >
            <option value="">All User Roles</option>
            <option value="CITIZEN">Citizen Accounts</option>
            <option value="COLLECTOR">Collectors</option>
            <option value="AUTHORITY">Municipal Staff</option>
            <option value="ADMIN">Platform Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {users.map((u) => {
                const roleBadges: Record<string, string> = {
                  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
                  AUTHORITY: 'bg-blue-100 text-blue-800 border-blue-200',
                  COLLECTOR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  CITIZEN: 'bg-gray-100 text-gray-800 border-gray-200',
                };

                return (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-text text-sm">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-text-muted text-[11px]">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${roleBadges[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                          u.isActive
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.isActive ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        disabled={togglingId === u._id}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                          u.isActive
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {togglingId === u._id
                          ? 'Updating...'
                          : u.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
