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
      setUsers(res.data.users);
      setPages(res.data.pages);
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">User Management</h1>
      
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs uppercase text-white/40">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Credits</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="bg-transparent text-white text-xs border border-white/20 rounded p-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => handleToggleStatus(u._id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {u.status === 'active' ? 'Active' : 'Suspended'}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-emerald-400">{u.credits}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={creditAmount} 
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="w-12 rounded bg-black/40 px-1 py-0.5 text-xs outline-none"
                    />
                    <button onClick={() => handleAddCredits(u._id)} className="rounded bg-white/10 px-2 py-0.5 text-xs text-white hover:bg-white/20">
                      + Add
                    </button>
                  </div>
                  <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:text-red-300 text-xs font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs text-white/50 hover:text-white disabled:opacity-30">Prev</button>
        <span className="text-xs text-white/40">Page {page} of {pages}</span>
        <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="text-xs text-white/50 hover:text-white disabled:opacity-30">Next</button>
      </div>
    </div>
  );
}