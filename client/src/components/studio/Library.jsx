import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { Panel, Chip } from '../ui';
import MediaPlayer from './MediaPlayer';
import AssetEditor from './AssetEditor';

const FILTERS = [
  { id: 'all',   label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
];

const PAGE_SIZE = 40;

const token = () => {
  try { return localStorage.getItem('alveoly_token'); } catch { return null; }
};

const streamSrc = (asset) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const t = token();
  return `${base}/assets/${asset._id}/stream${t ? `?token=${encodeURIComponent(t)}` : ''}`;
};

export default function Library() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ image: 0, video: 0, audio: 0, total: 0 });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Fetch stats
  useEffect(() => {
    let cancel = false;
    api.get('/assets/stats')
      .then((r) => { if (!cancel) setStats(r.data.stats || { image: 0, video: 0, audio: 0, total: 0 }); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [refreshTick]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [filter]);

  // Fetch page of assets
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError('');

    api.get('/assets', {
      params: {
        ...(filter !== 'all' ? { type: filter } : {}),
        page,
        limit: PAGE_SIZE,
      },
    })
      .then((r) => {
        if (cancel) return;
        setAssets(r.data.assets || []);
        setPages(r.data.pagination?.pages || 1);
        setTotal(r.data.pagination?.total || 0);
      })
      .catch((err) => {
        if (!cancel) setError(err.response?.data?.error || 'Failed to load library');
      })
      .finally(() => { if (!cancel) setLoading(false); });

    return () => { cancel = true; };
  }, [filter, page, refreshTick]);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const download = async (asset) => {
    if (!asset || busyId) return;
    setBusyId(asset._id);
    try {
      const target = asset._id ? streamSrc(asset) : asset.cloudinaryUrl;
      const res = await fetch(target, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const ext = asset.type === 'audio' ? 'mp3' : asset.type === 'video' ? 'mp4' : 'png';
      const slug = (asset.prompt || 'alveoly')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'alveoly';

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `alveoly-${slug}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (err) {
      console.error(err);
      setToast('Download failed. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const share = async (asset) => {
    const shareUrl = `${window.location.origin}/s/${asset._id}`;
    const title = 'Made with Alveoly Studios';
    const text = asset.prompt || 'Check out this creation';
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setToast('Link copied to clipboard');
        return;
      }
      window.prompt('Copy this link:', shareUrl);
    } catch { /* user cancelled */ }
  };

  const remove = async (asset) => {
    if (!confirm('Delete this item from your library?')) return;
    setBusyId(asset._id);
    try {
      await api.delete(`/assets/${asset._id}`);
      setAssets((prev) => prev.filter((a) => a._id !== asset._id));
      setStats((s) => ({
        ...s,
        total: Math.max(0, s.total - 1),
        [asset.type]: Math.max(0, (s[asset.type] || 0) - 1),
      }));
      setTotal((t) => Math.max(0, t - 1));
      if (open?._id === asset._id) setOpen(null);
      if (assets.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  const countFor = (id) => (id === 'all' ? stats.total : stats[id] || 0);
  const filterLabel = useMemo(
    () => FILTERS.find((f) => f.id === filter)?.label ?? 'All',
    [filter]
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-tertiary)]">
          <span>Home</span><span>/</span>
          <span className="text-[var(--text-secondary)]">Library</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Library</h1>
            <p className="mt-0.5 text-[var(--text-sm)] text-[var(--text-tertiary)]">
              {total > 0
                ? `${total} ${total === 1 ? 'item' : 'items'}${filter !== 'all' ? ` · ${filterLabel}` : ''}`
                : "Every generation you've created, in one place."}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
                {countFor(f.id) > 0 && (
                  <span className="ml-1.5 text-[9px] opacity-60">{countFor(f.id)}</span>
                )}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--danger)]/10 px-3 py-2 text-[var(--text-xs)] text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)]"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Panel className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-quaternary)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="6" height="16" rx="1.5" />
              <rect x="11" y="4" width="6" height="16" rx="1.5" />
              <path d="m20.5 5.5-3 15" />
            </svg>
          </div>
          <p className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
            {filter === 'all' ? 'Your library is empty' : `No ${filterLabel.toLowerCase()} yet`}
          </p>
          <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
            Generate something and it'll appear here.
          </p>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {assets.map((a) => (
              <AssetCard
                key={a._id}
                asset={a}
                busy={busyId === a._id}
                onOpen={() => setOpen(a)}
                onEdit={() => setEditing(a)}
                onDownload={() => download(a)}
                onShare={() => share(a)}
                onDelete={() => remove(a)}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-[var(--text-xs)] text-[var(--text-secondary)] transition hover:border-[var(--border-default)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-[var(--text-xs)] text-[var(--text-secondary)] transition hover:border-[var(--border-default)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-3)] px-4 py-2 text-[var(--text-xs)] text-[var(--text-primary)] shadow-lg">
          {toast}
        </div>
      )}

      {open && (
        <Lightbox
          asset={open}
          onClose={() => setOpen(null)}
          onEdit={() => { setEditing(open); setOpen(null); }}
          onDownload={() => download(open)}
          onShare={() => share(open)}
          onDelete={() => remove(open)}
        />
      )}

      {editing && (
        <AssetEditor
          asset={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            // Refresh the list once the new job finishes — give it a beat
            setTimeout(() => setRefreshTick((n) => n + 1), 4000);
          }}
        />
      )}
    </div>
  );
}

/* ─────────── Asset card ─────────── */
function AssetCard({ asset, busy, onOpen, onEdit, onDownload, onShare, onDelete }) {
  return (
    <div
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-2)] transition hover:border-[var(--border-strong)]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        onClick={onOpen}
        className="relative block aspect-square w-full overflow-hidden bg-black"
      >
        {asset.type === 'image' && (
          <img
            src={streamSrc(asset)}
            alt={asset.prompt}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

        {asset.type === 'video' && (
          <>
            <video
              src={streamSrc(asset)}
              muted
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback"
              className="h-full w-full object-cover"
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-black">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          </>
        )}

        {asset.type === 'audio' && (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-600)]/30 to-black/70">
            <div className="flex items-end gap-0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-white/70"
                  style={{ height: `${8 + Math.abs(Math.sin(i * 0.9)) * 32}px` }}
                />
              ))}
            </div>
          </div>
        )}
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
        <p className="line-clamp-1 text-[10px] text-white/90">{asset.prompt || 'Untitled'}</p>
        <div className="mt-1.5 flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            disabled={busy}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-white transition hover:bg-white/30 disabled:opacity-40"
            aria-label="Download"
          >
            {busy ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white/60 border-t-transparent" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" />
              </svg>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-white transition hover:bg-white/30"
            aria-label="Share"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <path d="m8.2 10.7 7.6-4.2M8.2 13.3l7.6 4.2" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-white transition hover:bg-white/30"
            aria-label="Edit"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={busy}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/30 text-white transition hover:bg-red-500/60 disabled:opacity-40"
            aria-label="Delete"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Lightbox ─────────── */
function Lightbox({ asset, onClose, onEdit, onDownload, onShare, onDelete }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-2)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
          <p className="line-clamp-1 pr-4 text-[var(--text-xs)] text-[var(--text-secondary)]">
            {asset.prompt || 'Untitled'}
          </p>
          <div className="flex shrink-0 gap-1">
            <button onClick={onEdit} className="rounded-md px-2 py-1 text-[var(--text-xs)] text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-white">
              Edit
            </button>
            <button onClick={onDownload} className="rounded-md px-2 py-1 text-[var(--text-xs)] text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-white">
              Download
            </button>
            <button onClick={onShare} className="rounded-md px-2 py-1 text-[var(--text-xs)] text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-white">
              Share
            </button>
            <button onClick={onDelete} className="rounded-md px-2 py-1 text-[var(--text-xs)] text-[var(--danger)] hover:bg-red-500/10">
              Delete
            </button>
            <button onClick={onClose} className="ml-1 rounded-md px-2 py-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-white">
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {asset.type === 'image' && (
            <img
              src={streamSrc(asset)}
              alt={asset.prompt}
              draggable={false}
              className="mx-auto max-h-[75vh] rounded-lg"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
          {asset.type === 'video' && (
            <MediaPlayer src={streamSrc(asset)} kind="video" />
          )}
          {asset.type === 'audio' && (
            <MediaPlayer src={streamSrc(asset)} kind="audio" />
          )}
        </div>
      </div>
    </div>
  );
}