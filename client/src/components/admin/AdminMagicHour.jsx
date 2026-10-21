// components/admin/AdminMagicHour.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminMagicHour() {
  const [balance, setBalance] = useState(null);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');
  const [usageError, setUsageError] = useState('');

  useEffect(() => {
    // Fetch independently so one failure doesn't hide the other
    const fetchBalance = api.get('/admin/magic-hour/balance')
      .then((r) => setBalance(r.data.data))
      .catch((err) => {
        console.error('[balance]', err);
        setBalanceError(err.response?.data?.error || 'Could not load balance.');
      });

    const fetchUsage = api.get('/admin/usage?limit=10')
      .then((r) => setUsage(r.data.usage || []))
      .catch((err) => {
        console.error('[usage]', err);
        setUsageError(err.response?.data?.error || 'Could not load usage.');
      });

    // Promise.allSettled waits for both but doesn't reject on one failure
    Promise.allSettled([fetchBalance, fetchUsage]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-10 text-center text-[12.5px] text-white/50">Loading Magic Hour stats…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Magic Hour Monitoring</h1>
        <p className="mt-1 text-[12.5px] text-white/40">
          Live balance and per-user generation costs.
        </p>
      </div>

      {/* Balance Card */}
      {balanceError && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
          {balanceError}
        </div>
      )}

      {balance && (
        <div className={`rounded-2xl border p-6 ${balance.lowBalance ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/[0.08] bg-white/[0.02]'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Current Credit Balance</p>
              <p className="mt-1 text-[42px] font-semibold leading-none tracking-tight text-white">
                {balance.credits.toLocaleString()}
              </p>
              <p className="mt-1 text-[12px] text-white/40">≈ GH₵ {balance.estimatedValueGHS?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${balance.lowBalance ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                {balance.lowBalance ? 'Low Balance' : 'Healthy'}
              </span>
              <p className="mt-2 text-[11px] text-white/40">Tier: {balance.tier}</p>
            </div>
          </div>
          {balance.lowBalance && (
            <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11.5px] text-amber-200">
              Your balance is below the {balance.threshold.toLocaleString()} credit threshold. Consider purchasing a top-up on the Magic Hour dashboard.
            </p>
          )}
        </div>
      )}

      {/* User Usage Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-[13px] font-semibold text-white/80">Top Credit Consumers</h2>
          <p className="mt-0.5 text-[11.5px] text-white/40">Users who have used the most generation credits.</p>
        </div>

        {usageError && (
          <div className="mx-6 mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
            {usageError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] text-white/70">
            <thead className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Total Credits Used</th>
                <th className="px-6 py-3">Generations</th>
                <th className="px-6 py-3">Last Active</th>
                <th className="px-6 py-3 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.userId} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                  <td className="px-6 py-3">{u.email}</td>
                  <td className="px-6 py-3 font-medium text-white">{u.totalCreditsUsed.toLocaleString()}</td>
                  <td className="px-6 py-3">{u.generationCount}</td>
                  <td className="px-6 py-3 text-[11px] text-white/50">
                    {u.lastGenerationAt ? new Date(u.lastGenerationAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-[11.5px] text-emerald-400">
                    {u.remainingCredits?.toLocaleString() ?? '—'}
                  </td>
                </tr>
              ))}
              {usage.length === 0 && !usageError && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[12px] text-white/40">
                    No generation activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}