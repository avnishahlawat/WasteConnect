import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { adminApi } from '../../api/admin';
import { sharedApi } from '../../api/shared';
import { formatDate } from '../../lib/utils';
import { Search, CheckCircle, Ban, UserPlus, X, Shield, Truck, User, Building } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [serviceAreas, setServiceAreas] = useState([]);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CITIZEN',
    phone: '',
    serviceArea: '',
  });

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

  useEffect(() => {
    sharedApi
      .getServiceAreas()
      .then((res) => {
        if (res.data.data) setServiceAreas(res.data.data);
      })
      .catch((err) => console.error('Failed to load service areas:', err));
  }, []);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await adminApi.toggleUserStatus(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);

    try {
      const payload = {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
        phone: newUser.phone ? newUser.phone.trim() : undefined,
        serviceArea: newUser.serviceArea || undefined,
      };

      await adminApi.createUser(payload);
      setCreateSuccess(`Account for ${payload.firstName} ${payload.lastName} created successfully!`);
      fetchUsers();

      // Reset form
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'CITIZEN',
        phone: '',
        serviceArea: '',
      });

      setTimeout(() => {
        setShowAddModal(false);
        setCreateSuccess('');
      }, 1200);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user. Please check details.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="User Access Administration"
          subtitle="Manage citizen accounts, verify collectors, govern authority staff, and add new users."
          breadcrumbs={[
            { label: 'Admin Command', href: '/admin/dashboard' },
            { label: 'Users' },
          ]}
          className="border-0 pb-0 mb-0"
        />

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-dark transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

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
                const roleBadges = {
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
                      <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${roleBadges[u.role] || 'bg-gray-100'}`}>
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
                        {togglingId === u._id ? 'Updating...' : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-text">Add New Platform User</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-status-errorBg text-status-error text-xs font-medium rounded-md border border-status-error/20">
                {createError}
              </div>
            )}

            {createSuccess && (
              <div className="p-3 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.sharma@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none font-medium"
                  >
                    <option value="CITIZEN">Citizen</option>
                    <option value="COLLECTOR">Collector</option>
                    <option value="AUTHORITY">Municipal Authority</option>
                    <option value="ADMIN">Platform Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full h-9 px-3 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Service Area / Ward</label>
                  <select
                    value={newUser.serviceArea}
                    onChange={(e) => setNewUser({ ...newUser, serviceArea: e.target.value })}
                    className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs focus:outline-none"
                  >
                    <option value="">Default / None</option>
                    {serviceAreas.map((sa) => (
                      <option key={sa._id} value={sa._id}>
                        {sa.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-background border border-border text-xs font-medium rounded text-charcoal hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
