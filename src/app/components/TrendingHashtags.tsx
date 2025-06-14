"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCamera } from "react-icons/fi";

interface Hashtag {
  tag: string;
  count: number;
}

const BASE_URL = "https://www.vone.mn";

const TrendingHashtags: React.FC = () => {
  const [tags, setTags] = useState<Hashtag[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/posts`);
        const hashtagCount: Record<string, number> = {};
        res.data.forEach((post: any) => {
          const hashtags = post.content.match(/#\w+/g);
          if (hashtags) {
            hashtags.forEach((tag: string) => {
              hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
            });
          }
        });
        const trending = Object.entries(hashtagCount)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => (b.count as number) - (a.count as number))
          .slice(0, 5);
        setTags(trending);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="p-4 transition-shadow duration-200 hover:shadow-md">
      <h2 className="flex items-center font-semibold mb-3">
        <FiCamera className="w-5 h-5 mr-2 text-brandCyan" />
        Тренд хэштегүүд
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t.tag}
            className="px-3 py-1 text-xs bg-gray-200 rounded-full"
          >
            {t.tag} ({t.count})
          </span>
        ))}
      </div>
    </div>
  );
};

export default TrendingHashtags;
