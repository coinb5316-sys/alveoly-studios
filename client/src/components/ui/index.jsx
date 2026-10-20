// ============================================================
//  THE PRIMITIVE LIBRARY — the only UI atoms used across the app
//  Every button, chip, input, and card on every page comes from
//  here. No inline hex codes, no ad-hoc Tailwind soup.
// ============================================================
import { forwardRef } from 'react';

const cx = (...c) => c.filter(Boolean).join(' ');

/* -------------------- Button -------------------- */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...rest },
  ref
) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';
  const sizes = {
    sm: 'h-8 px-3 text-[var(--text-sm)]',
    md: 'h-10 px-4 text-[var(--text-base)]',
    lg: 'h-11 px-5 text-[var(--text-base)]',
  };
  const variants = {
    primary:
      'bg-[var(--brand-600)] text-white hover:bg-[var(--brand-500)] shadow-[var(--shadow-brand)]',
    secondary:
      'bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-4)]',
    ghost:
      'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]',
    danger:
      'bg-[var(--danger)] text-white hover:brightness-110',
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {!loading && icon}
      {children}
    </button>
  );
});

/* -------------------- IconButton -------------------- */
export const IconButton = forwardRef(function IconButton(
  { active, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition',
        active
          ? 'bg-[var(--surface-4)] text-[var(--text-primary)]'
          : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

/* -------------------- Chip (pill selector) -------------------- */
export function Chip({ active, children, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex h-7 items-center rounded-[var(--radius-full)] px-3 text-[var(--text-xs)] font-medium tracking-wide transition',
        active
          ? 'bg-[var(--brand-600)]/15 text-[var(--brand-300)] ring-1 ring-inset ring-[var(--brand-500)]/40'
          : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] hover:bg-[var(--surface-4)] hover:text-[var(--text-secondary)]',
        className
      )}
    >
      {children}
    </button>
  );
}

/* -------------------- Field (label + input wrapper) -------------------- */
export function Field({ label, hint, children, className }) {
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[var(--text-xs)] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            {label}
          </label>
          {hint && <span className="text-[var(--text-xs)] text-[var(--text-quaternary)]">{hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

/* -------------------- TextArea -------------------- */
export const TextArea = forwardRef(function TextArea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx(
        'w-full resize-none rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3.5 py-3 text-[var(--text-base)] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] border border-[var(--border-subtle)] focus:border-[var(--brand-500)]/50 focus:ring-2 focus:ring-[var(--brand-500)]/15 outline-none transition',
        className
      )}
      {...rest}
    />
  );
});

/* -------------------- Select -------------------- */
export const Select = forwardRef(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cx(
        'h-10 w-full appearance-none rounded-[var(--radius-md)] bg-[var(--surface-2)] pl-3.5 pr-9 text-[var(--text-base)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--brand-500)]/50 focus:ring-2 focus:ring-[var(--brand-500)]/15 outline-none transition bg-[length:14px] bg-[right_12px_center] bg-no-repeat',
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6b78' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...rest}
    >
      {children}
    </select>
  );
});

/* -------------------- Slider (fully custom) -------------------- */
export function Slider({ value, min = 0, max = 100, step = 1, onChange, label, formatValue }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-xs)] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            {label}
          </span>
          <span className="font-mono text-[var(--text-xs)] text-[var(--text-secondary)]">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--surface-4)]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--brand-500)] transition-[width]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--surface-1)] bg-white shadow-md transition-transform"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------- ProgressBar -------------------- */
export function ProgressBar({ value = 0, tone = 'brand', indeterminate }) {
  const colors = {
    brand: 'bg-[var(--brand-500)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
  };
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--surface-4)]">
      {indeterminate ? (
        <div className={cx('absolute inset-y-0 w-1/3 rounded-full', colors[tone], 'animate-[slide_1.4s_ease-in-out_infinite]')} />
      ) : (
        <div
          className={cx('h-full rounded-full transition-[width] duration-500 ease-out', colors[tone])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
    </div>
  );
}

/* -------------------- StatusDot -------------------- */
export function StatusDot({ status }) {
  const map = {
    idle: 'bg-[var(--text-quaternary)]',
    queued: 'bg-[var(--warning)]',
    processing: 'bg-[var(--brand-500)] animate-pulse',
    done: 'bg-[var(--success)]',
    failed: 'bg-[var(--danger)]',
  };
  return <span className={cx('h-1.5 w-1.5 rounded-full', map[status] || map.idle)} />;
}

/* -------------------- Panel -------------------- */
export function Panel({ className, children, ...rest }) {
  return (
    <div
      className={cx(
        'rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* -------------------- Divider -------------------- */
export function Divider({ className }) {
  return <div className={cx('h-px w-full bg-[var(--border-subtle)]', className)} />;
}