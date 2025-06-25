'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

interface Lesson {
  id: number;
  url: string;
  title: string;
  description?: string;
  duration?: string;
  completed: boolean;
}


function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}

export default function ClassroomPage() {
  const { user } = useAuth();
  const isAdmin = user?.username === 'Antaqor';

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const startEditLesson = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setNewTitle(lesson.title);
    setNewUrl(lesson.url);
    setNewDesc(lesson.description || '');
  };

  const saveLesson = () => {
    if (editingId === null) return;
    setLessons((prev) =>
      prev.map((l) =>
        l.id === editingId ? { ...l, title: newTitle, url: newUrl, description: newDesc } : l
      )
    );
    if (selected && selected.id === editingId) {
      setSelected({ ...selected, title: newTitle, url: newUrl, description: newDesc });
    }
    setEditingId(null);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
  };

  const deleteLesson = (id: number) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    if (selected && selected.id === id) {
      setSelected(null);
    }
  };

  const progress = lessons.length
    ? Math.round(
        (lessons.filter((l) => l.completed).length / lessons.length) * 100
      )
    : 0;

  return (
    <div className="flex flex-col md:flex-row h-full w-full min-h-screen relative">
      <button
        className="md:hidden absolute top-2 left-2 z-20 p-2 bg-white rounded-full shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open lessons"
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`bg-white p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 text-black overflow-y-auto md:h-screen md:sticky md:top-0 fixed md:relative inset-y-0 left-0 z-20 w-64 md:w-80 md:min-w-64 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <button
          className="md:hidden absolute top-2 right-2 p-1"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close lessons"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpenIcon className="w-6 h-6" /> Classroom
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
              {isAdmin && (
                <>
                  <PencilSquareIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditLesson(lesson);
                    }}
                    className="w-5 h-5 ml-2 text-cyan-300 cursor-pointer"
                  />
                  <TrashIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLesson(lesson.id);
                    }}
                    className="w-5 h-5 ml-1 text-red-500 cursor-pointer"
                  />
                </>
              )}
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
              onClick={editingId !== null ? saveLesson : addLesson}
              className="w-full bg-brand text-white py-1 rounded"
            >
              {editingId !== null ? 'Save Lesson' : 'Add Lesson'}
            </button>
            {editingId !== null && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setNewTitle('');
                  setNewUrl('');
                  setNewDesc('');
                }}
                className="w-full bg-gray-200 text-black py-1 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </aside>
      <main className="flex-1 bg-white p-4 md:p-10 flex flex-col text-black overflow-y-auto">
        {selected ? (
          <>
            <h1 className="text-2xl font-bold mb-3">{selected.title}</h1>
            <div className="w-full max-w-4xl">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(selected.url)}`}
                  className="absolute top-0 left-0 w-full h-full rounded-xl shadow"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
            </div>
            {selected.description && (
              <p className="text-lg text-gray-700">
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
          <p className="flex items-center justify-center h-full text-gray-400 text-2xl">Select a lesson to get started</p>
        )}
      </main>
    </div>
  );
}
