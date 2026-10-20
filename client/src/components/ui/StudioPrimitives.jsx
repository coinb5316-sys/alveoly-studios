export function GlassCard({ className = '', children, ...rest }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/[.03] backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,.6)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/40">
      {children}
    </p>
  );
}

export function ProgressBar({ value = 0, tone = 'violet' }) {
  const tones = {
    violet: 'from-violet-500 via-fuchsia-500 to-violet-500',
    emerald: 'from-emerald-500 via-teal-400 to-emerald-500',
    amber: 'from-amber-500 via-orange-400 to-amber-500',
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tones[tone]} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    idle: { label: 'Ready', cls: 'bg-white/10 text-white/70' },
    queued: { label: 'Queued', cls: 'bg-amber-500/15 text-amber-300' },
    processing: { label: 'Generating', cls: 'bg-violet-500/15 text-violet-300' },
    done: { label: 'Complete', cls: 'bg-emerald-500/15 text-emerald-300' },
    failed: { label: 'Failed', cls: 'bg-red-500/15 text-red-300' },
  };
  const m = map[status] || map.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${m.cls}`}>
      {status === 'processing' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {m.label}
    </span>
  );
}

export function EmptyState({ title, hint, icon, cta }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[.015] px-6 py-14 text-center">
      <div className="mb-3 text-white/25">{icon}</div>
      <p className="text-sm font-medium text-white/70">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-white/40">{hint}</p>
      {cta}
    </div>
  );
}