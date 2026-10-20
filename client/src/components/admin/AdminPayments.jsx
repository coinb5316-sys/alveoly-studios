import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    api.get(`/admin/payments?page=${page}&limit=20`)
      .then((res) => {
        setTransactions(res.data.transactions);
        setPages(res.data.pages);
      })
      .catch(console.error);
  }, [page]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Payment History</h1>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs uppercase text-white/40">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount (USD)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{tx.userId?.email || 'N/A'}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/50">{tx.reference}</td>
                <td className="px-4 py-3 capitalize text-violet-400">{tx.plan}</td>
                <td className="px-4 py-3 font-medium text-emerald-400">${tx.amountUSD.toFixed(2)}</td>
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