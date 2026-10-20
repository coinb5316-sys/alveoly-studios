import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Notification State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [notifTarget, setNotifTarget] = useState('');

  useEffect(() => {
    api.get('/admin/settings').then((res) => {
      setSettings(res.data);
      setLoading(false);
    });
  }, []);

  const handleSaveSetting = async (key, value) => {
    try {
      await api.post('/admin/settings', { key, value: Number(value) });
      setSettings((prev) => ({ ...prev, [key]: Number(value) }));
    } catch (err) { alert('Failed to save'); }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications', {
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        targetEmail: notifTarget || undefined
      });
      alert('Notification sent!');
      setNotifTitle(''); setNotifMessage(''); setNotifTarget('');
    } catch (err) { alert('Failed to send'); }
  };

  const pricingKeys = [
    { key: 'cost_image', label: 'Image Generation (Credits)' },
    { key: 'cost_video', label: 'Video Generation (Credits)' },
    { key: 'cost_audio', label: 'Audio Generation (Credits)' },
    { key: 'cost_face_swap', label: 'Face Swap (Credits)' },
    { key: 'cost_upscale', label: 'Upscale (Credits)' },
  ];

  if (loading) return <div className="text-white/50">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-white">Platform Settings</h1>
        
        {/* ── PRICING ── */}
        <div className="max-w-2xl rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/80">Generation Costs</h2>
          <div className="space-y-4">
            {pricingKeys.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <label className="text-[13px] text-white/60">{item.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={settings[item.key] || 0}
                    onBlur={(e) => handleSaveSetting(item.key, e.target.value)}
                    className="w-24 rounded border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none"
                  />
                  <span className="text-xs text-white/40">credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="max-w-2xl rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white/80">Send Notification</h2>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Title"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
              required
            />
            <select
              value={notifType}
              onChange={(e) => setNotifType(e.target.value)}
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <textarea
            placeholder="Message body..."
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none h-24 resize-none"
            required
          />
          <input
            type="email"
            placeholder="Target Email (leave blank to broadcast to all)"
            value={notifTarget}
            onChange={(e) => setNotifTarget(e.target.value)}
            className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
            Send Notification
          </button>
        </form>
      </div>
    </div>
  );
}