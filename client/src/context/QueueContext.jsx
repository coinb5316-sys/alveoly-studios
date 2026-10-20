import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const QueueContext = createContext(null);

const POLL_INTERVAL = 2500;

/**
 * Reduce the original enqueue payload to flat string/number params
 * so the status endpoint can persist them onto the Asset.
 */
function flatParamsForPolling(payload) {
  if (!payload || typeof payload !== 'object') return {};
  const out = {};
  const keep = [
    'prompt', 'model', 'style', 'aspectRatio', 'resolution',
    'duration', 'endSeconds', 'seed', 'guidance', 'negativePrompt',
    'voice', 'imageUrl', 'videoUrl', 'audioUrl',
  ];
  for (const k of keep) {
    const v = payload[k];
    if (v !== undefined && v !== null && v !== '') {
      if (k === 'endSeconds') out.duration = v;
      else if (k === 'imageUrl' || k === 'videoUrl' || k === 'audioUrl') out.sourceUrl = v;
      else out[k] = v;
    }
  }
  return out;
}

export function QueueProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const timers = useRef(new Map());

  const updateJob = useCallback((id, patch) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const stopTimer = useCallback((id) => {
    const t = timers.current.get(id);
    if (t) { clearInterval(t); timers.current.delete(id); }
  }, []);

  const enqueue = useCallback(
    async ({ kind, prompt, payload, existingProjectId }) => {
      // If we already have a projectId (from /rerun), skip the POST
      let projectId = existingProjectId;
      if (!projectId) {
        const startRes = await api.post(`/generate/${kind}`, payload || { prompt });
        projectId = startRes.data?.projectId;
        if (!projectId) throw new Error('No projectId returned');
      }

      const job = {
        id: projectId,
        kind,
        prompt,
        status: 'queued',
        progress: 0,
        url: null,
        error: null,
        createdAt: Date.now(),
      };
      setJobs((prev) => [job, ...prev]);

      const pollParams = flatParamsForPolling(payload);

      const timer = setInterval(async () => {
        try {
          const { data } = await api.get(`/generate/${kind}/${projectId}`, {
            params: pollParams,
          });
          if (data.status === 'completed') {
            stopTimer(projectId);
            updateJob(projectId, { status: 'done', progress: 100, url: data.url });
          } else if (data.status === 'failed') {
            stopTimer(projectId);
            updateJob(projectId, { status: 'failed', error: data.error || 'Failed' });
          } else {
            updateJob(projectId, {
              status: 'processing',
              progress: typeof data.progress === 'number' ? data.progress : undefined,
            });
          }
        } catch (err) {
          stopTimer(projectId);
          updateJob(projectId, {
            status: 'failed',
            error: err.response?.data?.error || 'Polling error',
          });
        }
      }, POLL_INTERVAL);

      timers.current.set(projectId, timer);
      return projectId;
    },
    [stopTimer, updateJob]
  );

  const removeJob = useCallback(
    (id) => {
      stopTimer(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    },
    [stopTimer]
  );

  useEffect(() => () => { timers.current.forEach((t) => clearInterval(t)); }, []);

  const activeCount = jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length;

  return (
    <QueueContext.Provider value={{ jobs, enqueue, removeJob, activeCount }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used inside <QueueProvider>');
  return ctx;
}