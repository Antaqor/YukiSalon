"use client";
import React, { useRef, useState } from "react";
import { FiCamera, FiX } from "react-icons/fi";
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
    const MAX_LENGTH = 500;

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const removeImage = () => {
        setImageFile(null);
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
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-xl space-y-6 bg-gray-900 p-6 rounded-2xl shadow-xl transition-smooth">
                <h1 className="text-2xl font-semibold">Create Post</h1>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex items-center gap-3">
                    <button
                        onClick={triggerFileInput}
                        className="p-3 border border-gray-700 rounded-full tesla-hover"
                        aria-label="Add image"
                    >
                        <FiCamera className="w-5 h-5 text-brandCyan" />
                    </button>
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
                        className="w-full bg-gray-800 text-sm text-white border border-gray-700 rounded-lg p-3 pr-12 focus:outline-none focus:border-brandCyan resize-none"
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <span
                        className={`absolute bottom-2 right-3 text-xs ${content.length > MAX_LENGTH * 0.9 ? "text-red-500" : "text-gray-400"}`}
                    >
                        {content.length}/{MAX_LENGTH}
                    </span>
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                    onClick={createPost}
                    className="w-full bg-brandCyan text-black font-medium px-4 py-2 rounded-lg tesla-hover"
                >
                    Post
                </button>
            </div>
        </div>
    );
}
