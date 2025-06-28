"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { CameraIcon } from "@heroicons/react/24/solid";
import HomeFeedPost from "../components/HomeFeedPost";
import { BASE_URL } from "../lib/config";
import { getImageUrl } from "../lib/getImageUrl";
import type { Post } from "@/types/Post";

/** Match your user schema. No "name" field. */
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

export default function MyOwnProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

    const handleDelete = async (postId: string) => {
        const token = getToken();
        if (!token) return;
        try {
            await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserPosts((prev) => prev.filter((p) => p._id !== postId));
        } catch (err) {
            console.error("Delete post error:", err);
        }
    };

    const handleShareAdd = (newPost: Post) => {
        setUserPosts((prev) => [newPost, ...prev]);
    };

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const token = getToken();
        if (!token) return;
        const formData = new FormData();
        formData.append("profilePicture", file);
        try {
            const { data } = await axios.put(`${BASE_URL}/api/users/me`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.profilePicture) {
                setUserData((prev) => prev ? { ...prev, profilePicture: data.profilePicture } : prev);
            }
        } catch (err) {
            console.error("Profile picture update error", err);
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const token = getToken();
        if (!token) return;
        const formData = new FormData();
        formData.append("coverImage", file);
        try {
            const { data } = await axios.put(`${BASE_URL}/api/users/me`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.coverImage) {
                setUserData((prev) => prev ? { ...prev, coverImage: data.coverImage } : prev);
            }
        } catch (err) {
            console.error("Cover image update error", err);
        }
    };

    // Fetch the logged-in user's profile
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }
        setLoadingProfile(true);
        axios
            .get(`${BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUserData(res.data))
            .catch((err) => {
                console.error("My profile fetch error:", err.response?.data || err.message);
                setError(
                    err.response?.data?.error ||
                    "Өөрийн профайл татаж авахад алдаа гарлаа."
                );
            })
            .finally(() => setLoadingProfile(false));
    }, [router]);

    // After we have the user’s data, fetch that user’s posts
    useEffect(() => {
        if (!userData?._id) return;
        setLoadingPosts(true);
        const token = getToken();
        axios
            .get(`${BASE_URL}/api/posts?user=${userData._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUserPosts(res.data))
            .catch((err) => {
                console.error("User posts fetch error:", err.response?.data || err.message);
                setError(
                    err.response?.data?.error ||
                    "Өөрийн нийтлэлүүдийг татаж авахад алдаа гарлаа."
                );
            })
            .finally(() => setLoadingPosts(false));
    }, [userData]);

    // Render logic
    if (loadingProfile) {
        return (
            <div className="p-4 space-y-4">
                <div className="h-40 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center space-x-4 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-gray-300" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/2" />
                        <div className="h-4 bg-gray-300 rounded w-1/3" />
                    </div>
                </div>
            </div>
        );
    }
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }
    if (!userData) {
        return <div className="p-4">Өөрийн профайл олдсонгүй.</div>;
    }

    const isPro = userData.subscriptionExpiresAt
        ? new Date(userData.subscriptionExpiresAt) > new Date()
        : false;

    return (
        <div className="min-h-screen bg-[#212121] text-white font-sans pt-14">
            <div className="px-4 py-6 flex flex-col items-center text-center rounded-none sm:rounded-lg">
                {userData.profilePicture && (
                    <Image
                        src={getImageUrl(userData.profilePicture)}
                        alt="avatar"
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover border-2 border-[#171717]"
                    />
                )}
                <h2 className="mt-2 text-2xl font-bold">{userData.username}</h2>
                {isPro && <FaCheckCircle className="text-[#30c9e8]" />}
                {userData.location && <p className="text-sm text-white/60">Байршил: {userData.location}</p>}
                <Link href="/profile/edit" className="border border-[#30c9e8] text-[#30c9e8] px-4 py-1 rounded mt-3 hover:bg-[#30c9e8]/20">
                    Edit profile
                </Link>
                <div className="flex gap-6 mt-3 text-sm">
                    <Link href={`/profile/${userData._id}/followers`} className="hover:underline">
                        {userData.followers ? userData.followers.length : 0} Followers
                    </Link>
                    <Link href={`/profile/${userData._id}/following`} className="hover:underline">
                        {userData.following ? userData.following.length : 0} Following
                    </Link>
                </div>
            </div>

            {/* Subscription expiration */}
            {userData.subscriptionExpiresAt && (
                <div className="m-4 p-3 bg-blue-50 border border-blue-200 text-sm text-blue-800 rounded">
                    Миний subscription дуусах огноо:{" "}
                    {new Date(userData.subscriptionExpiresAt).toLocaleDateString()}
                </div>
            )}

            {/* My posts */}
            <div className="px-4 mt-4">
                <h3 className="text-xl font-bold mb-3">Миний нийтлэлүүд</h3>
                {loadingPosts ? (
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                        {userPosts.map((post) => (
                            <HomeFeedPost
                                key={post._id}
                                post={post}
                                onDelete={handleDelete}
                                onShareAdd={handleShareAdd}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Таны нийтэлсэн пост одоогоор алга.</p>
                )}
            </div>
            {/* Chat section removed in favor of dedicated /chat page */}
        </div>
    );
}
