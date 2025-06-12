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
    const [postType, setPostType] = useState("free");
    const [price, setPrice] = useState(0);
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
        if (!user?.accessToken) {
            setError("Нэвтэрч ороогүй байна.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("content", content);
            formData.append("price", postType === "paid" ? String(price) : "0");
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
        <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white p-4">
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
                    className="p-2 border border-gray-200 dark:border-black rounded-full hover:bg-gray-100 dark:hover:bg-black"
                >
                    <FiCamera className="w-5 h-5 text-[#1D9BF0]" />
                </button>
                {imageFile && (
                    <span className="block text-xs text-gray-700 truncate">
                        {imageFile.name}
                    </span>
                )}
                <div className="space-x-2 text-sm">
                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="free"
                            checked={postType === "free"}
                            onChange={() => setPostType("free")}
                        />
                        Free
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="paid"
                            checked={postType === "paid"}
                            onChange={() => setPostType("paid")}
                        />
                        Paid
                    </label>
                </div>
                {postType === "paid" && (
                    <input
                        type="number"
                        className="w-32 p-1 text-sm bg-gray-200 dark:bg-gray-800 rounded"
                        placeholder="Price (VNT)"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                )}
                <textarea
                    placeholder="What's on your mind?"
                    className="w-full text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-black rounded p-2 focus:outline-none"
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                    onClick={createPost}
                    className="mt-3 bg-[#1D9BF0] text-white text-xs px-4 py-2 rounded hover:bg-[#1A8CD8]"
                >
                    Post
                </button>
            </div>
        </div>
    );
}
