// components/admin/AdminOverview.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */
const Icon = ({ path, className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  sparkles: 'M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3z',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  clock: 'M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  trendUp: 'M23 6l-9.5 9.5-5-5L1 18',
  trendDown: 'M23 18l-9.5-9.5-5 5L1 6',
};

/* ─────────────────────────────────────────────
   Warm, human palette
   ───────────────────────────────────────────── */
const PALETTE = {
  violet: '#a78bfa',
  violetDeep: '#7c3aed',
  emerald: '#34d399',
  emeraldDeep: '#059669',
  amber: '#fbbf24',
  amberDeep: '#d97706',
  rose: '#fb7185',
  roseDeep: '#e11d48',
  sky: '#38bdf8',
};

/* ─────────────────────────────────────────────
   Custom Tooltip — warm, rounded, human
   ───────────────────────────────────────────── */
function WarmTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#14121f]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
      {label && (
        <p className="mb-1 text-[10.5px] font-medium uppercase tracking-wider text-white/40">
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-[12.5px] text-white/90">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize text-white/60">{p.name}:</span>
          <span className="font-semibold">
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </span>
        </p>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   KPI Card — with mini sparkline + trend
   ───────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent, iconPath, trend, trendLabel }) {
  const trendUp = trend >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/20">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
            style={{ color: accent, backgroundColor: `${accent}1f` }}
          >
            <Icon path={iconPath} className="h-4 w-4" />
          </span>
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                trendUp
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-rose-500/10 text-rose-300'
              }`}
            >
              <Icon path={trendUp ? ICONS.trendUp : ICONS.trendDown} className="h-2.5 w-2.5" />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-white/40">
          {label}
        </p>
        <p className="mt-0.5 text-[26px] font-semibold leading-tight tracking-tight text-white">
          {value}
        </p>
        {sub && <p className="mt-1 text-[11px] text-white/35">{sub}</p>}
        {trendLabel && (
          <p className="mt-0.5 text-[10px] text-white/25">{trendLabel}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   7-day Area Chart — smooth, human
   ───────────────────────────────────────────── */
function GenerationTrend({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.violet} stopOpacity={0.55} />
            <stop offset="100%" stopColor={PALETTE.violet} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<WarmTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
        <Area
          type="monotone"
          dataKey="count"
          name="Generations"
          stroke={PALETTE.violet}
          strokeWidth={2.5}
          fill="url(#areaGrad)"
          dot={{ r: 3, fill: PALETTE.violetDeep, stroke: '#fff', strokeWidth: 1.5 }}
          activeDot={{ r: 5, fill: PALETTE.violet, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────────
   Hourly / bar chart (alternative view)
   ───────────────────────────────────────────── */
function GenerationBars({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="25%">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.violet} />
            <stop offset="100%" stopColor={PALETTE.violetDeep} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<WarmTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" name="Generations" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────────
   Asset Mix — human donut chart
   ───────────────────────────────────────────── */
function AssetMix({ breakdown = {} }) {
  const segments = [
    { key: 'image', label: 'Images', value: breakdown.image || 0, color: PALETTE.violet },
    { key: 'video', label: 'Videos', value: breakdown.video || 0, color: PALETTE.emerald },
    { key: 'audio', label: 'Audio', value: breakdown.audio || 0, color: PALETTE.amber },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center text-center">
        <div className="mb-3 h-20 w-20 rounded-full border-4 border-dashed border-white/[0.08]" />
        <p className="text-[12px] text-white/40">No generations yet — first one is on the way 🌱</p>
      </div>
    );
  }

  const chartData = segments.filter((s) => s.value > 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
            >
              {chartData.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
            <Tooltip content={<WarmTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-bold text-white">{total}</span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-white/40">
            Total
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {segments.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <li key={s.key}>
              <div className="mb-1 flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-mono text-[11px] text-white/50">
                  {s.value} <span className="text-white/30">· {pct}%</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: s.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Plan Distribution — warm horizontal bar
   ───────────────────────────────────────────── */
function PlanDistribution({ data = {} }) {
  const segments = [
    { key: 'free', label: 'Free', value: data.free || 0, color: '#64748b' },
    { key: 'pro', label: 'Pro', value: data.pro || 0, color: PALETTE.violet },
    { key: 'enterprise', label: 'Enterprise', value: data.enterprise || 0, color: PALETTE.rose },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return <p className="text-[12px] text-white/40">No users yet — invite your first customer.</p>;
  }

  return (
    <div>
      <div className="flex h-3.5 overflow-hidden rounded-full bg-white/[0.04]">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
              className="transition-all duration-700 first:rounded-l-full last:rounded-r-full"
              title={`${s.label}: ${s.value}`}
            />
          ) : null
        )}
      </div>
      <ul className="mt-5 grid grid-cols-3 gap-3">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li
              key={s.key}
              className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                {s.label}
              </div>
              <p className="mt-1 text-[19px] font-semibold text-white">{s.value}</p>
              <p className="text-[10.5px] text-white/35">{pct}% of users</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main
   ───────────────────────────────────────────── */
export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartView, setChartView] = useState('area'); // 'area' | 'bar'

  useEffect(() => {
    api
      .get('/admin/overview')
      .then((r) => setData(r.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load overview.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-white/[0.04]" />
          <div className="h-80 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-[12.5px] text-rose-200">
        {error}
      </div>
    );
  }

  const k = data.kpis;

  const kpis = [
    {
      label: 'Total users',
      value: k.totalUsers.toLocaleString(),
      sub: `+${k.newUsersThisMonth} new this month`,
      accent: PALETTE.violet,
      iconPath: ICONS.users,
    },
    {
      label: 'Generations',
      value: k.totalAssets.toLocaleString(),
      sub: `${k.assetsToday} today`,
      accent: PALETTE.emerald,
      iconPath: ICONS.sparkles,
    },
    {
      label: 'Active today',
      value: k.activeToday.toLocaleString(),
      sub: 'unique creators',
      accent: PALETTE.amber,
      iconPath: ICONS.clock,
    },
    {
      label: 'Total revenue',
      value: `$${k.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: `${k.totalTransactions} payments`,
      accent: PALETTE.rose,
      iconPath: ICONS.dollar,
    },
  ];

  const weekTotal = data.dailyGeneration.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Overview</h1>
          <p className="mt-1 text-[12.5px] text-white/40">
            Everything happening across your platform, in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-medium text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
          {data.openChats > 0 && (
            <Link
              to="/admin/chat"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[10.5px] font-medium text-violet-200 transition hover:bg-violet-500/20"
            >
              <Icon path={ICONS.chat} className="h-3 w-3" />
              {data.openChats} open chat{data.openChats === 1 ? '' : 's'}
            </Link>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Chart + donut */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-[13.5px] font-semibold text-white">
                Generations · last 7 days
              </h2>
              <p className="mt-0.5 text-[11.5px] text-white/40">
                <span className="font-semibold text-white/80">{weekTotal}</span> total this week
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-0.5">
              <button
                onClick={() => setChartView('area')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition ${
                  chartView === 'area'
                    ? 'bg-violet-500/20 text-violet-200'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Trend
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition ${
                  chartView === 'bar'
                    ? 'bg-violet-500/20 text-violet-200'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Bars
              </button>
            </div>
          </div>
          {chartView === 'area' ? (
            <GenerationTrend data={data.dailyGeneration} />
          ) : (
            <GenerationBars data={data.dailyGeneration} />
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
          <h2 className="mb-4 text-[13.5px] font-semibold text-white">Asset mix</h2>
          <AssetMix breakdown={data.typeBreakdown} />
        </div>
      </div>

      {/* Plan distribution + recent activity */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
          <h2 className="mb-4 text-[13.5px] font-semibold text-white">Plan distribution</h2>
          <PlanDistribution data={data.planDistribution} />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-white">Recent signups</h2>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-violet-300 transition hover:text-violet-200"
            >
              View all <Icon path={ICONS.arrow} className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {data.recentUsers.length === 0 && (
              <li className="py-4 text-center text-[11.5px] text-white/40">
                No users yet — your first one is around the corner.
              </li>
            )}
            {data.recentUsers.map((u) => (
              <li key={u._id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white shadow-sm">
                  {(u.email || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-white/85">{u.email}</p>
                  <p className="text-[10.5px] text-white/35">
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' · '}
                    <span className="capitalize">{u.plan || 'free'}</span>
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10.5px] text-emerald-300">
                  {u.credits ?? 0} cr
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-white">Recent payments</h2>
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-violet-300 transition hover:text-violet-200"
          >
            View all <Icon path={ICONS.arrow} className="h-3 w-3" />
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-white/40">
            No successful payments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-white/70">
              <thead className="text-[10px] uppercase tracking-wider text-white/35">
                <tr>
                  <th className="py-2">User</th>
                  <th className="py-2">Plan</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="max-w-[200px] truncate py-2.5">{tx.userId?.email || '—'}</td>
                    <td className="py-2.5 capitalize">
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10.5px] text-violet-200">
                        {tx.plan}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="font-medium text-white">${tx.amountUSD.toFixed(2)}</div>
                      {tx.amountGHS != null && (
                        <div className="text-[10px] text-white/35">
                          GH₵ {tx.amountGHS.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-[11px] text-white/40">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}