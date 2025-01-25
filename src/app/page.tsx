"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import Skeleton from "react-loading-skeleton"; // Skeleton UI-ийн компонент
import "react-loading-skeleton/dist/skeleton.css";

interface PostCategory {
    _id: string;
    name: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    user?: {
        username: string;
        age?: number;
        mbti?: string; // Шинэ талбар нэмэх
    };
    category?: PostCategory;
}

export default function HomePage() {
    const { user, loggedIn } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    // useCallback ашиглан fetchCategories функцыг мемоизаци хийх
    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/post-categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    }, [BASE_URL]);

    // useCallback ашиглан fetchPosts функцыг мемоизаци хийх
    const fetchPosts = useCallback(async (categoryId?: string) => {
        try {
            let url = `${BASE_URL}/api/posts`;
            if (categoryId) {
                url += `?category=${categoryId}`;
            }
            const res = await axios.get(url);
            setPosts(res.data);
        } catch (err) {
            console.error("Fetch posts error:", err);
        }
    }, [BASE_URL]);

    const createPost = async () => {
        setError("");
        if (!title.trim() || !content.trim()) {
            setError("Title & content required.");
            return;
        }
        if (!user?.accessToken) {
            setError("Please login first.");
            return;
        }

        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts`,
                { title, content, category: selectedCategory },
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );
            // Prepend new post to the front of the array
            setPosts((prev) => [res.data.post, ...prev]);
            // Reset fields
            setTitle("");
            setContent("");
            setSelectedCategory("");
        } catch (err) {
            console.error("Create post error:", err);
            if (axios.isAxiosError(err) && err.response?.status === 403) {
                setError("Subscription expired. Please pay first!");
            } else {
                setError("Failed to create post.");
            }
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, [fetchCategories, fetchPosts]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = e.target.value;
        setFilterCategory(catId);
        fetchPosts(catId);
    };

    // Function to check if user has active subscription
    const hasActiveSubscription = () => {
        if (!user?.subscriptionExpiresAt) return false;
        const now = new Date();
        const expiry = new Date(user.subscriptionExpiresAt);
        return expiry > now;
    };

    const isSubscribed = hasActiveSubscription();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {error && <p className="text-red-600 mb-3">{error}</p>}

                {loggedIn && isSubscribed ? (
                    <div className="mb-6">
                        <input
                            placeholder="Title"
                            className="w-full border-b border-gray-300 px-2 py-2 text-sm text-black mb-2 focus:outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Content"
                            className="w-full border-b border-gray-300 px-2 py-2 text-sm text-black mb-2 focus:outline-none"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <select
                            className="w-full border-b border-gray-300 px-2 py-2 text-sm text-black mb-2 focus:outline-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">-- Choose Category --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={createPost}
                            className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 transition"
                        >
                            Post
                        </button>
                    </div>
                ) : loggedIn && !isSubscribed ? (
                    <div className="mb-6 p-4 border border-gray-300 rounded">
                        <p className="text-gray-600 mb-3">
                            Та subscription эрхгүй байна. Постуудыг харахын тулд subscribe хийнэ үү.
                        </p>
                        <button
                            onClick={() => window.location.href = "/subscribe"} // Subscribe хуудас руу шилжих
                            className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition"
                        >
                            Subscribe хийх
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-600 mb-4">
                        Нэвтэрч байж пост оруулна уу. (Subscription эрхтэй байх шаардлагатай)
                    </p>
                )}

                {/* Category Filter */}
                <div className="mb-4">
                    <label htmlFor="filter" className="mr-2 font-semibold">
                        Шүүх:
                    </label>
                    <select
                        id="filter"
                        className="border-b border-gray-300 px-2 py-2 text-sm text-black focus:outline-none"
                        value={filterCategory}
                        onChange={handleFilterChange}
                        disabled={!isSubscribed} // Subscription байхгүй бол шүүлтүүрийг идэвхгүй болгох
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                    {isSubscribed ? (
                        posts.map((p) => (
                            <div key={p._id} className="border-b border-gray-300 pb-3">
                                <h3 className="font-semibold">{p.title}</h3>
                                <p className="mt-1">{p.content}</p>
                                <small className="text-gray-500 block mt-2">
                                    By {p.user?.username} {p.user?.mbti ? `• MBTI: ${p.user.mbti}` : ""} —{" "}
                                    {new Date(p.createdAt).toLocaleString()}
                                    {p.user?.age ? ` (Age: ${p.user.age})` : ""}
                                    {p.category ? ` • Category: ${p.category.name}` : ""}
                                </small>
                            </div>
                        ))
                    ) : loggedIn ? (
                        // Subscription байхгүй бол skeleton UI болон blurred текст
                        Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="border-b border-gray-300 pb-3">
                                <h3 className="font-semibold">
                                    <Skeleton width={`80%`} />
                                </h3>
                                <p className="mt-1">
                                    <Skeleton count={3} />
                                </p>
                                <small className="text-gray-500 block mt-2">
                                    <Skeleton width={`60%`} />
                                </small>
                            </div>
                        ))
                    ) : (
                        // Нэвтрэхгүй бол пост харагдахгүй
                        <p className="text-gray-600">
                            Постуудыг харахын тулд нэвтэрнэ үү.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
