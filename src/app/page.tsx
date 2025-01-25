"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

interface PostCategory {
    _id: string;
    name: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    user?: { username: string; age?: number };
    category?: PostCategory;
}

export default function HomePage() {
    const { user, loggedIn } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [filterCategory, setFilterCategory] = useState<string>("");

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/post-categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    };

    const fetchPosts = async (categoryId?: string) => {
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
    };

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
            if (err.response?.status === 403) {
                setError("Subscription expired. Please pay first!");
            } else {
                setError("Failed to create post.");
            }
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = e.target.value;
        setFilterCategory(catId);
        fetchPosts(catId);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <h2 className="text-2xl font-semibold mb-4 text-black">
                    Newsfeed
                </h2>
                {error && <p className="text-red-600 mb-3">{error}</p>}

                {loggedIn ? (
                    <div className="mb-6">
                        <input
                            placeholder="Title"
                            className="w-full border border-gray-300 px-3 py-2 text-sm text-black mb-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Content"
                            className="w-full border border-gray-300 px-3 py-2 text-sm text-black mb-2"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <select
                            className="w-full border border-gray-300 px-3 py-2 text-sm text-black mb-2"
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
                ) : (
                    <p className="text-gray-600 mb-4">
                        Нэвтэрч байж пост оруулна уу. (Subscription эрхтэй байх шаардлагатай)
                    </p>
                )}

                <div className="mb-4">
                    <label htmlFor="filter" className="mr-2 font-semibold text-black">
                        Шүүх:
                    </label>
                    <select
                        id="filter"
                        className="border border-gray-300 px-3 py-2 text-sm text-black"
                        value={filterCategory}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    {posts.map((p) => (
                        <div key={p._id} className="border border-gray-300 p-4">
                            <h3 className="font-semibold text-black">{p.title}</h3>
                            <p className="text-black">{p.content}</p>
                            <small className="text-gray-500 block mt-2">
                                By {p.user?.username} — {new Date(p.createdAt).toLocaleString()}
                                {p.user?.age ? ` (Age: ${p.user?.age})` : ""}
                                {p.category ? ` • Category: ${p.category.name}` : ""}
                            </small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
