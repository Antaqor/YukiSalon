"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PhotoIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../lib/config";

interface Props {
  onPost?: (post?: any) => void;
}

export default function NextGenPostInput({ onPost }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posting, setPosting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [ripple, setRipple] = useState(false);
  const MAX_LENGTH = 500;

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


  const createPost = async () => {
    if (!content.trim() && !imageFile) {
      setShowTooltip(true);
      return;
    }
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
      // Reload the page to ensure the newsfeed refreshes
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Create post error", err);
    } finally {
      setPosting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      setShowTooltip(true);
      return;
    }
    createPost();
  };


  useEffect(() => {
    if (ripple) {
      const timer = setTimeout(() => setRipple(false), 600);
      return () => clearTimeout(timer);
    }
  }, [ripple]);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const disabled = posting || (!content.trim() && !imageFile);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-[#212121] flex flex-col sm:flex-row items-center gap-3 w-full px-4 py-3"
    >
      {user?.profilePicture ? (
        <Image
          src={`${BASE_URL}${user.profilePicture}`}
          alt="Avatar"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-brand"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-200" />
      )}
      <div className="flex-1 relative pb-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={MAX_LENGTH}
          placeholder="What's happening?"
          className={`w-full bg-transparent outline-none text-sm sm:text-base placeholder-gray-400 transition-all duration-200 focus:text-[#30c9e8] ${focused ? 'py-3' : 'py-2'}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div
          className={`absolute bottom-0 right-2 text-xs text-gray-400 transition-opacity duration-200 ${content ? 'opacity-100' : 'opacity-0'}`}
        >
          {content.length}/{MAX_LENGTH}
        </div>
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
        <div className="flex items-center justify-between mt-2 w-full">
          <div className="flex gap-3 text-gray-400">
            <button
              type="button"
              onClick={triggerFileInput}
              aria-label="Add image"
            >
              <PhotoIcon className="w-6 h-6 icon-hover-brand" />
            </button>
            <button type="button" aria-label="Add poll">
              <ChartBarIcon className="w-6 h-6 icon-hover-brand" />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:static absolute right-4 bottom-4">
            <button
              type="submit"
              onClick={() => setRipple(true)}
              disabled={disabled}
              className={`font-bold rounded-full px-6 py-2 transition active:scale-95 focus:outline-none ${
                disabled ? "bg-gray-500 cursor-not-allowed" : "bg-[#30c9e8] text-[#171717]"}`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
      {showTooltip && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1">
          Add text or media first!
        </div>
      )}
    </form>
  );
}
