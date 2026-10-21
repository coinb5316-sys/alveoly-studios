import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [creditAmount, setCreditAmount] = useState(10);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=10`);
      setUsers(res.data.users || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleAddCredits = async (userId) => {
    try {
      await api.post('/admin/users/credits', { userId, amount: Number(creditAmount) });
      fetchUsers();
    } catch (err) { alert('Failed to update credits'); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.post('/admin/users/role', { userId, role });
      fetchUsers();
    } catch (err) { alert('Failed to update role'); }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.post('/admin/users/status', { userId });
      fetchUsers();
    } catch (err) { alert('Failed to update status'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure? This will delete the user and all their assets.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) { alert('Failed to delete user'); }
  };

  /* Shared sub-component for the credits + delete actions, reused in both views */
  const UserActions = ({ user, compact = false }) => (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'justify-end'}`}>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={creditAmount}
          onChange={(e) => setCreditAmount(e.target.value)}
          className="w-14 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[11.5px] text-white outline-none focus:border-white/30"
        />
        <button
          onClick={() => handleAddCredits(user._id)}
          className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/20"
        >
          + Credits
        </button>
      </div>
      <button
        onClick={() => handleDelete(user._id)}
        className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
      >
        Delete
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">User Management</h1>
          <p className="mt-1 text-[12.5px] text-white/40">
            Manage roles, credits, and account status.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40">This page</span>
          <span className="text-[13.5px] font-semibold text-white/80">{users.length}</span>
        </div>
      </div>

      {/* ═══ Desktop table (md+) ═══ */}
      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm text-white/70">
            <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[12.5px] text-white/40">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[12.5px] text-white/40">
                    No users found.
                  </td>
                </tr>
              )}
              {!loading && users.map((u) => (
                <tr key={u._id} className="border-b border-white/[0.05] transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="truncate text-[13px] text-white/90">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[11.5px] text-white outline-none focus:border-white/30"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium transition ${
                        u.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                      }`}
                    >
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-emerald-400">{u.credits}</td>
                  <td className="px-4 py-3">
                    <UserActions user={u} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Mobile cards (< md) ═══ */}
      <div className="space-y-3 md:hidden">
        {loading && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-8 text-center text-[12.5px] text-white/40">
            Loading…
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center">
            <p className="text-[13px] text-white/50">No users found.</p>
          </div>
        )}
        {!loading && users.map((u) => (
          <div
            key={u._id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            {/* Row 1 — email + status pill */}
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-[13px] font-medium text-white/90">
                {u.email}
              </p>
              <button
                onClick={() => handleToggleStatus(u._id)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-medium transition ${
                  u.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}
              >
                {u.status === 'active' ? 'Active' : 'Suspended'}
              </button>
            </div>

            {/* Row 2 — role + credits */}
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] uppercase tracking-wider text-white/40">Role</span>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[11.5px] text-white outline-none focus:border-white/30"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] uppercase tracking-wider text-white/40">Credits</span>
                <span className="font-mono text-[13px] font-semibold text-emerald-400">
                  {u.credits}
                </span>
              </div>
            </div>

            {/* Row 3 — actions */}
            <div className="mt-3 border-t border-white/[0.05] pt-3">
              <UserActions user={u} />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center gap-3 sm:gap-4">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/60 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-30"
        >
          Prev
        </button>
        <span className="text-[11.5px] text-white/40">
          Page {page} of {pages}
        </span>
        <button
          disabled={page === pages || loading}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-white/60 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}