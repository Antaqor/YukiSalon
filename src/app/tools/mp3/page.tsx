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
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        throw new Error('YouTube линк оруулна уу');
      }

      // Simply send the URL without encoding
      const res = await fetch('/api/mp3/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoUrl: trimmedUrl.startsWith('http') 
            ? trimmedUrl 
            : `https://${trimmedUrl}`
        }),
      });

      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Серверийн алдаа: ${text.slice(0, 100)}`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Алдаа гарлаа');

      setStatus('Аудио бэлэн боллоо!');
      setDownloadLink(data.filePath); // Use filePath from server
    } catch (err) {
      let errorMessage = 'Алдаа гарлаа. Дахин оролдоно уу';
      
      if (err instanceof Error) {
        // Handle specific error cases
        if (err.message.includes('Серверийн алдаа')) {
          errorMessage = err.message;
        } else if (err.message.includes('validation failed')) {
          errorMessage = 'Буруу YouTube линк';
        } else {
          errorMessage = err.message;
        }
      }
      
      setStatus(errorMessage);
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

      {status && (
        <div className={`mt-4 p-3 rounded ${
          status.includes('Алдаа') || status.includes('буруу')
            ? 'bg-red-100 text-red-800' 
            : status.includes('бэлэн') 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </div>
      )}

      {downloadLink && (
        <div className="mt-4 text-center">
          <a
            href={downloadLink}
            download
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ↓ MP3 ТАТАХ ↓
          </a>
          <p className="mt-2 text-sm text-gray-500">
            Файл 24 цагийн дараа автоматаар устгагдах болно
          </p>
        </div>
      )}
    </div>
  );
}
