"use client";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { BoltIcon, HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline, ShareIcon } from "@heroicons/react/24/outline";
import { formatPostDate } from "../lib/formatDate";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

interface User {
  _id?: string;
  username: string;
  profilePicture?: string;
  subscriptionExpiresAt?: string;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  likes?: string[];
  comments?: any[];
  shares?: number;
  user?: { _id: string };
}

interface Props {
  post: Post;
  user: User;
}

const BASE_URL = "https://www.vone.mn";
const UPLOADS_URL = `${BASE_URL}/api/uploads`;

export default function PostCard({ post, user }: Props) {
  const { user: viewer, login } = useAuth();
  const isPro = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt) > new Date()
    : false;
  const viewerId = viewer?._id;
  const [liked, setLiked] = useState(
    post.likes?.some((l) => (l as any) === viewerId) ?? false
  );
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [shared, setShared] = useState(false);
  const [shares, setShares] = useState(post.shares || 0);

  const handleLike = async () => {
    if (!viewer?.accessToken) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
      );
      setLikes(data.likes.length);
      setLiked(true);
      login({ ...viewer, rating: (viewer.rating || 0) + 1 }, viewer.accessToken);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleShare = async () => {
    if (!viewer?.accessToken || shared) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${post._id}/share`,
        {},
        { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
      );
      setShares(data.shares);
      setShared(true);
      login({ ...viewer, rating: (viewer.rating || 0) + 1 }, viewer.accessToken);
    } catch (err) {
      console.error("Share error:", err);
    }
  };
  return (
    <div className="bg-white p-6 grid gap-4 border-b border-gray-200">
      <div className="flex gap-3 group">
        {user.profilePicture ? (
          <img
            src={`${BASE_URL}${user.profilePicture}`}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover blur-sm group-hover:blur-0 transition"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold text-black">{user.username}</span>
            {isPro && <FaCheckCircle className="text-yellow-400 w-3 h-3" />}
            <span className="text-gray-400 ml-1 text-xs">
              {formatPostDate(post.createdAt)}
            </span>
            <BoltIcon className="w-3 h-3 text-green-400 ml-1" />
          </div>
          <div className="relative">
            {post.content && (
              <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            {post.image && (
              <img
                src={`${UPLOADS_URL}/${post.image}`}
                alt="Post"
                className="w-full rounded-lg mt-2 object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-3 items-center text-gray-500 text-xs mt-3">
            <button
              onClick={handleLike}
              className="flex items-center justify-center gap-1 hover:text-gray-700"
              aria-label="Like"
            >
              {liked ? (
                <HeartSolid className="w-4 h-4 text-red-500" />
              ) : (
                <HeartOutline className="w-4 h-4" />
              )}
              <span>{likes}</span>
            </button>
            <span className="text-center">{post.comments?.length || 0} Comments</span>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1 hover:text-gray-700"
              aria-label="Share"
            >
              <ShareIcon className={shared ? "w-4 h-4 text-green-500" : "w-4 h-4"} />
              <span>{shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
