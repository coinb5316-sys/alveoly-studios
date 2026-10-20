import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { id: 'img',   label: 'Generate image',        hint: 'Image Studio',         to: '/dashboard/image' },
  { id: 'edit',  label: 'Edit an image',         hint: 'Image Editor',         to: '/dashboard/image-edit' },
  { id: 'vid',   label: 'Generate video',        hint: 'Video Studio',         to: '/dashboard/video' },
  { id: 'i2v',   label: 'Animate an image',      hint: 'Image → Video',        to: '/dashboard/image-to-video' },
  { id: 'v2v',   label: 'Restyle a video',       hint: 'Video → Video',        to: '/dashboard/video-to-video' },
  { id: 'talk',  label: 'Generate talking photo',hint: 'Talking Photo',        to: '/dashboard/talking-photo' },
  { id: 'lip',   label: 'Sync lips to audio',    hint: 'Lip Sync',             to: '/dashboard/lip-sync' },
  { id: 'fs',    label: 'Swap faces in photo',   hint: 'Face Swap',            to: '/dashboard/face-swap' },
  { id: 'sub',   label: 'Add subtitles',         hint: 'Auto Subtitles',       to: '/dashboard/subtitle' },
  { id: 'tr',    label: 'Translate a video',     hint: 'Video Translator',     to: '/dashboard/translate' },
  { id: 'gif',   label: 'Generate a GIF',        hint: 'GIF Generator',        to: '/dashboard/gif' },
  { id: 'anim',  label: 'Animate with style',    hint: 'Animation',            to: '/dashboard/animation' },
  { id: 'aud',   label: 'Generate audio',        hint: 'Audio Studio',         to: '/dashboard/audio' },
  { id: 'cut',   label: 'Remove background',     hint: 'Cutout Studio',        to: '/dashboard/background-removal' },
  { id: 'ups',   label: 'Upscale an image',      hint: 'Upscaler',             to: '/dashboard/upscale' },
  { id: 'hs',    label: 'Generate headshot',     hint: 'Headshot Generator',   to: '/dashboard/headshot' },
  { id: 'clr',   label: 'Colorize a photo',      hint: 'Photo Colorizer',      to: '/dashboard/colorize' },
  { id: 'lib',   label: 'Open library',          hint: 'Your creations',       to: '/dashboard/library' },
  { id: 'home',  label: 'Go home',               hint: 'Dashboard',            to: '/dashboard' },
];

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setActive(0); }, [query]);

  const run = (cmd) => { navigate(cmd.to); onClose(); };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      run(results[active]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a command…"
          className="w-full border-b border-[var(--border-subtle)] bg-transparent px-4 py-3 text-[var(--text-base)] text-[var(--text-primary)] placeholder:text-[var(--text-quaternary)] focus:outline-none"
        />
        <div className="max-h-72 overflow-y-auto p-1">
          {results.length === 0 ? (
            <p className="p-4 text-center text-[var(--text-xs)] text-[var(--text-tertiary)]">No results</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(r)}
                className={`flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-left transition ${
                  i === active ? 'bg-[var(--surface-4)]' : ''
                }`}
              >
                <span className="text-[var(--text-sm)] text-[var(--text-primary)]">{r.label}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">{r.hint}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}