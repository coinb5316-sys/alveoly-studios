// pages/AdminSettings.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import useUsdToGhs from '../../utils/useUsdToGhs';

/* ─────────────────────────────────────────────
   Defaults — must match the backend defaults
   in controllers/adminController.js
   ───────────────────────────────────────────── */
const DEFAULT_PLANS = {
  free: { monthlyUSD: 0, yearlyUSD: 0, credits: 5 },
  pro: { monthlyUSD: 19, yearlyUSD: 15, credits: 500 },
  enterprise: { monthlyUSD: 99, yearlyUSD: 79, credits: 5000 },
};

const PLAN_META = {
  free: { name: 'Free', description: 'Locked — cannot be edited' },
  pro: { name: 'Pro', description: 'Most popular tier' },
  enterprise: { name: 'Enterprise', description: 'For teams and heavy usage' },
};

const PLAN_ORDER = ['free', 'pro', 'enterprise'];

const PRICING_KEYS = [
  { key: 'cost_image', label: 'Image Generation' },
  { key: 'cost_video', label: 'Video Generation' },
  { key: 'cost_audio', label: 'Audio Generation' },
  { key: 'cost_face_swap', label: 'Face Swap' },
  { key: 'cost_upscale', label: 'Upscale' },
];

export default function AdminSettings() {
  const ghsRate = useUsdToGhs();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedFlash, setSavedFlash] = useState(null);

  // ── Plans state ─────────────────────────────
  const [savedPlans, setSavedPlans] = useState(DEFAULT_PLANS);
  const [draftPlans, setDraftPlans] = useState({
    free: { monthlyUSD: '0', yearlyUSD: '0', credits: '5' },
    pro: { monthlyUSD: '', yearlyUSD: '', credits: '' },
    enterprise: { monthlyUSD: '', yearlyUSD: '', credits: '' },
  });
  const [savingPlanId, setSavingPlanId] = useState(null);
  const [resettingPlanId, setResettingPlanId] = useState(null);

  // ── Generation costs state ──────────────────
  const [costs, setCosts] = useState({});
  const [savingCostKey, setSavingCostKey] = useState(null);

  // ── Notification form state ─────────────────
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [notifTarget, setNotifTarget] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  /* ── Load everything on mount ──────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/admin/settings');
        if (cancelled) return;
        const data = res.data || {};

        // Plans
        const plans = data.plans || DEFAULT_PLANS;
        setSavedPlans(plans);
        setDraftPlans({
          free: {
            monthlyUSD: String(plans.free?.monthlyUSD ?? 0),
            yearlyUSD: String(plans.free?.yearlyUSD ?? 0),
            credits: String(plans.free?.credits ?? 5),
          },
          pro: {
            monthlyUSD: String(plans.pro?.monthlyUSD ?? 19),
            yearlyUSD: String(plans.pro?.yearlyUSD ?? 15),
            credits: String(plans.pro?.credits ?? 500),
          },
          enterprise: {
            monthlyUSD: String(plans.enterprise?.monthlyUSD ?? 99),
            yearlyUSD: String(plans.enterprise?.yearlyUSD ?? 79),
            credits: String(plans.enterprise?.credits ?? 5000),
          },
        });

        // Costs — the `plans` key is excluded, everything else is a cost
        const costValues = {};
        for (const item of PRICING_KEYS) {
          costValues[item.key] = Number(data[item.key] ?? 0);
        }
        setCosts(costValues);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Failed to load settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Plan dirty / default helpers ──────────── */
  const isPlanDirty = (id) => {
    const s = savedPlans[id] || {};
    const d = draftPlans[id] || {};
    return (
      Number(d.monthlyUSD) !== Number(s.monthlyUSD ?? 0) ||
      Number(d.yearlyUSD) !== Number(s.yearlyUSD ?? 0) ||
      Number(d.credits) !== Number(s.credits ?? 0)
    );
  };

  const isPlanDefault = (id) => {
    const s = savedPlans[id] || {};
    const d = DEFAULT_PLANS[id];
    return (
      Number(s.monthlyUSD ?? 0) === d.monthlyUSD &&
      Number(s.yearlyUSD ?? 0) === d.yearlyUSD &&
      Number(s.credits ?? 0) === d.credits
    );
  };

  const updatePlanField = (id, field, value) => {
    setDraftPlans((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  /* ── Save the whole plans object ───────────── */
  const savePlans = async () => {
    setError('');
    try {
      const payload = {
        plans: {
          free: DEFAULT_PLANS.free,
          pro: {
            monthlyUSD: Number(draftPlans.pro.monthlyUSD),
            yearlyUSD: Number(draftPlans.pro.yearlyUSD),
            credits: Number(draftPlans.pro.credits),
          },
          enterprise: {
            monthlyUSD: Number(draftPlans.enterprise.monthlyUSD),
            yearlyUSD: Number(draftPlans.enterprise.yearlyUSD),
            credits: Number(draftPlans.enterprise.credits),
          },
        },
      };
      const res = await api.post('/admin/plans', payload);
      const updated = res.data?.plans || payload.plans;
      setSavedPlans(updated);
      setSavedFlash('plans');
      setTimeout(() => setSavedFlash(null), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save plans.');
    }
  };

  /* ── Reset a single plan to its default ────── */
  const resetPlan = async (id) => {
    if (!window.confirm(`Reset ${PLAN_META[id].name} pricing to defaults?`)) return;
    setError('');
    setResettingPlanId(id);
    try {
      const res = await api.delete(`/admin/plans/${id}`);
      const updated = res.data?.plans || DEFAULT_PLANS;
      setSavedPlans(updated);
      setDraftPlans((prev) => ({
        ...prev,
        [id]: {
          monthlyUSD: String(updated[id].monthlyUSD),
          yearlyUSD: String(updated[id].yearlyUSD),
          credits: String(updated[id].credits),
        },
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset plan.');
    } finally {
      setResettingPlanId(null);
    }
  };

  /* ── Save a generation cost ────────────────── */
  const saveCost = async (key, value) => {
    setSavingCostKey(key);
    setError('');
    try {
      const numeric = Number(value);
      await api.post('/admin/settings', { key, value: numeric });
      setCosts((prev) => ({ ...prev, [key]: numeric }));
      setSavedFlash(key);
      setTimeout(() => setSavedFlash(null), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save cost.');
    } finally {
      setSavingCostKey(null);
    }
  };

  /* ── Send notification ─────────────────────── */
  const sendNotification = async (e) => {
    e.preventDefault();
    setSendingNotif(true);
    setError('');
    try {
      await api.post('/admin/notifications', {
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        targetEmail: notifTarget || undefined,
      });
      setNotifTitle('');
      setNotifMessage('');
      setNotifTarget('');
      setSavedFlash('notif');
      setTimeout(() => setSavedFlash(null), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification.');
    } finally {
      setSendingNotif(false);
    }
  };

  /* ── Live GH₵ preview for each plan card ───── */
  const planGhsPreview = useMemo(() => {
    const map = {};
    for (const id of PLAN_ORDER) {
      const usd = Number(draftPlans[id]?.monthlyUSD) || 0;
      map[id] = Math.round(usd * ghsRate);
    }
    return map;
  }, [draftPlans, ghsRate]);

  if (loading) {
    return (
      <div className="py-10 text-center text-[12.5px] text-white/50">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Platform Settings</h1>
        <p className="mt-1 text-[12.5px] text-white/40">
          Manage subscription prices, generation costs, and broadcast notifications.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
          {error}
        </div>
      )}

      {/* ── ═══════════ PLAN PRICING ═══════════ ── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-white/80 sm:text-sm">Plan Pricing</h2>
            <p className="mt-1 text-[11.5px] text-white/40">
              These prices drive <code className="rounded bg-white/[0.04] px-1 py-0.5 text-[10.5px]">/pricing</code> and{' '}
              <code className="rounded bg-white/[0.04] px-1 py-0.5 text-[10.5px]">/dashboard/billing</code>.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[#8b5cf6]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#a78bfa] sm:inline">
            Live
          </span>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const meta = PLAN_META[id];
            const locked = id === 'free';
            const atDefault = isPlanDefault(id);
            return (
              <div
                key={id}
                className={`flex flex-col rounded-xl border bg-white/[0.01] p-4 transition ${
                  id === 'pro'
                    ? 'border-[#8b5cf6]/25'
                    : 'border-white/[0.06]'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-white">{meta.name}</h3>
                    <p className="mt-0.5 text-[11px] text-white/40">{meta.description}</p>
                  </div>
                  {!atDefault && !locked && (
                    <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                      Custom
                    </span>
                  )}
                  {savedFlash === `plan-${id}` && (
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-300">
                      Saved
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label className="block">
                    <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-wider text-white/40">
                      Monthly (USD)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draftPlans[id].monthlyUSD}
                      onChange={(e) => updatePlanField(id, 'monthlyUSD', e.target.value)}
                      disabled={locked}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {!locked && (
                      <span className="mt-1 block text-[10.5px] text-white/35">
                        ≈ GH₵ {planGhsPreview[id].toLocaleString()} /mo
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-wider text-white/40">
                      Yearly (USD /mo)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draftPlans[id].yearlyUSD}
                      onChange={(e) => updatePlanField(id, 'yearlyUSD', e.target.value)}
                      disabled={locked}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-wider text-white/40">
                      Credits / month
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draftPlans[id].credits}
                      onChange={(e) => updatePlanField(id, 'credits', e.target.value)}
                      disabled={locked}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </label>
                </div>

                {locked ? (
                  <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10.5px] text-white/40">
                    Free tier is fixed across all accounts.
                  </p>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => savePlans()}
                      disabled={!isPlanDirty(id) || savingPlanId === id}
                      className="flex-1 rounded-lg bg-[#8b5cf6] px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {savingPlanId === id ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => resetPlan(id)}
                      disabled={atDefault || resettingPlanId === id}
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11.5px] font-medium text-white/70 transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {resettingPlanId === id ? '…' : 'Reset'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.01] px-3 py-2 text-[10.5px] leading-4 text-white/40">
          Saving any plan writes the whole plan set at once. Public pages pick up changes on next load (30-second cache).
          Users with a confirmation modal already open keep the price they clicked.
        </p>
      </div>

      {/* ── ═══════════ GENERATION COSTS ═══════════ ── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-white/80 sm:text-sm">Generation Costs</h2>
            <p className="mt-1 text-[11.5px] text-white/40">
              Credits deducted per generation, per tool.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-white/30">Credits</span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {PRICING_KEYS.map((item) => (
            <div
              key={item.key}
              className="flex flex-col gap-2 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0"
            >
              <label className="text-[12.5px] text-white/60 sm:text-[13px]">
                {item.label}
                {savedFlash === item.key && (
                  <span className="ml-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                    Saved
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={costs[item.key] ?? 0}
                  onBlur={(e) => saveCost(item.key, e.target.value)}
                  disabled={savingCostKey === item.key}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-white/30 disabled:opacity-50 sm:w-24 sm:py-1.5"
                />
                <span className="shrink-0 text-[11.5px] text-white/40 sm:text-xs">credits</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[10.5px] leading-4 text-white/35">
          Values save automatically when the field loses focus.
        </p>
      </div>

      {/* ── ═══════════ NOTIFICATIONS ═══════════ ── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-white/80 sm:text-sm">Send Notification</h2>
            <p className="mt-1 text-[11.5px] text-white/40">
              Broadcast to all users or target a specific email.
            </p>
          </div>
          {savedFlash === 'notif' && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-300">
              Sent
            </span>
          )}
        </div>

        <form onSubmit={sendNotification} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <input
              type="text"
              placeholder="Title"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-white/30"
              required
            />
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-white/30 sm:w-auto"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <textarea
            placeholder="Message body…"
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            className="h-24 w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-white/30"
            required
          />

          <input
            type="email"
            placeholder="Target email (leave blank to broadcast to all)"
            value={notifTarget}
            onChange={(e) => setNotifTarget(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-white/30"
          />

          <button
            type="submit"
            disabled={sendingNotif}
            className="w-full rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7c3aed] disabled:opacity-60 sm:w-auto sm:px-5"
          >
            {sendingNotif ? 'Sending…' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}