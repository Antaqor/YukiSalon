'use client';

/*
  Permission check: we treat the user with username "Antaqor" as the admin.
  The `isAdmin` variable below handles this. To support multiple admins later,
  fetch roles from your backend and check against an array of admin usernames.
*/

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../lib/config';

interface Lesson {
  _id: string;
  url: string;
  title: string;
  description?: string;
  completed?: boolean;
  author?: { username: string };
}

function extractVideoId(url: string) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
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
  const [editing, setEditing] = useState<Lesson | null>(null);

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data } = await axios.get<Lesson[]>(`${BASE_URL}/api/lessons`);
        const withCompletion = data.map((l) => ({ ...l, completed: false }));
        setLessons(withCompletion);
        if (withCompletion.length) setSelected(withCompletion[0]);
      } catch (err) {
        console.error('Lesson fetch error:', err);
      }
    };
    fetchLessons();
  }, []);

  const validForm = newUrl.trim() && newTitle.trim() && newDesc.trim();
  const progress = (['url', 'title', 'desc'] as const).reduce((acc, field) => {
    if (field === 'url' && newUrl.trim()) return acc + 1;
    if (field === 'title' && newTitle.trim()) return acc + 1;
    if (field === 'desc' && newDesc.trim()) return acc + 1;
    return acc;
  }, 0);
  const progressPct = (progress / 3) * 100;

  const addLesson = async () => {
    if (!user?.accessToken || !validForm) return;
    try {
      const { data } = await axios.post<Lesson>(
        `${BASE_URL}/api/lessons`,
        { url: newUrl, title: newTitle, description: newDesc },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setLessons((prev) => [...prev, { ...data, completed: false }]);
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
      setSelected(data);
    } catch (err) {
      console.error('Add lesson error:', err);
    }
  };

  const saveLesson = async () => {
    if (!editing || !user?.accessToken || !validForm) return;
    try {
      const { data } = await axios.put<Lesson>(
        `${BASE_URL}/api/lessons/${editing._id}`,
        { url: newUrl, title: newTitle, description: newDesc },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setLessons((prev) => prev.map((l) => (l._id === data._id ? { ...data, completed: l.completed } : l)));
      setSelected((s) => (s && s._id === data._id ? { ...data, completed: s.completed } : s));
      setEditing(null);
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
    } catch (err) {
      console.error('Save lesson error:', err);
    }
  };

  const deleteLesson = async (id: string) => {
    if (!user?.accessToken) return;
    try {
      await axios.delete(`${BASE_URL}/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setLessons((prev) => prev.filter((l) => l._id !== id));
      setSelected((s) => (s && s._id === id ? null : s));
    } catch (err) {
      console.error('Delete lesson error:', err);
    }
  };

  const toggleCompleted = (id: string) => {
    setLessons((prev) => prev.map((l) => (l._id === id ? { ...l, completed: !l.completed } : l)));
  };

  return (
    <div className="min-h-screen py-4 text-black">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-y-6 md:gap-x-8">
        <aside className="md:flex-1 md:w-1/2 bg-white p-4 border border-gray-200 rounded">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpenIcon className="w-6 h-6" /> Classroom
          </h2>

        {isAdmin && (
          <div className="bg-white shadow rounded-lg p-3 mb-4">
            <div className="h-2 bg-gray-200 rounded mb-3 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <input
              type="text"
              placeholder="YouTube video URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full rounded-lg mb-2 p-2 bg-inputBg text-inputText focus:ring-1 focus:ring-brand focus:outline-none"
            />
            <input
              type="text"
              placeholder="Lesson title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg mb-2 p-2 bg-inputBg text-inputText focus:ring-1 focus:ring-brand focus:outline-none"
            />
            <textarea
              placeholder="Short description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full rounded-lg mb-2 p-2 bg-inputBg text-inputText focus:ring-1 focus:ring-brand focus:outline-none"
            />
            {validForm && (
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src={`https://img.youtube.com/vi/${extractVideoId(newUrl)}/hqdefault.jpg`}
                  alt="thumbnail"
                  className="w-24 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{newTitle}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{newDesc}</p>
                </div>
              </div>
            )}
            <button
              onClick={editing ? saveLesson : addLesson}
              disabled={!validForm}
              className={`w-full py-2 rounded text-white ${validForm ? 'bg-brand' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {editing ? 'Save Lesson' : 'Add Lesson'}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setNewTitle('');
                  setNewUrl('');
                  setNewDesc('');
                }}
                className="w-full mt-2 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {lessons.length === 0 && (
            <p className="text-center text-gray-500">No lessons yet. Start by adding one!</p>
          )}
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className={`flex items-center p-2 rounded cursor-pointer ${selected && selected._id === lesson._id ? 'bg-cyan-50' : 'bg-white'}`}
              onClick={() => setSelected(lesson)}
            >
              <CheckIcon
                className={`w-5 h-5 mr-2 ${lesson.completed ? 'text-green-500' : 'text-gray-400'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompleted(lesson._id);
                }}
              />
              <span className="flex-1 truncate font-medium">{lesson.title}</span>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <PencilSquareIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(lesson);
                      setNewTitle(lesson.title);
                      setNewUrl(lesson.url);
                      setNewDesc(lesson.description || '');
                    }}
                    className="w-5 h-5 text-cyan-400 cursor-pointer"
                  />
                  <TrashIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLesson(lesson._id);
                    }}
                    className="w-5 h-5 text-red-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10">
        {selected ? (
          <>
            <h1 className="text-2xl font-bold mb-4">{selected.title}</h1>
            <div className="w-full max-w-4xl mb-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(selected.url)}`}
                  className="absolute top-0 left-0 w-full h-full rounded-xl shadow"
                  allowFullScreen
                />
              </div>
            </div>
            {selected.description && (
              <p className="text-lg text-gray-700 mb-2">{selected.description}</p>
            )}
            {selected.author?.username && (
              <p className="text-sm text-gray-500">By {selected.author.username}</p>
            )}
          </>
        ) : (
          <p className="flex items-center justify-center h-full text-gray-400 text-2xl">
            Select a lesson to get started
          </p>
        )}
      </main>
    </div>
  );
}
