"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

/**
 * Matches your new user schema (no "name" field).
 * We can optionally include other fields like phoneNumber or location.
 */
interface UserData {
    _id: string;
    username: string;
    profilePicture?: string;
    rating?: number;
    followers?: string[];
    following?: string[];
    location?: string;
}

/**
 * If your posts actually have "title" + "content", keep them.
 * Otherwise remove "title" references.
 */
interface PostData {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [error, setError] = useState("");

    const BASE_URL = "https://www.vone.mn";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        axios
            .get(`${BASE_URL}/api/auth/user/${userId}`)
            .then((res) => {
                setUserData(res.data);
            })
            .catch((err) => {
                console.error("Fetch user error:", err.response?.data || err.message);
                setError(
                    err.response?.data?.error ||
                    "Хэрэглэгчийн профайл татаж авахад алдаа гарлаа."
                );
            })
            .finally(() => setLoading(false));
    }, [userId, BASE_URL]);

    // ---------------- FETCH USER POSTS ----------------
    useEffect(() => {
        if (!userId) return;
        setPostLoading(true);
        axios
            .get(`${BASE_URL}/api/posts?user=${userId}`)
            .then((res) => {
                setUserPosts(res.data);
            })
            .catch((err) => {
                console.error("User posts error:", err.response?.data || err.message);
            })
            .finally(() => setPostLoading(false));
    }, [userId, BASE_URL]);

    // ---------------- RENDER LOGIC ----------------
    if (loading) {
        return <div className="p-4 text-center">Уншиж байна...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-500 text-center">{error}</div>;
    }
    if (!userData) {
        return <div className="p-4 text-center">Профайл олдсонгүй</div>;
    }

    // ---------------- UI ----------------
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-6 flex flex-col items-center">
            {/* Profile Header */}
            <div className="w-full max-w-xl bg-white dark:bg-black rounded-md shadow-sm p-6 flex flex-col items-center">
                {/* Profile Picture */}
                <div className="relative w-32 h-32 mb-4">
                    {userData.profilePicture ? (
                        <img
                            src={userData.profilePicture}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border border-gray-300"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-black" />
                    )}
                </div>

                {/* Username + Rating */}
                <h1 className="text-2xl font-bold text-gray-800">{userData.username}</h1>
                {userData.rating && (
                    <p className="text-sm text-gray-600 mt-1">★ {userData.rating} үнэлгээ</p>
                )}

                {/* Optionally show user location if you want */}
                {userData.location && (
                    <p className="text-sm text-gray-500 mt-1">Байршил: {userData.location}</p>
                )}

                {/* Follower/Following Stats */}
                <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {userData.followers ? userData.followers.length : 0}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-white">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {userData.following ? userData.following.length : 0}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-white">Following</p>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className="w-full max-w-xl mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Нийтлэлүүд
                </h2>
                {postLoading && (
                    <p className="text-gray-600 dark:text-white mb-2">Ачааллаж байна...</p>
                )}
                {!postLoading && userPosts.length === 0 && (
                    <p className="text-gray-600 dark:text-white">Энэ хэрэглэгч нийтлэлгүй байна.</p>
                )}
                <div className="space-y-4">
                    {userPosts.map((post) => (
                        <div
                            key={post._id}
                            className="p-4 bg-white dark:bg-black rounded-md shadow-sm border border-gray-100 dark:border-black"
                        >
                            {/* Post Title */}
                            <h3 className="text-md font-bold text-gray-800 dark:text-white mb-1">
                                {post.title}
                            </h3>
                            {/* Post Content */}
                            <p className="text-sm text-gray-700 dark:text-white mb-2">{post.content}</p>
                            {/* Post Date */}
                            <p className="text-xs text-gray-400 dark:text-white">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
