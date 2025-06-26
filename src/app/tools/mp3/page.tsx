'use client';
import { useState } from 'react';

export default function Mp3Page() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Татаж байна...');
    setDownloadLink('');

    try {
      // Validate and encode URL
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        throw new Error('YouTube линк оруулна уу');
      }

      // Encode only if not already encoded
      const processedUrl = trimmedUrl.startsWith('http') 
        ? encodeURIComponent(trimmedUrl)
        : encodeURIComponent(`https://${trimmedUrl}`);

      const res = await fetch('/api/mp3/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: processedUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Алдаа гарлаа');

      setStatus('Аудио бэлэн боллоо!');
      setDownloadLink(`/api/mp3/download/${data.filename}`);
    } catch (err) {
      setStatus(
        err instanceof Error 
          ? err.message 
          : 'Алдаа гарлаа. Дахин оролдоно уу'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">YouTube → MP3 Хувиргагч</h1>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border rounded"
          disabled={isLoading}
        />
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded text-white ${
            isLoading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'ТАТАЖ БАЙНА...' : 'МР3 РУУ ХУВИРГАХ'}
        </button>
      </form>

      {/* Status Message */}
      {status && (
        <div className={`mt-4 p-3 rounded ${
          status.includes('Алдаа') 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {status}
        </div>
      )}

      {/* Download Link */}
      {downloadLink && (
        <div className="mt-4 text-center">
          <a
            href={downloadLink}
            download
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ↓ MP3 ТАТАХ ↓
          </a>
        </div>
      )}
    </div>
  );
}
