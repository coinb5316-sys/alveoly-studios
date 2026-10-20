import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminOverview() {
  const [stats, setStats] = useState({ totalUsers: 0, totalAssets: 0, assetsToday: 0, totalRevenue: 0 });

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400' },
    { label: 'Total Generations', value: stats.totalAssets, color: 'text-emerald-400' },
    { label: 'Generations Today', value: stats.assetsToday, color: 'text-amber-400' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'text-violet-400' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Platform Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
            <p className="text-[12px] text-white/50">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}