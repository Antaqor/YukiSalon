"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { TbUserPlus, TbUserMinus, TbMessageCircle } from "react-icons/tb";
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
        <div className="min-h-screen bg-[#212121] text-white font-sans pt-14">
            <div className="max-w-xl mx-auto relative bg-[#212121] rounded-xl shadow-lg p-6">
                {userData.profilePicture && (
                    <Image
                        src={getImageUrl(userData.profilePicture)}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="absolute -top-12 right-6 w-24 h-24 rounded-full border-2 border-[#171717] object-cover"
                    />
                )}
                <h1 className="mt-12 text-2xl font-bold flex items-center gap-1">
                    {userData.username}
                    {isPro && <FaCheckCircle className="text-[#30c9e8]" />}
                </h1>
                {userData.location && (
                    <p className="text-sm text-white/60">{userData.location}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-white/60">
                    <Link href={`/profile/${userId}/followers`}>{userData.followers ? userData.followers.length : 0} Followers</Link>
                    <Link href={`/profile/${userId}/following`}>{userData.following ? userData.following.length : 0} Following</Link>
                </div>
                {loggedIn && !isOwnProfile && (
                    <div className="absolute top-4 left-4 flex gap-4">
                        {viewer?.following?.includes(userId) ? (
                            <button onClick={handleUnfollow} aria-label="Unfollow" className="text-white/60 hover:text-[#30c9e8]">
                                <TbUserMinus size={20} />
                            </button>
                        ) : (
                            <button onClick={handleFollow} aria-label="Follow" className="text-white/60 hover:text-[#30c9e8]">
                                <TbUserPlus size={20} />
                            </button>
                        )}
                        <Link href={`/chat?user=${userId}`} aria-label="Message" className="text-white/60 hover:text-[#30c9e8]">
                            <TbMessageCircle size={20} />
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-center border-b border-white/20">
                <button className="px-4 py-2 text-white border-b-2 border-[#30c9e8]">Threads</button>
                <button className="px-4 py-2 text-white/60">Replies</button>
                <button className="px-4 py-2 text-white/60">Media</button>
            </div>

            <div className="w-full max-w-xl mx-auto mt-6 px-4">
                {postLoading && (
                    <p className="text-gray-400 mb-2">Ачааллаж байна...</p>
                )}
                {!postLoading && userPosts.length === 0 && (
                    <p className="text-gray-400">Энэ хэрэглэгч нийтлэлгүй байна.</p>
                )}
                <div className="space-y-4">
                    {userPosts.map((post) => (
                        <HomeFeedPost key={post._id} post={post} onShareAdd={handleShareAdd} />
                    ))}
                </div>
            </div>
        </div>
    );
}
