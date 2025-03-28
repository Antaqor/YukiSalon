"use client";
import React, {
    useState,
    useEffect,
    useCallback,
    ChangeEvent,
    useRef,
} from "react";
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

    // *** Таны локал сервер: http://localhost:5001
    // *** API: http://localhost:5001/api
    // *** Үнэндээ posts: http://localhost:5001/api/posts
    const BASE_URL = "https://vone.mn";
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Зураг статикийн зам: http://localhost:5001/uploads
    const UPLOADS_URL = `${BASE_URL}/uploads`;

    // 1) Fetch posts
    const fetchPosts = useCallback(async () => {
        try {
            // GET -> http://localhost:5001/api/posts
            const res = await axios.get(`${BASE_URL}/api/posts`);
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
        const trending: Hashtag[] = Object.entries(hashtagCount).map(
            ([tag, count]) => ({ tag, count })
        );
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
            if (imageFile) formData.append("image", imageFile);

            // POST -> http://localhost:5001/api/posts
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

    // 5) Trigger hidden file input
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // 6) Handle file selection
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // 7) Like post
    const handleLike = async (postId: string) => {
        if (!user?.accessToken) return;
        try {
            // POST -> http://localhost:5001/api/posts/:postId/like
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

    // 8) Follow/Unfollow
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
                const updatedFollowing = user.following.filter(
                    (id) => id !== targetUserId
                );
                login({ ...user, following: updatedFollowing }, user.accessToken);
            }
        } catch (err: any) {
            if (
                err.response?.status === 400 &&
                err.response.data?.error === "You are not following this user"
            ) {
                if (user.following) {
                    const updatedFollowing = user.following.filter(
                        (id) => id !== targetUserId
                    );
                    login({ ...user, following: updatedFollowing }, user.accessToken);
                }
            } else {
                console.error("Unfollow error:", err);
            }
        }
    };

    // Fetch posts on mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div className="min-h-screen bg-[#000000]">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Алдааны мессеж */}
                {error && (
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="text-red-400 mb-4 p-3 bg-red-900 rounded border border-[#2f3336]"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Trending Hashtags */}
                <div className="mb-6">
                    <h2 className="flex items-center text-lg font-semibold mb-2">
                        <FiCamera className="w-5 h-5 mr-2 text-[#1D9BF0]" />
                        Trending Hashtags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 rounded border border-[#2f3336] ${
                                filterHashtag === ""
                                    ? "bg-[#1D9BF0] text-white"
                                    : "bg-[#000000] text-gray-300"
                            }`}
                            onClick={() => filterPostsByHashtag("")}
                        >
                            Бүх
                        </button>
                        {trendingHashtags.map((hashtag) => (
                            <button
                                key={hashtag.tag}
                                className={`px-3 py-1 rounded border border-[#2f3336] ${
                                    filterHashtag === hashtag.tag
                                        ? "bg-[#1D9BF0] text-white"
                                        : "bg-[#000000] text-gray-300"
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
                        className="space-y-3 mb-6"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                    >
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={triggerFileInput}
                                className="p-2 border border-[#2f3336] rounded-full hover:bg-[#2f3336]"
                            >
                                <FiCamera className="w-6 h-6 text-gray-300" />
                            </button>
                            {imageFile && (
                                <span className="text-sm text-gray-300">
                                    {imageFile.name}
                                </span>
                            )}
                        </div>
                        <textarea
                            placeholder="Контент бичнэ үү..."
                            className="w-full border-b border-[#2f3336] p-2 focus:outline-none bg-[#000000] text-gray-100"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <button
                            onClick={createPost}
                            className="bg-[#1D9BF0] text-white px-4 py-2 rounded hover:opacity-90 transition border border-[#2f3336]"
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
                                className="border-b border-[#2f3336] pb-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-300">{post.content}</p>
                                        {post.image && (
                                            <img
                                                src={`${UPLOADS_URL}/${post.image}`}
                                                alt="Post"
                                                className="mt-2 max-w-full rounded border border-[#2f3336]"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        )}
                                        <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                                            {postUser ? (
                                                <>
                                                    <Link href={`/profile/${postUser._id}`}>
                                                        <span className="text-[#1D9BF0] hover:underline">
                                                            {postUser.username}
                                                        </span>
                                                    </Link>
                                                    {loggedIn && user && user._id !== postUser._id && (
                                                        <>
                                                            {user.following?.includes(postUser._id) ? (
                                                                <button
                                                                    onClick={() => handleUnfollow(postUser._id)}
                                                                    className="text-sm text-green-400"
                                                                >
                                                                    Unfollow
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleFollow(postUser._id)}
                                                                    className="text-sm text-[#1D9BF0]"
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
                                            <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
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
