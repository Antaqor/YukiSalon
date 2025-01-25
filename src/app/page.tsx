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

    // Category states
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(""); // for creating post
    const [filterCategory, setFilterCategory] = useState<string>("");     // for filtering

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    // 1) Fetch all categories
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/post-categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    };

    // 2) Fetch posts (optionally filter by category)
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

    // 3) Create post
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
            // Pass category in the body
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
            setSelectedCategory(""); // reset
        } catch (err: any) {
            console.error("Create post error:", err);
            if (err.response?.status === 403) {
                setError("Subscription expired. Please pay first!");
            } else {
                setError("Failed to create post.");
            }
        }
    };

    // On mount, fetch categories and all posts
    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, []);

    // Handler for changing filter
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = e.target.value;
        setFilterCategory(catId);
        fetchPosts(catId);  // re-fetch posts by that category
    };

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-3">Newsfeed</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}

            {/* CREATE POST FORM */}
            {loggedIn ? (
                <div className="mb-4">
                    <input
                        placeholder="Title"
                        className="border p-2 mb-2 w-full rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Content"
                        className="border p-2 w-full rounded"
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* CATEGORY DROPDOWN for creating new post */}
                    <select
                        className="border p-2 rounded mt-2 w-full"
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
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Post
                    </button>
                </div>
            ) : (
                <p className="text-gray-600 mb-4">
                    Нэвтэрч байж пост оруулна уу. (Subscribe эрх худалдаж авах)
                </p>
            )}

            {/* FILTER DROPDOWN */}
            <div className="mb-4">
                <label htmlFor="filter" className="mr-2 font-semibold">
                    Шүүх:
                </label>
                <select
                    id="filter"
                    className="border p-2 rounded"
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

            {/* POSTS LIST */}
            <div className="space-y-3">
                {posts.map((p) => (
                    <div key={p._id} className="border rounded p-3">
                        <h3 className="font-semibold">{p.title}</h3>
                        <p>{p.content}</p>
                        <small className="text-gray-500">
                            By {p.user?.username} —{" "}
                            {new Date(p.createdAt).toLocaleString()}{" "}
                            {p.user?.age ? `(Age: ${p.user?.age})` : ""}
                            {p.category ? ` • Category: ${p.category.name}` : ""}
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
}
