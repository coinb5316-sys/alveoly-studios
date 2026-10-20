import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';

/**
 * Generic polling hook for async generation tasks.
 * endpoint: e.g. '/generate/image' -> POST start, GET status
 */
export function useGenerationTask({ kind, intervalMs = 3000 }) {
  const [status, setStatus] = useState('idle'); // idle | queued | processing | done | failed
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const pollRef = useRef(null);
  const projectIdRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setProgress(0);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const start = useCallback(
    async (payload) => {
      stopPolling();
      setStatus('queued');
      setProgress(0);
      setError('');
      setResult(null);

      try {
        const startRes = await api.post(`/generate/${kind}`, payload);
        const projectId = startRes.data?.projectId;
        if (!projectId) throw new Error('No projectId returned from server');
        projectIdRef.current = projectId;
        setStatus('processing');

        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await api.get(`/generate/${kind}/${projectId}`);
            const data = statusRes.data || {};

            if (typeof data.progress === 'number') setProgress(data.progress);

            if (data.status === 'completed') {
              stopPolling();
              setResult(data);
              setProgress(100);
              setStatus('done');
            } else if (data.status === 'failed') {
              stopPolling();
              setError(data.error || 'Generation failed');
              setStatus('failed');
            } else {
              setStatus('processing');
            }
          } catch (err) {
            stopPolling();
            setError(err.response?.data?.error || 'Polling error');
            setStatus('failed');
          }
        }, intervalMs);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to start generation');
        setStatus('failed');
      }
    },
    [kind, intervalMs, stopPolling]
  );

  return { status, progress, result, error, start, cancel, projectId: projectIdRef.current };
}