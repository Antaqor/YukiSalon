"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeartIcon as HeartSolid, BoltIcon } from "@heroicons/react/24/solid";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL, UPLOADS_URL } from "../lib/config";
import { formatPostDate } from "../lib/formatDate";
import type { Post } from "@/types/Post";

interface UserData {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface Reply {
  _id: string;
  user?: UserData;
  content: string;
}

interface Comment {
  _id: string;
  user?: UserData;
  content: string;
  replies?: Reply[];
}

interface Props {
  post: Post;
  onDelete?: (id: string) => void;
  onShareAdd?: (p: Post) => void;
}

export default function HomeFeedPost({ post, onDelete, onShareAdd }: Props) {
  const { user, login } = useAuth();
  const [postState, setPostState] = useState<Post>(post);
  const [openComments, setOpenComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [liked, setLiked] = useState(
    post.likes?.some((l) => (l as any)?._id ? (l as any)._id === user?._id : l === user?._id) || false
  );
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [shared, setShared] = useState(false);
  const [shares, setShares] = useState(post.shares || 0);

  const displayPost = postState.sharedFrom || postState;

  const handleLike = async () => {
    if (!user?.accessToken) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postState._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setPostState((p) => ({ ...p, likes: data.likes }));
      setLikes(data.likes.length);
      setLiked(true);
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async () => {
    if (!user?.accessToken || !commentText) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postState._id}/comment`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setPostState((p) => ({ ...p, comments: data.comments }));
      setCommentText("");
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user?.accessToken || !replyTexts[commentId]) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postState._id}/comment/${commentId}/reply`,
        { content: replyTexts[commentId] },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setPostState((p) => ({ ...p, comments: data.comments }));
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  const handleShare = async () => {
    if (!user?.accessToken || shared) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postState._id}/share`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setShares(data.shares);
      setShared(true);
      if (data.newPost) {
        onShareAdd?.(data.newPost);
      }
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleEdit = async () => {
    if (!user?.accessToken) return;
    const newContent = window.prompt("Edit post", postState.content);
    if (newContent === null) return;
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/posts/${postState._id}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      if (data.post) {
        setPostState((p) => ({ ...p, content: data.post.content }));
        setMenuOpen(false);
      }
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleDelete = async () => {
    if (!user?.accessToken) return;
    try {
      await axios.delete(`${BASE_URL}/api/posts/${postState._id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      onDelete?.(postState._id);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // follow/unfollow logic moved to profile page

  const postUser = postState.user;
  const isOwner = user?._id === postUser?._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#212121] text-white p-4 grid gap-4 rounded-none"
    >
      <div className="grid grid-cols-[auto,1fr] gap-5 group">
        {/* Avatar */}
        <div className="self-start">
          {postUser?.profilePicture ? (
            <Image
              src={`${BASE_URL}${postUser.profilePicture}`}
              alt="Avatar"
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-md"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gray-300 animate-pulse" />
          )}
        </div>
        {/* Body */}
        <div className="grid gap-2">
          <div className="grid grid-cols-[1fr,auto] items-center">
            <Link href={`/profile/${postUser?._id || ""}`}>            
              <span className="text-sm font-semibold hover:underline">
                {postUser?.username || "Unknown User"}
              </span>
            </Link>
            {/* Follow button removed - only available on profile page */}
            {isOwner && (
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
                  <div className="absolute right-0 mt-1 bg-[#333] text-white border border-gray-700 rounded">
                    <button
                      onClick={handleEdit}
                      className="block px-3 py-1 text-sm hover:bg-gray-600 w-full text-left"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="block px-3 py-1 text-sm hover:bg-gray-600 w-full text-left text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formatPostDate(postState.createdAt)}
          </span>
          <BoltIcon className="w-3 h-3 text-green-400 ml-1 inline" />
          {postState.sharedFrom && (
            <p className="text-xs text-gray-500">Shared from {postState.sharedFrom.user?.username}</p>
          )}
          <div className="relative">
            {(postState.sharedFrom ? postState.sharedFrom.content : postState.content) && (
              <p className="text-base whitespace-pre-wrap">
                {postState.sharedFrom ? postState.sharedFrom.content : postState.content}
              </p>
            )}
            {(postState.sharedFrom ? postState.sharedFrom.image : postState.image) && (
              <div className="relative w-full overflow-hidden rounded-lg mt-2">
                <Image
                  src={`${UPLOADS_URL}/${postState.sharedFrom ? postState.sharedFrom.image : postState.image}`}
                  alt="Post"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="grid grid-cols-3 items-center text-xs text-gray-600 w-full mt-2">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleLike}
          disabled={!user}
          className="flex items-center justify-center gap-1 hover:text-brand"
          aria-label={`Like (${likes})`}
        >
          {liked ? (
            <HeartSolid className="w-5 h-5 text-brand icon-hover-brand" />
          ) : (
            <HeartOutline className="w-5 h-5 icon-hover-brand" />
          )}
          <span>{likes}</span>
        </motion.button>
        <button
          onClick={() => setOpenComments((o) => !o)}
          disabled={!user}
          className="flex items-center justify-center gap-1 hover:text-brand"
          aria-label={`Comment (${postState.comments?.length || 0})`}
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5 icon-hover-brand" />
          <span>{postState.comments?.length || 0}</span>
        </button>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleShare}
          disabled={!user}
          className="flex items-center justify-center gap-1 hover:text-brand"
          aria-label={`Share (${shares})`}
        >
          <ArrowUpTrayIcon
            className={`w-5 h-5 ${shared ? "text-brand icon-hover-brand" : "icon-hover-brand"}`}
          />
          <span>{shares}</span>
        </motion.button>
      </div>
      {openComments && (
        <div className="mt-4 space-y-3">
          {postState.comments?.map((comment: Comment) => (
            <div key={comment._id} className="ml-4">
              <div className="flex items-start gap-2">
                {comment.user?.profilePicture && (
                  <Image
                    src={`${BASE_URL}${comment.user.profilePicture}`}
                    alt="avatar"
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 bg-gray-100 rounded p-2">
                  <p className="text-sm font-semibold">{comment.user?.username}</p>
                  <p className="text-sm">{comment.content}</p>
                  {comment.replies?.map((reply: Reply) => (
                    <div key={reply._id} className="ml-4 mt-2 flex gap-2 items-start">
                      {reply.user?.profilePicture && (
                        <Image
                          src={`${BASE_URL}${reply.user.profilePicture}`}
                          alt="avatar"
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 bg-gray-50 rounded p-2">
                        <p className="text-xs font-semibold">{reply.user?.username}</p>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      placeholder="Reply..."
                      className="flex-1 text-xs rounded p-1 bg-inputBg text-inputText focus:ring-1 focus:ring-brand focus:outline-none"
                      value={replyTexts[comment._id] || ""}
                      onChange={(e) =>
                        setReplyTexts((prev) => ({ ...prev, [comment._id]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => handleReply(comment._id)}
                      className="ml-2 text-xs text-blue-500"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 text-sm rounded p-2 bg-inputBg text-inputText focus:ring-1 focus:ring-brand focus:outline-none"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleComment} className="text-sm text-blue-500">
              Post
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
