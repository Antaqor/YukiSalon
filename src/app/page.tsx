"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import { motion } from "framer-motion";

interface UserData {
    _id: string;
    username: string;
    following?: string[];
}

interface Post {
    _id: string;
    content: string;
    image?: string;
    createdAt: string;
    likes: string[];
    user?: UserData;
}

interface Hashtag {
    tag: string;
    count: number;
}

export default function HomePage() {
    const { user, loggedIn, login } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
    const [filterHashtag, setFilterHashtag] = useState("");

    const BASE_URL = "https://vone.mn";
    const fileInputRef = useRef<HTMLInputElement>(null);
    const UPLOADS_URL = `${BASE_URL}/uploads`;
    // 1) Fetch posts
    const fetchPosts = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/posts`);
            console.log("Fetched posts =>", res.data);
            setPosts(res.data);
            setAllPosts(res.data);
            computeTrendingHashtags(res.data);
        } catch (err) {
            console.error("Post fetch error:", err);
        }
    }, [BASE_URL]);

    // 2) Compute trending hashtags
    const computeTrendingHashtags = (postsData: Post[]) => {
        const hashtagCount: Record<string, number> = {};
        postsData.forEach((post) => {
            const hashtags = post.content.match(/#\w+/g);
            if (hashtags) {
                hashtags.forEach((tag) => {
                    hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
                });
            }
        });
        const trending: Hashtag[] = Object.entries(hashtagCount).map(([tag, count]) => ({
            tag,
            count,
        }));
        trending.sort((a, b) => b.count - a.count);
        setTrendingHashtags(trending.slice(0, 5));
    };

    // 3) Filter posts by hashtag
    const filterPostsByHashtag = (hashtag: string) => {
        if (!hashtag) {
            setPosts(allPosts);
        } else {
            const filtered = allPosts.filter((post) => post.content.includes(hashtag));
            setPosts(filtered);
        }
        setFilterHashtag(hashtag);
    };

    // 4) Create a new post
    const createPost = async () => {
        setError("");
        if (!content.trim()) {
            setError("Контентыг бөглөнө үү");
            return;
        }
        if (!user?.accessToken) {
            setError("Нэвтэрч байна уу");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("content", content);
            if (imageFile) {
                formData.append("image", imageFile);
                console.log("Appending image file =>", imageFile.name);
            }

            const res = await axios.post(`${BASE_URL}/api/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Created post =>", res.data.post);
            setPosts((prev) => [res.data.post, ...prev]);
            setAllPosts((prev) => [res.data.post, ...prev]);
            computeTrendingHashtags([res.data.post, ...allPosts]);
            setContent("");
            setImageFile(null);
        } catch (err) {
            console.error("Create post error:", err);
            setError("Алдаа гарлаа");
        }
    };

    // Trigger hidden file input
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // 6) Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            console.log("Selected file =>", e.target.files[0].name);
        }
    };

    // 7) Like post
    const handleLike = async (postId: string) => {
        if (!user?.accessToken) return;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            console.log("Like response =>", res.data);
            const updatedLikes = res.data.likes;
            setPosts((prev) =>
                prev.map((p) => (p._id === postId ? { ...p, likes: updatedLikes } : p))
            );
        } catch (err) {
            console.error("Like error:", err);
        }
    };

    // 8) Follow/Unfollow
    const handleFollow = async (targetUserId: string) => {
        if (!user?.accessToken) return;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/users/${targetUserId}/follow`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            console.log("Follow response =>", res.data);
            const updatedFollowing = user.following ? [...user.following, targetUserId] : [targetUserId];
            login({ ...user, following: updatedFollowing }, user.accessToken);
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    const handleUnfollow = async (targetUserId: string) => {
        if (!user?.accessToken) return;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/users/${targetUserId}/unfollow`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            console.log("Unfollow response =>", res.data);
            if (user.following) {
                const updatedFollowing = user.following.filter((id) => id !== targetUserId);
                login({ ...user, following: updatedFollowing }, user.accessToken);
            }
        } catch (err: any) {
            if (
                err.response &&
                err.response.status === 400 &&
                err.response.data?.error === "You are not following this user"
            ) {
                console.log("Idempotent unfollow => success anyway");
                if (user.following) {
                    const updatedFollowing = user.following.filter((id) => id !== targetUserId);
                    login({ ...user, following: updatedFollowing }, user.accessToken);
                }
            } else {
                console.error("Unfollow error:", err);
            }
        }
    };

    // On mount, fetch posts
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* If error => show message */}
                {error && (
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="text-red-600 mb-4 p-3 bg-red-50 rounded"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Trending Hashtags */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Trending Hashtags</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 rounded ${filterHashtag === "" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                            onClick={() => filterPostsByHashtag("")}
                        >
                            Бүх
                        </button>
                        {trendingHashtags.map((hashtag) => (
                            <button
                                key={hashtag.tag}
                                className={`px-3 py-1 rounded ${
                                    filterHashtag === hashtag.tag ? "bg-blue-500 text-white" : "bg-gray-200"
                                }`}
                                onClick={() => filterPostsByHashtag(hashtag.tag)}
                            >
                                {hashtag.tag} ({hashtag.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create new post */}
                {loggedIn && (
                    <motion.div className="space-y-3 mb-6" initial={{ y: -20 }} animate={{ y: 0 }}>
                        <div className="flex items-center gap-2">
                            {/* Hidden file input for images */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 border border-gray-300 rounded-full hover:bg-gray-100"
                            >
                                <FiCamera className="w-6 h-6 text-gray-600" />
                            </button>
                            {imageFile && <span className="text-sm text-gray-700">{imageFile.name}</span>}
                        </div>
                        <textarea
                            placeholder="Контент бичнэ үү..."
                            className="w-full border-b border-gray-300 p-2 focus:outline-none"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button
                            onClick={createPost}
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                        >
                            Нийтлэх
                        </button>
                    </motion.div>
                )}

                {/* List posts */}
                <div className="space-y-6">
                    {posts.map((post, index) => {
                        const postUser = post.user;
                        return (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-200 pb-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-600">{post.content}</p>
                                        {/* Show image if present */}
                                        {post.image && (
                                            <img
                                                src={`${UPLOADS_URL}/${post.image}`}
                                                alt="Post Image"
                                                className="mt-2 max-w-full rounded"
                                                onError={(e) => (e.currentTarget.style.display = "none")} // Image not found үед алга болгох
                                            />
                                        )}
                                        <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                                            {postUser ? (
                                                <>
                                                    <Link href={`/profile/${postUser._id}`}>
                                                        <span className="text-blue-500 hover:underline">{postUser.username}</span>
                                                    </Link>
                                                    {loggedIn && user && user._id !== postUser._id && (
                                                        <>
                                                            {user.following?.includes(postUser._id) ? (
                                                                <button
                                                                    onClick={() => handleUnfollow(postUser._id)}
                                                                    className="text-sm text-green-600"
                                                                >
                                                                    Unfollow
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleFollow(postUser._id)}
                                                                    className="text-sm text-blue-600"
                                                                >
                                                                    Follow
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <span>Unknown User</span>
                                            )}
                                            <span> • {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        disabled={!loggedIn}
                                        className="flex items-center gap-1 text-gray-500 hover:text-red-500"
                                    >
                                        {post.likes.includes(user?._id || "") ? (
                                            <FaHeart className="text-red-500" />
                                        ) : (
                                            <FaRegHeart />
                                        )}
                                        <span>{post.likes.length}</span>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
