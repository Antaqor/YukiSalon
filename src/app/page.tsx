"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { FaComment, FaShare, FaHeart, FaRegHeart } from "react-icons/fa";
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

    // For local development, adjust BASE_URL to your backend.
    const BASE_URL = " https://vone.mn";
    // Express serves static files (uploads) at BASE_URL + "/uploads"
    const UPLOADS_URL = `${BASE_URL}/uploads`;
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

    // Follow/Unfollow
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
            if (
                err.response?.status === 400 &&
                err.response.data?.error === "You are not following this user"
            ) {
                if (user.following) {
                    const updatedFollowing = user.following.filter((id) => id !== targetUserId);
                    login({ ...user, following: updatedFollowing }, user.accessToken);
                }
            } else {
                console.error("Unfollow error:", err);
            }
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            {/* Centered feed container */}
            <div className="mx-auto max-w-2xl w-full px-4 py-6">
                {/* Error display */}
                {error && (
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="bg-red-100 text-red-700 p-3 mb-4 rounded border border-red-200 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Trending Hashtags */}
                <div className="mb-6">
                    <h2 className="flex items-center text-xl font-semibold mb-3 text-gray-900">
                        <FiCamera className="w-6 h-6 mr-2 text-[#1D9BF0]" />
                        Trending Hashtags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 rounded-full border border-gray-300 text-sm ${
                                filterHashtag === ""
                                    ? "bg-[#1D9BF0] text-white"
                                    : "bg-white text-gray-700"
                            }`}
                            onClick={() => filterPostsByHashtag("")}
                        >
                            Бүх
                        </button>
                        {trendingHashtags.map((hashtag) => (
                            <button
                                key={hashtag.tag}
                                className={`px-3 py-1 rounded-full border border-gray-300 text-sm ${
                                    filterHashtag === hashtag.tag
                                        ? "bg-[#1D9BF0] text-white"
                                        : "bg-white text-gray-700"
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
                    <motion.div
                        className="mb-6 bg-white p-4 rounded-md border border-gray-200 shadow-sm"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={triggerFileInput}
                                className="p-2 border border-gray-300 rounded-full hover:bg-gray-100"
                            >
                                <FiCamera className="w-5 h-5 text-gray-700" />
                            </button>
                            {imageFile && (
                                <span className="text-sm text-gray-700 truncate">
                  {imageFile.name}
                </span>
                            )}
                        </div>
                        <textarea
                            placeholder="What's on your mind?"
                            className="w-full mt-3 p-2 border border-gray-300 rounded focus:outline-none bg-white text-sm text-gray-900"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button
                            onClick={createPost}
                            className="mt-3 bg-[#1D9BF0] text-white px-4 py-2 rounded-md hover:opacity-90 transition text-sm"
                        >
                            Post
                        </button>
                    </motion.div>
                )}

                {/* Post List */}
                <div className="space-y-6">
                    {posts.map((post, index) => {
                        const postUser = post.user;
                        return (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-white rounded-md border border-gray-200 p-4 shadow-sm"
                            >
                                {/* User info row */}
                                <div className="flex items-center gap-3 mb-3">
                                    {postUser?.profilePicture ? (
                                        <img
                                            src={`${BASE_URL}${postUser.profilePicture}`}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                                    )}
                                    <div className="flex flex-col">
                                        <Link href={`/profile/${postUser?._id || ""}`}>
                      <span className="text-sm font-semibold text-gray-800 hover:underline">
                        {postUser?.username || "Unknown User"}
                      </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Post content */}
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {post.content}
                                </p>

                                {/* Post image(s) */}
                                {post.image && (
                                    <img
                                        src={`${UPLOADS_URL}/${post.image}`}
                                        alt="Post"
                                        className="mt-3 w-full h-auto rounded-md border border-gray-200 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                )}
                                {post.images && post.images.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {post.images.map((imgSrc: string, idx: number) => (
                                            <img
                                                key={idx}
                                                src={`${UPLOADS_URL}/${imgSrc}`}
                                                alt="Post"
                                                className="w-full h-auto rounded-md border border-gray-200 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}


                                {/* Stats row */}
                                <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleLike(post._id)} disabled={!loggedIn} className="hover:text-gray-800">
                                            Likes {post.likes.length}
                                        </button>
                                        <button className="hover:text-gray-800">
                                            Comments 0
                                        </button>
                                        <button className="hover:text-gray-800">
                                            Shares 0
                                        </button>
                                    </div>
                                </div>

                                {/* Follow/Unfollow (if applicable) */}
                                {postUser && user && user._id !== postUser._id && (
                                    <div className="mt-2">
                                        {user.following?.includes(postUser._id) ? (
                                            <button onClick={() => handleUnfollow(postUser._id)} className="text-green-600 text-xs">
                                                Unfollow
                                            </button>
                                        ) : (
                                            <button onClick={() => handleFollow(postUser._id)} className="text-[#1D9BF0] text-xs">
                                                Follow
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
