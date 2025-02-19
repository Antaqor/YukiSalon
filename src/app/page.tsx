"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "./context/AuthContext"; // or wherever your AuthContext is
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";

interface PostCategory {
    _id: string;
    name: string;
}

interface UserData {
    _id: string;
    username: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    likes: string[];
    user?: UserData;
    category?: PostCategory;
}

export default function HomePage() {
    const { user, loggedIn } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [filterCategory, setFilterCategory] = useState("");

    // local states for new post creation
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [error, setError] = useState("");

    const BASE_URL = "https://vone.mn"

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/post-categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Category fetch error:", err);
        }
    }, [BASE_URL]);

    // Fetch posts (optional filter by category ID)
    const fetchPosts = useCallback(
        async (categoryId?: string) => {
            try {
                let url = `${BASE_URL}/api/posts`;
                if (categoryId) {
                    url += `?category=${categoryId}`;
                }
                const res = await axios.get(url);
                setPosts(res.data);
            } catch (err) {
                console.error("Post fetch error:", err);
            }
        },
        [BASE_URL]
    );

    // Create post (requires login)
    const createPost = async () => {
        setError("");
        if (!title.trim() || !content.trim()) {
            setError("Гарчиг болон контентыг бөглөнө үү");
            return;
        }
        if (!user?.accessToken) {
            setError("Нэвтэрч байна уу");
            return;
        }

        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts`,
                { title, content, category: selectedCategory },
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            // Prepend the new post
            setPosts((prev) => [res.data.post, ...prev]);
            setTitle("");
            setContent("");
            setSelectedCategory("");
        } catch (err) {
            console.error("Create post error:", err);
            setError("Алдаа гарлаа");
        }
    };

    // Like post (requires login)
    const handleLike = async (postId: string) => {
        if (!user?.accessToken) return;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            const updatedLikes = res.data.likes;
            // Update local state
            setPosts((prev) =>
                prev.map((p) => (p._id === postId ? { ...p, likes: updatedLikes } : p))
            );
        } catch (err) {
            console.error("Like error:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchPosts(); // initial, no category filter
    }, [fetchCategories, fetchPosts]);

    // UI
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Error msg */}
                {error && (
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="text-red-600 mb-4 p-3 bg-red-50 rounded"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Create new post (if logged in) */}
                {loggedIn && (
                    <motion.div
                        className="space-y-3 mb-6"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                    >
                        <input
                            placeholder="Гарчиг"
                            className="w-full border-b border-gray-300 p-2 focus:outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Контент"
                            className="w-full border-b border-gray-300 p-2 focus:outline-none"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <select
                            className="w-full border-b border-gray-300 p-2 focus:outline-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">-- Ангилал сонгох --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={createPost}
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                        >
                            Нийтлэх
                        </button>
                    </motion.div>
                )}

                {/* Category filter dropdown */}
                <motion.div
                    className="mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <select
                        className="w-full border-b border-gray-300 p-2 focus:outline-none"
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            fetchPosts(e.target.value);
                        }}
                    >
                        <option value="">Бүх ангилал</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* List posts */}
                <div className="space-y-6">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-200 pb-4"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                                    <p className="text-gray-600">{post.content}</p>
                                    <div className="mt-2 text-sm text-gray-400">
                                        {/* CLICKABLE USERNAME => routes to /profile/[post.user._id] */}
                                        {post.user?._id ? (
                                            <Link href={`/profile/${post.user._id}`}>
                                                <span className="text-blue-500 hover:underline">{post.user.username}</span>
                                            </Link>
                                        ) : (
                                            <span>{post.user?.username}</span>
                                        )}
                                        {post.category && <span> • {post.category.name}</span>}
                                        <span> • {new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLike(post._id)}
                                    disabled={!loggedIn}
                                    className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                                >
                                    {post.likes.includes(user?.id || "") ? (
                                        <FaHeart className="text-red-500" />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                    <span>{post.likes.length}</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
