"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import { motion } from "framer-motion";

interface UserData {
    _id: string;
    username: string;
    profilePicture?: string;
    following?: string[];
}

interface Post {
    _id: string;
    content: string;
    image?: string;
    images?: string[];
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

    const BASE_URL = "https://www.vone.mn";
    const UPLOADS_URL = `https://www.vone.mn/uploads`;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch posts on mount
    const fetchPosts = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/posts`);
            setPosts(res.data);
            setAllPosts(res.data);
            computeTrendingHashtags(res.data);
        } catch (err) {
            console.error("Post fetch error:", err);
        }
    }, [BASE_URL]);

    // Compute trending hashtags
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
        const trending: Hashtag[] = Object.entries(hashtagCount).map(
            ([tag, count]) => ({ tag, count })
        );
        trending.sort((a, b) => b.count - a.count);
        setTrendingHashtags(trending.slice(0, 5));
    };

    // Filter posts by hashtag
    const filterPostsByHashtag = (hashtag: string) => {
        if (!hashtag) {
            setPosts(allPosts);
        } else {
            const filtered = allPosts.filter((post) => post.content.includes(hashtag));
            setPosts(filtered);
        }
        setFilterHashtag(hashtag);
    };

    // Create a new post (with optional image)
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
            if (imageFile) formData.append("image", imageFile);

            const res = await axios.post(`${BASE_URL}/api/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

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

    // Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // Like a post
    const handleLike = async (postId: string) => {
        if (!user?.accessToken) return;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            const updatedLikes = res.data.likes;
            setPosts((prev) =>
                prev.map((p) => (p._id === postId ? { ...p, likes: updatedLikes } : p))
            );
        } catch (err) {
            console.error("Like error:", err);
        }
    };

    // Follow / Unfollow
    const handleFollow = async (targetUserId: string) => {
        if (!user?.accessToken) return;
        try {
            await axios.post(
                `${BASE_URL}/api/users/${targetUserId}/follow`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            const updatedFollowing = user.following
                ? [...user.following, targetUserId]
                : [targetUserId];
            login({ ...user, following: updatedFollowing }, user.accessToken);
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    const handleUnfollow = async (targetUserId: string) => {
        if (!user?.accessToken) return;
        try {
            await axios.post(
                `${BASE_URL}/api/users/${targetUserId}/unfollow`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            if (user.following) {
                const updatedFollowing = user.following.filter((id) => id !== targetUserId);
                login({ ...user, following: updatedFollowing }, user.accessToken);
            }
        } catch (err: any) {
            console.error("Unfollow error:", err);
        }
    };

    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            {/* Outer Grid Layout */}
            <div
                className="mx-auto max-w-5xl w-full grid"
                style={{
                    gridTemplateColumns:
                        "var(--barcelona-threadline-column-width) minmax(0, 1fr)",
                }}
            >
                {/* Sidebar: Trending Hashtags */}
                <aside>
                    <div className="bg-white p-4 grid gap-3">
                        <div className="grid grid-cols-[auto,1fr] items-center gap-2">
                            <FiCamera className="w-5 h-5 text-[#1D9BF0]" />
                            <h2 className="text-base font-semibold">Trending Hashtags</h2>
                        </div>
                        <div
                            className="gap-2"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                            }}
                        >
                            <button
                                className="px-3 py-1 text-xs bg-gray-200 rounded-full hover:bg-gray-300"
                                onClick={() => filterPostsByHashtag("")}
                            >
                                Бүх
                            </button>
                            {trendingHashtags.map((hashtag) => (
                                <button
                                    key={hashtag.tag}
                                    className="px-3 py-1 text-xs bg-gray-200 rounded-full hover:bg-gray-300"
                                    onClick={() => filterPostsByHashtag(hashtag.tag)}
                                >
                                    {hashtag.tag} ({hashtag.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content: Create Post & Posts List */}
                <main>
                    {loggedIn && (
                        <div className="bg-white grid gap-4 p-6">
                            <div className="grid grid-cols-[auto,1fr] items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={triggerFileInput}
                                    className="p-2 border border-gray-200 rounded-full hover:bg-gray-100"
                                >
                                    <FiCamera className="w-5 h-5 text-gray-600" />
                                </button>
                                {imageFile && (
                                    <span className="text-xs text-gray-700 truncate">
                                        {imageFile.name}
                                    </span>
                                )}
                            </div>
                            <textarea
                                placeholder="What's on your mind?"
                                className="w-full text-sm text-gray-900 border border-gray-200 rounded p-2 focus:outline-none"
                                rows={3}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                            <button
                                onClick={createPost}
                                className="mt-3 bg-[#1D9BF0] text-white text-xs px-4 py-2 rounded hover:bg-[#1A8CD8]"
                            >
                                Post
                            </button>
                        </div>
                    )}

                    {/* Posts List */}
                    <div className="m-0 p-0">
                        {posts.map((post, idx) => {
                            const postUser = post.user;
                            return (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="bg-white p-6 grid gap-4 border-b border-gray-200"
                                >
                                    <div className="grid grid-cols-[auto,1fr] gap-5">
                                        {/* Profile Picture with Skeleton Fallback */}
                                        <div className="self-start">
                                            {postUser?.profilePicture ? (
                                                <img
                                                    src={`${BASE_URL}${postUser.profilePicture}`}
                                                    alt="Avatar"
                                                    className="w-12 h-12 object-cover rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse" />
                                            )}
                                        </div>

                                        {/* Post Content */}
                                        <div className="grid gap-2">
                                            <div className="grid grid-cols-[1fr,auto] items-center">
                                                <Link href={`/profile/${postUser?._id || ""}`}>
                                                    <span className="text-sm font-semibold hover:underline">
                                                        {postUser?.username || "Unknown User"}
                                                    </span>
                                                </Link>
                                                {postUser && user && user._id !== postUser._id && (
                                                    <div>
                                                        {user.following?.includes(postUser._id) ? (
                                                            <button
                                                                onClick={() => handleUnfollow(postUser._id)}
                                                                className="text-green-600 text-xs"
                                                            >
                                                                Unfollow
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleFollow(postUser._id)}
                                                                className="text-[#1D9BF0] text-xs"
                                                            >
                                                                Follow
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </span>
                                            {post.content && (
                                                <p className="text-base whitespace-pre-wrap">
                                                    {post.content}
                                                </p>
                                            )}
                                            {post.image && (
                                                <div className="relative w-full overflow-hidden rounded-lg">
                                                    <img
                                                        src={`${UPLOADS_URL}/${post.image}`}
                                                        alt="Post"
                                                        className="w-full h-auto object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 items-center text-xs text-gray-600 w-full mt-2">
                                        {/* Like */}
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            disabled={!loggedIn}
                                            className="flex items-center justify-center gap-1 hover:text-gray-800"
                                            aria-label={`Like (${post.likes.length})`}
                                        >
                                            <FaHeart className="w-4 h-4" />
                                            <span>{post.likes.length}</span>
                                        </button>

                                        {/* Comment */}
                                        <button
                                            className="flex items-center justify-center gap-1 hover:text-gray-800"
                                            aria-label="Comment (0)"
                                        >
                                            <FaComment className="w-4 h-4" />
                                            <span>0</span>
                                        </button>

                                        {/* Share */}
                                        <button
                                            className="flex items-center justify-center gap-1 hover:text-gray-800"
                                            aria-label="Share (0)"
                                        >
                                            <FaShare className="w-4 h-4" />
                                            <span>0</span>
                                        </button>
                                    </div>

                                </motion.div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
