"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import FAQSection from "./components/FAQSection";

interface PostCategory {
    _id: string;
    name: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    likes: string[];
    user?: {
        username: string;
        age?: number;
    };
    category?: PostCategory;
}

const PostSkeletonLoader = () => (
    <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse"
        }}
        className="border-b border-gray-200 pb-4"
    >
        <div className="flex justify-between items-start">
            <div className="w-full">
                <Skeleton
                    width={150}
                    height={24}
                    className="mb-2"
                    baseColor="#f3f4f6"
                    highlightColor="#e5e7eb"
                />
                <Skeleton
                    count={3}
                    className="mb-1"
                    baseColor="#f3f4f6"
                    highlightColor="#e5e7eb"
                />
                <div className="flex items-center gap-2 mt-2">
                    <Skeleton
                        circle
                        width={24}
                        height={24}
                        baseColor="#f3f4f6"
                        highlightColor="#e5e7eb"
                    />
                    <Skeleton
                        width={100}
                        height={16}
                        baseColor="#f3f4f6"
                        highlightColor="#e5e7eb"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Skeleton
                    width={30}
                    height={16}
                    baseColor="#f3f4f6"
                    highlightColor="#e5e7eb"
                />
            </div>
        </div>
    </motion.div>
);

export default function HomePage() {
    const { user, loggedIn } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";
    const latestPost = posts[0];
    const isSubscribed = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) > new Date() : false;

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/post-categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    }, [BASE_URL]);

    const fetchPosts = useCallback(async (categoryId?: string) => {
        try {
            const url = categoryId
                ? `${BASE_URL}/api/posts?category=${categoryId}`
                : `${BASE_URL}/api/posts`;
            const res = await axios.get(url);
            setPosts(res.data);
        } catch (err) {
            console.error("Fetch posts error:", err);
        }
    }, [BASE_URL]);

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
            setPosts(prev => [res.data.post, ...prev]);
            resetForm();
        } catch (err) {
            handlePostError(err);
        }
    };

    const handleLike = async (postId: string) => {
        if (!user?.accessToken) return;

        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setPosts(prev => prev.map(post =>
                post._id === postId ? { ...post, likes: res.data.likes } : post
            ));
        } catch (err) {
            console.error("Like хийхэд алдаа гарлаа:", err);
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setSelectedCategory("");
        setError("");
    };

    const handlePostError = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            setError(err.response?.status === 403
                ? "Та subscription-ээ сунгана уу"
                : "Алдаа гарлаа");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, [fetchCategories, fetchPosts]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <FAQSection />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error && (
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="text-red-600 mb-4 p-3 bg-red-50 rounded"
                        >
                            {error}
                        </motion.div>
                    )}

                    {loggedIn && (
                        <motion.div
                            className={`space-y-3 mb-6 ${!isSubscribed && "opacity-50 pointer-events-none"}`}
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
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
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

                    {loggedIn && !isSubscribed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 p-4 bg-white border border-gray-300 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 border border-blue-200">
                                    <svg
                                        className="w-6 h-6 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="square"
                                            strokeLinejoin="miter"
                                            strokeWidth="2"
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Гишүүнчлэлийн давуу эрх
                                    </h3>
                                    <p className="text-gray-600 mt-1 text-base">
                                        Бүрэн эрхтэй үзэхийн тулд нэгдэх шаардлагатай
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.location.href = "/subscribe"}
                                    className="bg-blue-600 text-white px-5 py-2.5 text-base font-medium hover:bg-blue-700 transition-colors border border-blue-700"
                                >
                                    Нэгдэх
                                </button>
                            </div>
                        </motion.div>
                    )}

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
                            disabled={!isSubscribed}
                        >
                            <option value="">Бүх ангилал</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </motion.div>

                    <div className="space-y-6">
                        {isSubscribed ? (
                            posts.map((post, index) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-b border-gray-200 pb-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 line-clamp-3">
                                                {post.content}
                                            </p>
                                            <div className="mt-2 text-sm text-gray-400">
                                                <span>{post.user?.username}</span>
                                                {post.category && <span> • {post.category.name}</span>}
                                                <span> • {new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleLike(post._id)}
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
                            ))
                        ) : (
                            <>
                                {latestPost && (
                                    <div className="relative group">
                                        <div className="blur-sm pointer-events-none">
                                            <div className="border-b border-gray-200 pb-4">
                                                <h3 className="font-semibold text-lg mb-2">
                                                    {latestPost.title}
                                                </h3>
                                                <p className="text-gray-600 line-clamp-3">
                                                    {latestPost.content}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent p-4">
                                            <motion.div
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className="text-center space-y-4"
                                            >
                                                <p className="text-lg font-medium text-gray-700">
                                                    {loggedIn
                                                        ? "Бүрэн контентыг үзэхийн тулд гишүүнчлэлд нэгдээрэй!"
                                                        : "Нэвтрээд контентыг бүрэн үзээрэй!"}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </div>
                                )}
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <PostSkeletonLoader key={index} />
                                ))}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}