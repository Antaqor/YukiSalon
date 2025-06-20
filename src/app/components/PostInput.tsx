"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  PhotoIcon,
  FaceSmileIcon,
  ChartBarIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../lib/config";

interface Props {
  onPost?: (post?: any) => void;
}

export default function PostInput({ onPost }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posting, setPosting] = useState(false);
  const MAX_LENGTH = 500;

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) setImageFile(file);
  };

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  const createPost = async () => {
    if (!content.trim() && !imageFile) return;
    if (!user?.accessToken) return;
    try {
      setPosting(true);
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);
      const { data } = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setContent("");
      setImageFile(null);
      onPost?.(data.post);
    } catch (err) {
      console.error("Create post error", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 max-w-xl mx-auto">
      {user?.profilePicture ? (
        <Image
          src={`${BASE_URL}${user.profilePicture}`}
          alt="Avatar"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-brandCyan"
        />
      ) : (
        <div className="w-12 h-12 rounded-full mr-4 bg-gray-200" />
      )}
      <div className="flex-1">
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <textarea
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onInput={autoResize}
          maxLength={MAX_LENGTH}
          placeholder="What's happening?"
          className="w-full text-lg font-medium bg-transparent outline-none resize-none min-h-[64px] placeholder-gray-500 focus:border-b focus:border-brandCyan border-b"
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-4 text-gray-400">
            <button type="button" onClick={triggerFileInput} aria-label="Add image">
              <PhotoIcon className="w-6 h-6 hover:text-brandCyan" />
            </button>
            <button type="button" aria-label="Add emoji">
              <FaceSmileIcon className="w-6 h-6 hover:text-brandCyan" />
            </button>
            <button type="button" aria-label="Add poll">
              <ChartBarIcon className="w-6 h-6 hover:text-brandCyan" />
            </button>
            <button type="button" aria-label="Schedule">
              <CalendarIcon className="w-6 h-6 hover:text-brandCyan" />
            </button>
            <button type="button" aria-label="Add location">
              <MapPinIcon className="w-6 h-6 hover:text-brandCyan" />
            </button>
          </div>
          <button
            onClick={createPost}
            disabled={posting || (!content.trim() && !imageFile)}
            className="bg-brandCyan text-black font-bold rounded-full px-6 py-2 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
