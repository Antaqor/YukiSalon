'use client';
import { useState } from 'react';

export default function Mp3Page() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Татаж байна...');
    setDownloadLink('');

    try {
      const res = await fetch('/api/mp3/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Алдаа гарлаа');
      }

      setStatus('Бэлэн боллоо!');
      setDownloadLink(`/api/mp3/download/${data.filename}`);
    } catch (err) {
      // Proper error type handling
      if (err instanceof Error) {
        setStatus(err.message);
      } else if (typeof err === 'string') {
        setStatus(err);
      } else {
        setStatus('Алдаа гарлаа');
      }
      console.error('Conversion error:', err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">YouTube MP3 татагч</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube линк"
          className="border px-3 py-2 flex-1 rounded"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={status === 'Татаж байна...'}
        >
          {status === 'Татаж байна...' ? 'Ажиллаж байна...' : 'Татах'}
        </button>
      </form>
      
      {status && (
        <div className={`p-3 rounded ${
          status.includes('Алдаа') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {downloadLink && (
        <div className="mt-4">
          <a 
            href={downloadLink} 
            download
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            MP3 татах
          </a>
        </div>
      )}
    </div>
  );
}
