"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { PhotoIcon, ChartBarIcon } from "@heroicons/react/24/outline";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posting, setPosting] = useState(false);
  const MAX_LENGTH = 500;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [imageFile]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) setImageFile(file);
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
        },
      });
      setContent("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onPost?.(data.post);
    } catch (err) {
      console.error("Create post error", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost();
      }}
      className="flex bg-white rounded-xl shadow px-4 py-5 m-4 max-w-xl mx-auto"
    >
      {user?.profilePicture ? (
        <Image
          src={`${BASE_URL}${user.profilePicture}`}
          alt="Avatar"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-brand"
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
        <input
          type="text"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={MAX_LENGTH}
          placeholder="What's happening?"
          className="w-full text-xl bg-transparent outline-none placeholder:text-gray-400 py-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {previewUrl && (
          <div className="relative mt-2">
            <img src={previewUrl} alt="preview" className="rounded-lg w-full" />
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1"
            >
              &times;
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-3 text-gray-400">
            <button type="button" onClick={triggerFileInput} aria-label="Add image">
              <PhotoIcon className="w-6 h-6 icon-hover-brand" />
            </button>
            <button type="button" aria-label="Add poll">
              <ChartBarIcon className="w-6 h-6 icon-hover-brand" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{content.length}/{MAX_LENGTH}</span>
            <button
              type="submit"
              disabled={posting || (!content.trim() && !imageFile)}
              className={`font-bold rounded-full px-6 py-2 transition-all active:scale-95 ${content.trim() || imageFile ? 'bg-brand text-white' : 'bg-gray-300 text-white cursor-not-allowed'}`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
