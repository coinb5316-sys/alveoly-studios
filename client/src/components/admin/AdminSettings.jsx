import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [notifTarget, setNotifTarget] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then((res) => {
        setSettings(res.data || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveSetting = async (key, value) => {
    try {
      await api.post('/admin/settings', { key, value: Number(value) });
      setSettings((prev) => ({ ...prev, [key]: Number(value) }));
    } catch (err) {
      alert('Failed to save');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications', {
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        targetEmail: notifTarget || undefined,
      });
      alert('Notification sent!');
      setNotifTitle('');
      setNotifMessage('');
      setNotifTarget('');
    } catch (err) {
      alert('Failed to send');
    }
  };

  const pricingKeys = [
    { key: 'cost_image', label: 'Image Generation' },
    { key: 'cost_video', label: 'Video Generation' },
    { key: 'cost_audio', label: 'Audio Generation' },
    { key: 'cost_face_swap', label: 'Face Swap' },
    { key: 'cost_upscale', label: 'Upscale' },
  ];

  if (loading) {
    return (
      <div className="py-10 text-center text-[12.5px] text-white/50">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Platform Settings</h1>
        <p className="mt-1 text-[12.5px] text-white/40">
          Manage generation costs and broadcast notifications.
        </p>
      </div>

      {/* ── PRICING ── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-white/80 sm:text-sm">Generation Costs</h2>
          <span className="text-[10px] uppercase tracking-wider text-white/30">Credits</span>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {pricingKeys.map((item) => (
            <div
              key={item.key}
              className="flex flex-col gap-2 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0"
            >
              <label className="text-[12.5px] text-white/60 sm:text-[13px]">
                {item.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={settings[item.key] || 0}
                  onBlur={(e) => handleSaveSetting(item.key, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-white/30 sm:w-24 sm:py-1.5"
                />
                <span className="shrink-0 text-[11.5px] text-white/40 sm:text-xs">credits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
        <h2 className="mb-4 text-[13px] font-semibold text-white/80 sm:text-sm">
          Send Notification
        </h2>
        <form onSubmit={handleSendNotification} className="space-y-4">
          {/* Title + type — stacked on mobile, side by side on sm+ */}
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
            className="w-full rounded-lg bg-[#8b5cf6] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7c3aed] sm:w-auto sm:px-5"
          >
            Send Notification
          </button>
        </form>
      </div>
    </div>
  );
}