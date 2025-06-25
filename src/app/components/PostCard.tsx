"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { BoltIcon, HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import {
  HeartIcon as HeartOutline,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { formatPostDate } from "../lib/formatDate";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL, UPLOADS_URL } from "../lib/config";
import type { Post } from "@/types/Post";

interface User {
  _id?: string;
  username: string;
  profilePicture?: string;
  subscriptionExpiresAt?: string;
}

interface Props {
  post: Post;
  user: User;
  onDelete?: (id: string) => void;
  onShare?: (newPost: Post) => void;
}

export default function PostCard({ post, user, onDelete, onShare }: Props) {
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
  const [menuOpen, setMenuOpen] = useState(false);
  const displayPost = post.sharedFrom || post;

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
      if (data.newPost) {
        onShare?.(data.newPost);
      }
      login({ ...viewer, rating: (viewer.rating || 0) + 1 }, viewer.accessToken);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleEdit = async () => {
    if (!viewer?.accessToken) return;
    const newContent = window.prompt("Edit post", post.content);
    if (newContent === null) return;
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/posts/${post._id}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
      );
      if (data.post) {
        post.content = data.post.content;
        setMenuOpen(false);
      }
    } catch (err) {
      console.error("Edit post error:", err);
    }
  };

  const handleDelete = async () => {
    if (!viewer?.accessToken) return;
    try {
      await axios.delete(`${BASE_URL}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${viewer.accessToken}` },
      });
      onDelete?.(post._id);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="bg-white p-6 grid gap-4 border-b border-gray-200">
      <div className="flex gap-3 group">
        {user.profilePicture ? (
          <Image
            src={`${BASE_URL}${user.profilePicture}`}
            alt="avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
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
            {viewerId === post.user?._id && (
              <div className="ml-auto relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Post options"
                  className="p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h.01M12 12h.01M19 12h.01"
                    />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow">
                    <button
                      onClick={handleEdit}
                      className="block px-3 py-1 text-sm hover:bg-gray-100 w-full text-left"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="block px-3 py-1 text-sm hover:bg-gray-100 w-full text-left text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {post.sharedFrom && (
            <p className="text-xs text-gray-500">
              Shared from {post.sharedFrom.user?.username}
            </p>
          )}
          <div className="relative">
            {displayPost.content && (
              <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap">
                {displayPost.content}
              </p>
            )}
            {displayPost.image && (
              <Image
                src={`${UPLOADS_URL}/${displayPost.image}`}
                alt="Post"
                width={800}
                height={600}
                className="w-full rounded-lg mt-2 object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-3 items-center text-gray-500 text-xs mt-3">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="flex items-center justify-center gap-1 hover:text-brand"
              aria-label="Like"
            >
              {liked ? (
                <HeartSolid className="w-5 h-5 text-brand icon-hover-brand" />
              ) : (
                <HeartOutline className="w-5 h-5 icon-hover-brand" />
              )}
              <span>{likes}</span>
            </motion.button>
            <span className="text-center">
              {post.comments?.length || 0} Comments
            </span>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-1 hover:text-brand"
              aria-label="Share"
            >
              <ArrowUpTrayIcon
                className={shared ? "w-5 h-5 text-brand icon-hover-brand" : "w-5 h-5 icon-hover-brand"}
              />
              <span>{shares}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
