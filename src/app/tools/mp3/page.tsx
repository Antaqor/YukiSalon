'use client';
import { useState } from 'react';

export default function Mp3Page() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Downloading...');
    try {
      const res = await fetch('/api/mp3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Saved ' + data.filename);
      } else {
        setStatus(data.error || 'Error');
      }
    } catch (err) {
      setStatus('Error');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">YouTube MP3 татагч</h1>
      <form onSubmit={handleSubmit} className="space-x-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube линк"
          className="border px-2 py-1"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
          Tatakh
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
