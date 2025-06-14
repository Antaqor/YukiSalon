"use client";
import React, { useRef, useState } from "react";
import { FiCamera } from "react-icons/fi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "https://www.vone.mn";

export default function NewPostPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const createPost = async () => {
        setError("");
        if (!content.trim()) {
            setError("Контентыг бөглөнө үү");
            return;
        }
        if (content.length > 500) {
            setError("Хэт урт контент");
            return;
        }
        if (!user?.accessToken) {
            setError("Нэвтэрч ороогүй байна.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("content", content);
            if (imageFile) formData.append("image", imageFile);

            await axios.post(`${BASE_URL}/api/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            router.push("/");
        } catch (err) {
            console.error("Create post error:", err);
            setError("Алдаа гарлаа");
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 p-4">
            <div className="max-w-xl mx-auto space-y-4">
                <h1 className="text-xl font-bold">Create Post</h1>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    onClick={triggerFileInput}
                    className="p-2 border border-gray-200 rounded-full hover:bg-gray-200"
                >
                    <FiCamera className="w-5 h-5 text-brandCyan" />
                </button>
                {imageFile && (
                    <span className="block text-xs text-gray-700 truncate">
                        {imageFile.name}
                    </span>
                )}
                <textarea maxLength={500}
                    placeholder="What's on your mind?"
                    className="w-full text-sm text-gray-900 border border-gray-200 rounded p-2 focus:outline-none"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                    onClick={createPost}
                    className="mt-3 bg-brandCyan text-black text-xs px-4 py-2 rounded hover:bg-[#00d4d4]"
                >
                    Post
                </button>
            </div>
        </div>
    );
}
