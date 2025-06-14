"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrendingUp } from "react-icons/fi";

interface Post {
  _id: string;
  content: string;
  likes?: string[];
  comments?: { _id: string }[];
  shares?: number;
}

interface TrendingItem {
  id: string;
  text: string;
  score: number;
}

const BASE_URL = "https://www.vone.mn";

const TrendingTopics: React.FC = () => {
  const [topics, setTopics] = useState<TrendingItem[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/posts`);
        const items: TrendingItem[] = res.data.map((p: Post) => {
          const score =
            (p.likes?.length || 0) +
            (p.comments?.length || 0) +
            (p.shares || 0);
          const text = p.content.length > 80 ? `${p.content.slice(0, 77)}...` : p.content;
          return { id: p._id, text, score };
        });
        items.sort((a, b) => b.score - a.score);
        setTopics(items.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="p-4 transition-shadow duration-200 hover:shadow-md">
      <h2 className="flex items-center font-semibold mb-3">
        <FiTrendingUp className="w-5 h-5 mr-2 text-brandCyan" />
        Юу болж байна вэ
      </h2>
      <ul className="space-y-2 text-sm">
        {topics.map((t) => (
          <li key={t.id} className="truncate">{t.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingTopics;
