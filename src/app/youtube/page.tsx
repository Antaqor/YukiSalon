"use client";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../lib/config";

export default function YoutubePage() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const transcribe = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/youtube/transcribe`, { url });
      setText(data.text);
    } catch (err) {
      console.error("Transcription error", err);
      setText("Error transcribing video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">YouTube Transcriber</h1>
      <input
        type="text"
        placeholder="YouTube URL"
        className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={transcribe}
        disabled={loading}
        className="bg-brandCyan text-black px-4 py-2 rounded"
      >
        {loading ? "Transcribing..." : "Transcribe"}
      </button>
      {text && <pre className="whitespace-pre-wrap mt-4 text-black">{text}</pre>}
    </div>
  );
}
