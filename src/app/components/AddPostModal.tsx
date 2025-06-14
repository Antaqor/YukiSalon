import React, { useState, useRef } from "react";
import Modal from "./Modal";
import { FiCamera, FiX, FiSmile } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const emojis = ["😀","😂","😍","😢","👍","🙏","🔥","🎉","🤔","🤩"];

interface Props {
  onClose: () => void;
  onPost?: (post: any) => void;
}

export default function AddPostModal({ onClose, onPost }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_LENGTH = 500;
  const BASE_URL = "https://www.vone.mn";

  const triggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };
  const removeImage = () => setImageFile(null);
  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojis(false);
  };

  const createPost = async () => {
    setError("");
    if (!content.trim()) return setError("Контентыг бөглөнө үү");
    if (content.length > MAX_LENGTH) return setError("Хэт урт контент");
    if (!user?.accessToken) return setError("Нэвтэрч ороогүй байна.");
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);
      const { data } = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onPost?.(data.post);
      setContent("");
      setImageFile(null);
      onClose();
    } catch (err) {
      console.error("Create post error:", err);
      setError("Алдаа гарлаа");
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create Post</h2>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-3 relative">
          <button
            onClick={triggerFileInput}
            className="p-2 border border-gray-300 rounded-full"
            aria-label="Add image"
          >
            <FiCamera className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEmojis((p) => !p)}
            className="p-2 border border-gray-300 rounded-full"
            aria-label="Add emoji"
          >
            <FiSmile className="w-5 h-5" />
          </button>
          {showEmojis && (
            <div className="absolute top-full mt-2 left-0 bg-white border rounded shadow grid grid-cols-5 gap-1 p-2 z-10">
              {emojis.map((e) => (
                <button key={e} onClick={() => addEmoji(e)} className="text-xl">
                  {e}
                </button>
              ))}
            </div>
          )}
          {imageFile && (
            <div className="relative w-full">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="h-32 w-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <textarea
            maxLength={MAX_LENGTH}
            placeholder="What's happening?"
            className="w-full bg-gray-100 text-sm text-gray-900 border border-gray-300 rounded-lg p-3 focus:outline-none resize-none"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <span className={`absolute bottom-2 right-3 text-xs ${content.length > MAX_LENGTH * 0.9 ? "text-red-500" : "text-gray-400"}`}>{content.length}/{MAX_LENGTH}</span>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={createPost}
          className="w-full bg-brandCyan text-black font-medium px-4 py-2 rounded-lg"
        >
          Post
        </button>
      </div>
    </Modal>
  );
}
