import { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import MediaPlayer from './MediaPlayer';

const KIND_LABEL = {
  image: 'Image',
  'image-edit': 'Image Edit',
  video: 'Video',
  'image-to-video': 'Image → Video',
  'video-to-video': 'Video → Video',
  'talking-photo': 'Talking Photo',
  'lip-sync': 'Lip Sync',
  'face-swap': 'Face Swap',
  subtitle: 'Subtitles',
  translate: 'Translator',
  gif: 'GIF',
  animation: 'Animation',
  audio: 'Audio',
  'voice-clone': 'Voice Clone',
  'background-removal': 'Cutout',
  upscale: 'Upscaler',
  headshot: 'Headshot',
  colorize: 'Colorizer',
};

export default function QueueDrawer() {
  const { jobs, activeCount, removeJob } = useQueue();
  const [open, setOpen] = useState(false);

  if (jobs.length === 0) return null;
  const shown = jobs.slice(0, 8);

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[340px]">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e14]/90 shadow-[0_24px_80px_-20px_rgba(0,0,0,.8)] backdrop-blur-2xl">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2.5">
            {activeCount > 0 ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a78bfa] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a78bfa]" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-[#34d399]" />
            )}
            <span className="text-[12.5px] font-medium text-white">
              {activeCount > 0 ? `${activeCount} generating` : 'All done'}
            </span>
            <span className="text-[10.5px] text-white/35">{jobs.length} total</span>
          </div>
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="max-h-[360px] overflow-y-auto border-t border-white/[0.06]">
            {shown.map((j) => {
              const isAudio = j.kind === 'audio' || j.kind === 'voice-clone';
              const isVideo =
                j.kind === 'video' ||
                j.kind === 'image-to-video' ||
                j.kind === 'video-to-video' ||
                j.kind === 'talking-photo' ||
                j.kind === 'lip-sync' ||
                j.kind === 'subtitle' ||
                j.kind === 'translate' ||
                j.kind === 'animation';
              const isImage =
                j.kind === 'image' ||
                j.kind === 'image-edit' ||
                j.kind === 'background-removal' ||
                j.kind === 'upscale' ||
                j.kind === 'headshot' ||
                j.kind === 'colorize' ||
                j.kind === 'face-swap' ||
                j.kind === 'gif';

              return (
                <div key={j.id} className="border-b border-white/[0.06] px-4 py-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      {KIND_LABEL[j.kind] ?? j.kind}
                    </span>
                    <button
                      onClick={() => removeJob(j.id)}
                      className="text-[10px] text-white/25 hover:text-red-400"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[12px] text-white/70">{j.prompt}</p>

                  {j.status === 'processing' && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] transition-[width] duration-500"
                        style={{ width: `${j.progress || 0}%` }}
                      />
                    </div>
                  )}

                  {j.status === 'done' && j.url && isAudio && (
                    <div className="mt-2">
                      <MediaPlayer src={j.url} kind="audio" compact />
                    </div>
                  )}

                  {j.status === 'done' && j.url && isVideo && (
                    <div className="mt-2">
                      <MediaPlayer src={j.url} kind="video" compact />
                    </div>
                  )}

                  {j.status === 'done' && j.url && isImage && (
                    <div className="mt-2">
                      <img
                        src={j.url}
                        alt={j.prompt}
                        className="h-16 w-16 rounded-md object-cover"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </div>
                  )}

                  {j.status === 'failed' && (
                    <p className="mt-1 text-[10px] text-red-400">{j.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}