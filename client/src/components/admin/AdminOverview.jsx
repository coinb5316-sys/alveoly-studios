// components/admin/AdminOverview.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

/* ─────────────────────────────────────────────
   Inline icons (no react-icons needed)
   ───────────────────────────────────────────── */
const Icon = ({ path, className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  sparkles: 'M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3z',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  clock: 'M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  image: 'M3 3h18v18H3zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21',
  video: 'M2 5h15v14H2zM17 9l5-3v12l-5-3',
  audio: 'M12 3v18M8 6v12M16 6v12M4 10v4M20 10v4',
};

/* ─────────────────────────────────────────────
   KPI card
   ───────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent, iconPath }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.03]">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: accent }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ color: accent, backgroundColor: `${accent}1a` }}
          >
            <Icon path={iconPath} />
          </span>
          {sub && <span className="text-[10.5px] font-medium text-white/40">{sub}</span>}
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   7-day bar chart (pure SVG)
   ───────────────────────────────────────────── */
function DailyChart({ data = [] }) {
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 16, bottom: 34, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length ? innerW / data.length : innerW;
  const barW = Math.max(8, stepX * 0.55);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padding.top + innerH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={padding.left}
              x2={padding.left + innerW}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 4"
            />
            <text
              x={padding.left - 8}
              y={y + 3}
              textAnchor="end"
              fontSize="9.5"
              fill="rgba(255,255,255,0.35)"
            >
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + stepX * i + (stepX - barW) / 2;
        const h = (d.count / max) * innerH;
        const y = padding.top + innerH - h;
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, d.count > 0 ? 3 : 0)}
              rx="4"
              fill="url(#barGrad)"
            />
            <text
              x={x + barW / 2}
              y={padding.top + innerH + 16}
              textAnchor="middle"
              fontSize="9.5"
              fill="rgba(255,255,255,0.4)"
            >
              {d.label}
            </text>
            {d.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.55)"
                fontWeight="600"
              >
                {d.count}
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Donut chart (asset types)
   ───────────────────────────────────────────── */
function DonutChart({ breakdown = {} }) {
  const segments = [
    { key: 'image', label: 'Images', value: breakdown.image || 0, color: '#8b5cf6' },
    { key: 'video', label: 'Videos', value: breakdown.video || 0, color: '#10b981' },
    { key: 'audio', label: 'Audio', value: breakdown.audio || 0, color: '#f59e0b' },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] flex-col items-center justify-center text-center">
        <div className="mb-2 h-16 w-16 rounded-full border-4 border-dashed border-white/[0.08]" />
        <p className="text-[11.5px] text-white/40">No generations yet</p>
      </div>
    );
  }

  const R = 60;
  const r = 40;
  const cx = 80;
  const cy = 80;
  let angle = -Math.PI / 2;

  const arcs = segments.map((seg) => {
    if (seg.value === 0) return null;
    const sweep = (seg.value / total) * Math.PI * 2;
    const startA = angle;
    const endA = angle + sweep;
    angle = endA;

    const x1 = cx + R * Math.cos(startA);
    const y1 = cy + R * Math.sin(startA);
    const x2 = cx + R * Math.cos(endA);
    const y2 = cy + R * Math.sin(endA);
    const x3 = cx + r * Math.cos(endA);
    const y3 = cy + r * Math.sin(endA);
    const x4 = cx + r * Math.cos(startA);
    const y4 = cy + r * Math.sin(startA);
    const large = sweep > Math.PI ? 1 : 0;

    return (
      <path
        key={seg.key}
        d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`}
        fill={seg.color}
        opacity="0.9"
      />
    );
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-[160px] w-[160px] shrink-0">
        {arcs}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="white"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="9"
          fill="rgba(255,255,255,0.4)"
          letterSpacing="1"
        >
          TOTAL
        </text>
      </svg>
      <ul className="space-y-2.5">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[12px] text-white/70">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1">{s.label}</span>
            <span className="font-mono text-[11.5px] text-white/50">
              {s.value}{' '}
              {total > 0 && (
                <span className="text-white/30">({Math.round((s.value / total) * 100)}%)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Plan distribution bar
   ───────────────────────────────────────────── */
function PlanDistribution({ data = {} }) {
  const segments = [
    { key: 'free', label: 'Free', value: data.free || 0, color: '#64748b' },
    { key: 'pro', label: 'Pro', value: data.pro || 0, color: '#8b5cf6' },
    { key: 'enterprise', label: 'Enterprise', value: data.enterprise || 0, color: '#ec4899' },
  ];
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return <p className="text-[11.5px] text-white/40">No users yet.</p>;
  }

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.04]">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
              className="transition-all duration-500"
            />
          ) : null
        )}
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {segments.map((s) => (
          <li key={s.key}>
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-white/40">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </div>
            <p className="mt-1 text-[18px] font-semibold text-white">{s.value}</p>
            <p className="text-[10.5px] text-white/35">
              {Math.round((s.value / total) * 100)}%
            </p>
          </li>
        ))}
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
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-200">
        {error}
      </div>
    );
  }

  const k = data.kpis;

  const kpis = [
    {
      label: 'Total users',
      value: k.totalUsers.toLocaleString(),
      sub: `+${k.newUsersThisMonth} this month`,
      accent: '#8b5cf6',
      iconPath: ICONS.users,
    },
    {
      label: 'Generations',
      value: k.totalAssets.toLocaleString(),
      sub: `${k.assetsToday} today`,
      accent: '#10b981',
      iconPath: ICONS.sparkles,
    },
    {
      label: 'Active today',
      value: k.activeToday.toLocaleString(),
      sub: 'unique creators',
      accent: '#f59e0b',
      iconPath: ICONS.clock,
    },
    {
      label: 'Total revenue',
      value: `$${k.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: `${k.totalTransactions} payments`,
      accent: '#ec4899',
      iconPath: ICONS.dollar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">Overview</h1>
          <p className="mt-1 text-[12.5px] text-white/40">
            Platform activity at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
          {data.openChats > 0 && (
            <Link
              to="/admin/chat"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-2.5 py-1 text-[10.5px] font-medium text-[#c4b5fd] transition hover:bg-[#8b5cf6]/15"
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
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-[13.5px] font-semibold text-white">Generations · last 7 days</h2>
              <p className="mt-0.5 text-[11.5px] text-white/40">
                Total{' '}
                <span className="font-semibold text-white/80">
                  {data.dailyGeneration.reduce((s, d) => s + d.count, 0)}
                </span>{' '}
                this week
              </p>
            </div>
            <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
              Bar
            </span>
          </div>
          <DailyChart data={data.dailyGeneration} />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-[13.5px] font-semibold text-white">Asset mix</h2>
          <DonutChart breakdown={data.typeBreakdown} />
        </div>
      </div>

      {/* Plan distribution + recent activity */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-[13.5px] font-semibold text-white">Plan distribution</h2>
          <PlanDistribution data={data.planDistribution} />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-white">Recent signups</h2>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#a78bfa] transition hover:text-[#c4b5fd]"
            >
              View all <Icon path={ICONS.arrow} className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {data.recentUsers.length === 0 && (
              <li className="py-4 text-center text-[11.5px] text-white/40">No users yet.</li>
            )}
            {data.recentUsers.map((u) => (
              <li key={u._id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#8b5cf6] text-[11px] font-semibold text-white">
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
                <span className="shrink-0 font-mono text-[11px] text-emerald-400">
                  {u.credits ?? 0} cr
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-white">Recent payments</h2>
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#a78bfa] transition hover:text-[#c4b5fd]"
          >
            View all <Icon path={ICONS.arrow} className="h-3 w-3" />
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-white/40">No successful payments yet.</p>
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
                  <tr key={tx._id} className="border-t border-white/[0.04]">
                    <td className="py-2.5 truncate max-w-[200px]">{tx.userId?.email || '—'}</td>
                    <td className="py-2.5 capitalize text-violet-300">{tx.plan}</td>
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