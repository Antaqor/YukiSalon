'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

interface Lesson {
  id: number;
  url: string;
  title: string;
  description?: string;
  duration?: string;
  completed: boolean;
}

const isAdmin = true;

function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}

export default function ClassroomPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lessons');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Lesson[];
        setLessons(parsed);
        if (parsed.length) setSelected(parsed[0]);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (lessons.length) {
      localStorage.setItem('lessons', JSON.stringify(lessons));
    }
  }, [lessons]);

  const addLesson = () => {
    const id = Date.now();
    const newLesson: Lesson = {
      id,
      url: newUrl,
      title: newTitle,
      description: newDesc,
      completed: false,
    };
    setLessons((prev) => [...prev, newLesson]);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    if (!selected) setSelected(newLesson);
  };

  const toggleCompleted = (id: number) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, completed: !l.completed } : l))
    );
  };

  const progress = lessons.length
    ? Math.round(
        (lessons.filter((l) => l.completed).length / lessons.length) * 100
      )
    : 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-80 border-r p-4 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AcademicCapIcon className="w-6 h-6" /> Classroom
        </h2>
        <div className="flex items-center mb-2">
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div
              className="h-full bg-green-400 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="ml-2 text-green-600 font-medium">{progress}%</span>
        </div>
        <ul>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className={`flex items-center px-3 py-2 rounded cursor-pointer mb-1 ${lesson.completed ? 'bg-green-50' : 'bg-yellow-50'} ${selected && selected.id === lesson.id ? 'border-l-4 border-cyan-400 bg-cyan-50' : ''}`}
              onClick={() => setSelected(lesson)}
            >
              <CheckIcon
                className={`w-5 h-5 mr-2 ${lesson.completed ? 'text-green-500' : 'text-gray-400'}`}
              />
              <span className="font-medium flex-1 truncate">{lesson.title}</span>
              <input
                type="checkbox"
                checked={lesson.completed}
                onChange={() => toggleCompleted(lesson.id)}
                className="ml-2"
              />
            </li>
          ))}
        </ul>
        {isAdmin && (
          <div className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="YouTube URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full border p-1 rounded"
            />
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border p-1 rounded"
            />
            <textarea
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full border p-1 rounded"
            />
            <button
              onClick={addLesson}
              className="w-full bg-brandCyan text-black py-1 rounded"
            >
              Add Lesson
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        {selected ? (
          <>
            <h1 className="text-2xl font-bold mb-3">{selected.title}</h1>
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${extractVideoId(selected.url)}`}
              allowFullScreen
              className="rounded-xl border mb-4"
            />
            {selected.description && (
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {selected.description}
              </p>
            )}
            {selected.duration && (
              <div className="mt-4 text-sm text-gray-400">
                Duration: {selected.duration}
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">Select a lesson</p>
        )}
      </div>
    </div>
  );
}
