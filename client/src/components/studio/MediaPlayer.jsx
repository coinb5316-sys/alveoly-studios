import { useEffect, useRef, useState } from 'react';

function fmt(t) {
  if (!Number.isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MediaPlayer({ src, kind, poster, compact = false }) {
  const mediaRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const m = mediaRef.current;
    if (!m) return;

    const onTime = () => setTime(m.currentTime);
    const onMeta = () => {
      setDuration(m.duration || 0);
      setMuted(m.muted);
    };
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolume = () => setMuted(m.muted);

    m.addEventListener('timeupdate', onTime);
    m.addEventListener('loadedmetadata', onMeta);
    m.addEventListener('ended', onEnd);
    m.addEventListener('play', onPlay);
    m.addEventListener('pause', onPause);
    m.addEventListener('volumechange', onVolume);

    return () => {
      m.removeEventListener('timeupdate', onTime);
      m.removeEventListener('loadedmetadata', onMeta);
      m.removeEventListener('ended', onEnd);
      m.removeEventListener('play', onPlay);
      m.removeEventListener('pause', onPause);
      m.removeEventListener('volumechange', onVolume);
    };
  }, [src]);

  const toggle = () => {
    const m = mediaRef.current;
    if (!m) return;
    if (m.paused) {
      m.play().catch(() => {});
    } else {
      m.pause();
    }
  };

  const seek = (e) => {
    const m = mediaRef.current;
    if (!m) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    m.currentTime = pct * (m.duration || 0);
    setTime(m.currentTime);
  };

  const toggleMute = () => {
    const m = mediaRef.current;
    if (!m) return;
    m.muted = !m.muted;
    setMuted(m.muted);
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-md)] bg-black ${
        compact ? 'h-14' : ''
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Media element */}
      {kind === 'video' ? (
        <video
          ref={mediaRef}
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
        />
      ) : (
        <>
          <div
            className={`flex items-center justify-center bg-gradient-to-br from-[var(--brand-600)]/20 to-black/60 ${
              compact ? 'h-14' : 'h-32'
            }`}
          >
            <Waveform playing={playing} small={compact} />
          </div>
          <audio ref={mediaRef} src={src} preload="metadata" />
        </>
      )}

      {/* Play overlay — only when not playing */}
      {!playing && (
        <button
          onClick={toggle}
          className={`absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition hover:bg-black/40 ${
            compact ? '' : ''
          }`}
          aria-label="Play"
        >
          <span
            className={`flex items-center justify-center rounded-full bg-white/95 text-black shadow-2xl transition hover:scale-105 ${
              compact ? 'h-7 w-7' : 'h-14 w-14'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className={compact ? 'h-3 w-3' : 'h-6 w-6'}
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent ${
          compact ? 'p-1.5' : 'p-3'
        }`}
      >
        <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
          {/* Play / Pause */}
          <button
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className={`flex shrink-0 items-center justify-center rounded-full bg-white text-black ${
              compact ? 'h-6 w-6' : 'h-8 w-8'
            }`}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className={compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} fill="currentColor">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className={compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Current time — hidden when compact */}
          {!compact && (
            <span className="font-mono text-[10px] text-white/70">{fmt(time)}</span>
          )}

          {/* Scrubber */}
          <div onClick={seek} className="group relative h-1 flex-1 cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-white/20" />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition group-hover:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>

          {/* Duration — hidden when compact */}
          {!compact && (
            <span className="font-mono text-[10px] text-white/70">{fmt(duration)}</span>
          )}

          {/* Mute — hidden when compact */}
          {!compact && (
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="text-white/70 transition hover:text-white"
            >
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                  <path d="m22 9-6 6M16 9l6 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Waveform({ playing, small = false }) {
  const count = small ? 24 : 40;
  const maxH = small ? 16 : 32;
  return (
    <div className="flex items-center gap-0.5" style={{ height: small ? 16 : 40 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-white/70"
          style={{
            height: `${6 + Math.abs(Math.sin(i * 0.7)) * maxH}px`,
            animation: playing
              ? `pulse 0.9s ease-in-out ${i * 0.03}s infinite alternate`
              : 'none',
            opacity: playing ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}