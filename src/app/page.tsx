"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    user?: { username: string; age?: number };
}

export default function HomePage() {
    const { user, loggedIn } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    // Fetch posts
    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/posts`);
            setPosts(res.data);
        } catch (err) {
            console.error("Fetch posts error:", err);
        }
    };

    // Create post
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
                { title, content },
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                }
            );
            setPosts((prev) => [res.data.post, ...prev]);
            setTitle("");
            setContent("");
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
        fetchPosts();
    }, []);

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-3">Newsfeed</h2>
            {error && <p className="text-red-500 mb-3">{error}</p>}

            {/* Post form */}
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
                    <button
                        onClick={createPost}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Post
                    </button>
                </div>
            ) : (
                <p className="text-gray-600 mb-4">
                    Please login to create a post. (Subscription required)
                </p>
            )}

            {/* Posts list */}
            <div className="space-y-3">
                {posts.map((p) => (
                    <div key={p._id} className="border rounded p-3">
                        <h3 className="font-semibold">{p.title}</h3>
                        <p>{p.content}</p>
                        <small className="text-gray-500">
                            By {p.user?.username} — {new Date(p.createdAt).toLocaleString()}{" "}
                            {p.user?.age ? `(Age: ${p.user?.age})` : ""}
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
}
