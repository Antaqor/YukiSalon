"use client";
import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { formatPostDate } from "../lib/formatDate";
import { useAuth } from "../context/AuthContext";

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
  price?: number;
  unlockedBy?: (string | { _id: string })[];
  user?: { _id: string };
}

interface Props {
  post: Post;
  user: User;
}

const BASE_URL = "https://www.vone.mn";
const UPLOADS_URL = `${BASE_URL}/api/uploads`;

export default function PostCard({ post, user }: Props) {
  const { user: viewer } = useAuth();
  const isPro = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt) > new Date()
    : false;
  const viewerId = viewer?._id;
  const authorId = user._id || post.user?._id;
  const isLocked =
    !!post.price && post.price > 0 &&
    (!viewerId || (authorId !== viewerId && !post.unlockedBy?.some((u: any) => (u._id || u) === viewerId)));
  return (
    <div className="tweet border-b border-gray-700 p-4 max-w-xl mx-auto relative">
      <div className="flex gap-3">
        {user.profilePicture ? (
          <img
            src={`${BASE_URL}${user.profilePicture}`}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold text-white">{user.username}</span>
            {isPro && <FaCheckCircle className="text-yellow-400 w-3 h-3" />}
            <span className="text-gray-400 ml-1 text-xs">
              {formatPostDate(post.createdAt)}
            </span>
          </div>
          {isLocked ? (
            <div className="flex items-center justify-center h-28 bg-gray-800 rounded">
              <span className="text-xs text-white">Paid post – unlock to view</span>
            </div>
          ) : (
            <div>
              <p className="text-gray-200 text-sm mt-1 whitespace-pre-wrap">
                {post.content}
              </p>
              {post.image && (
                <img
                  src={`${UPLOADS_URL}/${post.image}`}
                  alt="Post"
                  className="w-full rounded-lg mt-2 object-cover"
                />
              )}
            </div>
          )}
          <div className="flex justify-between text-gray-400 text-xs mt-3">
            <span>{post.likes?.length || 0} Likes</span>
            <span>{post.comments?.length || 0} Comments</span>
            <span>{post.shares || 0} Shares</span>
          </div>
        </div>
      </div>
    </div>
  );
}
