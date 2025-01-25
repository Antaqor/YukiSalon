"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import Skeleton from "react-loading-skeleton"; // Skeleton UI component
import "react-loading-skeleton/dist/skeleton.css";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons

interface PostCategory {
    _id: string;
    name: string;
}

interface LikedUser {
    _id: string;
    username: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    user?: {
        username: string;
        age?: number;
    };
    category?: PostCategory;
    likes: LikedUser[];
}

export default function HomePage() {
    const { user, loggedIn } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [loadingPosts, setLoadingPosts] = useState(true); // Loading state for posts
    const [loadingCategories, setLoadingCategories] = useState(true); // Loading state for categories

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/post-categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        } finally {
            setLoadingCategories(false);
        }
    }, [BASE_URL]);

    // Fetch posts
    const fetchPosts = useCallback(async (categoryId?: string) => {
        setLoadingPosts(true);
        try {
            let url = `${BASE_URL}/api/posts`;
            if (categoryId) {
                url += `?category=${categoryId}`;
            }
            const res = await axios.get(url);
            setPosts(res.data);
        } catch (err) {
            console.error("Fetch posts error:", err);
        } finally {
            setLoadingPosts(false);
        }
    }, [BASE_URL]);

    // Create a new post
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
            setPosts((prev) => [res.data.post, ...prev]);
            setTitle("");
            setContent("");
            setSelectedCategory("");
        } catch (err: any) {
            console.error("Create post error:", err);
            setError(
                axios.isAxiosError(err) && err.response?.status === 403
                    ? "Subscription expired. Please pay first!"
                    : "Failed to create post."
            );
        }
    };

    // Like a post
    const likePost = async (postId: string) => {
        if (!user?.accessToken) {
            setError("Please login first.");
            return;
        }

        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, likes: res.data.likes } : post
                )
            );
        } catch (err: any) {
            console.error("Like post error:", err);
            setError(
                axios.isAxiosError(err) && err.response?.data?.error
                    ? err.response.data.error
                    : "Failed to like post."
            );
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

    // Check if user has active subscription
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
                        {loadingCategories ? (
                            <Skeleton height={40} width="100%" />
                        ) : (
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
                        )}
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
                            onClick={() => (window.location.href = "/subscribe")}
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

                <div className="space-y-4">
                    {loadingPosts ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="border-b border-gray-300 pb-3">
                                <Skeleton height={30} width="60%" />
                                <Skeleton height={20} width="80%" count={2} />
                                <Skeleton height={20} width="40%" />
                            </div>
                        ))
                    ) : (
                        posts.map((p) => {
                            const hasLiked = user
                                ? p.likes.some((like) => like._id === user.id)
                                : false;
                            return (
                                <div key={p._id} className="border-b border-gray-300 pb-3">
                                    <h3 className="font-semibold">{p.title}</h3>
                                    <p className="mt-1">{p.content}</p>
                                    <small className="text-gray-500 block mt-2">
                                        By {p.user?.username} —{" "}
                                        {new Date(p.createdAt).toLocaleString()}
                                        {p.user?.age ? ` (Age: ${p.user.age})` : ""}
                                        {p.category ? ` • Category: ${p.category.name}` : ""}
                                    </small>
                                    <div className="mt-2 flex items-center">
                                        <button
                                            onClick={() => likePost(p._id)}
                                            className={`text-xl focus:outline-none ${
                                                hasLiked
                                                    ? "text-red-500"
                                                    : "text-gray-400 hover:text-red-500 transition"
                                            }`}
                                            disabled={hasLiked}
                                            aria-label={hasLiked ? "Liked" : "Like"}
                                        >
                                            {hasLiked ? <FaHeart /> : <FaRegHeart />}
                                        </button>
                                        <span className="ml-2 text-sm text-gray-700">
                                            {p.likes.length}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
