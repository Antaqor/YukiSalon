"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import HomeFeedPost from "../../components/HomeFeedPost";
import axios from "axios";
import { BASE_URL } from "../../lib/config";
import { getImageUrl } from "../../lib/getImageUrl";
import { useAuth } from "../../context/AuthContext";
import type { Post } from "@/types/Post";

interface UserData {
    _id: string;
    username: string;
    coverImage?: string;
    profilePicture?: string;
    rating?: number;
    subscriptionExpiresAt?: string;
    followers?: string[];
    following?: string[];
    location?: string;
}

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { user: viewer, loggedIn, login } = useAuth();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [error, setError] = useState("");

    // Share handler
    const handleShareAdd = (newPost: Post) => {
        setUserPosts((prev) => [newPost, ...prev]);
    };

    const handleFollow = async () => {
        if (!viewer?.accessToken) return;
        try {
            await axios.post(
                `${BASE_URL}/api/users/${userId}/follow`,
                {},
                { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
            );
            login(
                { ...viewer, following: [...(viewer.following || []), userId] },
                viewer.accessToken!
            );
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    const handleUnfollow = async () => {
        if (!viewer?.accessToken) return;
        try {
            await axios.post(
                `${BASE_URL}/api/users/${userId}/unfollow`,
                {},
                { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
            );
            login(
                {
                    ...viewer,
                    following: (viewer.following || []).filter((id) => id !== userId),
                },
                viewer.accessToken!
            );
        } catch (err) {
            console.error("Unfollow error:", err);
        }
    };

    // Fetch user data
    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        axios
            .get(`${BASE_URL}/api/auth/user/${userId}`)
            .then((res) => setUserData(res.data))
            .catch((err) => {
                console.error("Fetch user error:", err.response?.data || err.message);
                setError(
                    err.response?.data?.error ||
                        "Хэрэглэгчийн профайл татаж авахад алдаа гарлаа."
                );
            })
            .finally(() => setLoading(false));
    }, [userId]);

    // Fetch user posts
    useEffect(() => {
        if (!userId) return;
        setPostLoading(true);
        axios
            .get(`${BASE_URL}/api/posts?user=${userId}`)
            .then((res) => setUserPosts(res.data))
            .catch((err) => {
                console.error("User posts error:", err.response?.data || err.message);
            })
            .finally(() => setPostLoading(false));
    }, [userId]);

    // UI loading state
    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <div className="h-40 bg-gray-800 rounded animate-pulse" />
                <div className="flex items-center space-x-4 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-gray-700" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/2" />
                        <div className="h-4 bg-gray-700 rounded w-1/3" />
                    </div>
                </div>
            </div>
        );
    }
    if (error) {
        return <div className="p-4 text-red-500 text-center">{error}</div>;
    }
    if (!userData) {
        return <div className="p-4 text-center">Профайл олдсонгүй</div>;
    }

    const isPro = userData.subscriptionExpiresAt
        ? new Date(userData.subscriptionExpiresAt) > new Date()
        : false;
    const isOwnProfile = viewer?._id === userId;

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 w-full h-12 flex items-center px-4 backdrop-blur-md z-10 bg-black/60">
                <button
                    onClick={() => router.back()}
                    aria-label="Back"
                    className="mr-2 text-black"
                >
                    &#8592;
                </button>
                <h1 className="font-bold flex-1 text-center">
                    {userData.username}
                </h1>
            </div>

            {/* Banner */}
            <div className="h-40 bg-[#0d0d0d] relative mt-12">
                {userData.coverImage && (
                    <Image
                        src={getImageUrl(userData.coverImage)}
                        alt="Cover"
                        width={800}
                        height={160}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
                <div className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-[#0d0d0d] overflow-hidden bg-gray-800">
                    {userData.profilePicture && (
                        <Image
                            src={getImageUrl(userData.profilePicture)}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            </div>

            {/* Meta */}
            <div className="pt-20 px-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{userData.username}</h1>
                        {isPro && <FaCheckCircle className="text-brand" />}
                    </div>
                    {loggedIn && !isOwnProfile && (
                        <div className="flex gap-2">
                            {viewer?.following?.includes(userId) ? (
                                <button onClick={handleUnfollow} className="text-sm px-3 py-1 rounded border border-brand text-brand">Following</button>
                            ) : (
                                <button onClick={handleFollow} className="text-sm px-3 py-1 rounded border border-brand text-brand">Follow</button>
                            )}
                            <Link href={`/chat?user=${userId}`} className="text-sm px-3 py-1 rounded bg-brand text-white">Message</Link>
                        </div>
                    )}
                </div>
                {userData.rating && (
                    <p className="text-sm text-gray-400">
                        ★ {userData.rating} үнэлгээ
                    </p>
                )}
                {userData.location && (
                    <p className="text-sm text-gray-400">
                        Байршил: {userData.location}
                    </p>
                )}
                <div className="flex gap-6 mt-2 text-sm">
                    <Link href={`/profile/${userId}/followers`} className="hover:underline">
                        {userData.followers ? userData.followers.length : 0} Followers
                    </Link>
                    <Link href={`/profile/${userId}/following`} className="hover:underline">
                        {userData.following ? userData.following.length : 0} Following
                    </Link>
                </div>
            </div>

            {/* Posts Section */}
            <div className="w-full max-w-xl mt-8 px-4">
                <h2 className="text-xl font-semibold mb-4">Нийтлэлүүд</h2>
                {postLoading && (
                    <p className="text-gray-400 mb-2">Ачааллаж байна...</p>
                )}
                {!postLoading && userPosts.length === 0 && (
                    <p className="text-gray-400">
                        Энэ хэрэглэгч нийтлэлгүй байна.
                    </p>
                )}
                <div className="space-y-4">
                    {userPosts.map((post) => (
                        <HomeFeedPost
                            key={post._id}
                            post={post}
                            onShareAdd={handleShareAdd}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
