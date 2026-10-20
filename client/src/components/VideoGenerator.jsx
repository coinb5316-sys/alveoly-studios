import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | processing | done
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  // Clean up polling if component unmounts
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    setStatus('processing');
    setVideoUrl(null);
    setError('');

    try {
      const startRes = await api.post('/generate/video', { prompt });
      const { projectId } = startRes.data;

      // Poll every 5 seconds (video is slower)
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await api.get(`/generate/video/${projectId}`, {
            params: { prompt }, // send prompt back so backend can save it
          });
          const data = statusRes.data;

          if (data.status === 'completed') {
            clearInterval(pollRef.current);
            setVideoUrl(data.url);
            setStatus('done');
          } else if (data.status === 'failed') {
            clearInterval(pollRef.current);
            setError(data.error || 'Video generation failed');
            setStatus('idle');
          }
          // If 'pending', keep polling
        } catch (err) {
          clearInterval(pollRef.current);
          setError(err.response?.data?.error || 'Polling error');
          setStatus('idle');
        }
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start video');
      setStatus('idle');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Generate Video</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your video..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4 h-24"
      />
      <button
        onClick={handleGenerate}
        disabled={status === 'processing' || !prompt.trim()}
        className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {status === 'processing' ? 'Generating (1-3 mins)...' : 'Generate Video'}
      </button>

      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      {videoUrl && (
        <video src={videoUrl} controls className="mt-4 rounded w-full" />
      )}
    </div>
  );
};

export default VideoGenerator;