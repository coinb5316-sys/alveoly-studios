import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
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
    setImageUrl(null);
    setError('');

    try {
      const startRes = await api.post('/generate/image', { prompt });
      const { projectId } = startRes.data;

      // Poll every 3 seconds (image is faster than video)
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await api.get(`/generate/image/${projectId}`, {
            params: { prompt }, // send prompt back so backend can save it
          });
          const data = statusRes.data;

          if (data.status === 'completed') {
            clearInterval(pollRef.current);
            setImageUrl(data.url);
            setStatus('done');
          } else if (data.status === 'failed') {
            clearInterval(pollRef.current);
            setError(data.error || 'Image generation failed');
            setStatus('idle');
          }
          // If 'pending', keep polling
        } catch (err) {
          clearInterval(pollRef.current);
          setError(err.response?.data?.error || 'Polling error');
          setStatus('idle');
        }
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start image');
      setStatus('idle');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Generate Image</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your image..."
        className="w-full p-3 rounded bg-gray-700 text-white mb-4 h-24"
      />
      <button
        onClick={handleGenerate}
        disabled={status === 'processing' || !prompt.trim()}
        className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {status === 'processing' ? 'Generating...' : 'Generate Image'}
      </button>

      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      {imageUrl && (
        <img src={imageUrl} alt="Generated" className="mt-4 rounded w-full" />
      )}
    </div>
  );
};

export default ImageGenerator;