'use client';
import { useState } from 'react';

export default function Mp3Page() {
  const [url,     setUrl]     = useState('');
  const [msg,     setMsg]     = useState('');
  const [link,    setLink]    = useState('');
  const [loading, setLoad]    = useState(false);

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault();
    setLoad(true);  setMsg('Татаж байна...');  setLink('');

    try {
      const clean = url.trim();
      if (!clean) throw new Error('YouTube линк оруулна уу');

      const r = await fetch('/api/mp3/convert', {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ videoUrl: clean.startsWith('http') ? clean : `https://${clean}` })
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Алдаа гарлаа');

      setMsg('Аудио бэлэн боллоо!');
      setLink(j.filePath);
    } catch (err:any) {
      setMsg(err.message || 'Алдаа гарлаа.');
    } finally {
      setLoad(false);
    }
  }

  /* JSX unchanged except small var rename */
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">YouTube → MP3 Хувиргагч</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={url}
          onChange={e=>setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'ТАТАЖ БАЙНА...' : 'МР3 РУУ ХУВИРГАХ'}
        </button>
      </form>

      {msg && (
        <div className={`mt-4 p-3 rounded ${
          msg.includes('Алдаа') ? 'bg-red-100 text-red-800'
          : msg.includes('бэлэн') ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'}`}>
          {msg}
        </div>
      )}

      {link && (
        <div className="mt-4 text-center">
          <a href={link} download className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ↓ MP3 ТАТАХ ↓
          </a>
          <p className="mt-2 text-xs text-gray-500">Файл 24 цагийн дараа автоматаар устгагдах болно</p>
        </div>
      )}
    </div>
  );
}
