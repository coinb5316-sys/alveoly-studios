import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/payments?page=${page}&limit=20`)
      .then((res) => {
        setTransactions(res.data.transactions || []);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const totalUSD = transactions.reduce((sum, tx) => sum + (tx.amountUSD || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Payment History</h1>
          <p className="mt-1 text-[12.5px] text-white/40">
            {transactions.length} transaction{transactions.length === 1 ? '' : 's'} on this page
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 sm:px-4">
          <span className="text-[10px] uppercase tracking-wider text-white/40">Page total</span>
          <span className="text-[13.5px] font-semibold text-emerald-400">
            ${totalUSD.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ═══ Desktop table (md+) ═══ */}
      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm text-white/70">
            <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3 text-right">Amount</th>
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
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[12.5px] text-white/40">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {!loading && transactions.map((tx) => (
                <tr key={tx._id} className="border-b border-white/[0.05] transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white/50">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 truncate">{tx.userId?.email || 'N/A'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/50 truncate">{tx.reference}</td>
                  <td className="px-4 py-3 capitalize text-violet-400">{tx.plan}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-400">
                    ${(tx.amountUSD || 0).toFixed(2)}
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
        {!loading && transactions.length === 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-10 text-center">
            <p className="text-[13px] text-white/50">No transactions yet.</p>
            <p className="mt-1 text-[11.5px] text-white/30">Completed payments will appear here.</p>
          </div>
        )}
        {!loading && transactions.map((tx) => (
          <div
            key={tx._id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-white/90">
                  {tx.userId?.email || 'Unknown user'}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40">
                  {new Date(tx.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-400">
                ${(tx.amountUSD || 0).toFixed(2)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.05] pt-3 text-[11px] text-white/40">
              <span>
                Plan: <span className="capitalize text-violet-400">{tx.plan}</span>
              </span>
              <span className="truncate font-mono text-white/50">
                Ref: {tx.reference}
              </span>
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