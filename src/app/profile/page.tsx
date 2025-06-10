"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import PostCard from "../components/PostCard";

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

interface PostData {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    image?: string;
    likes?: string[];
    comments?: any[];
    shares?: number;
}

export default function MyOwnProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    const BASE_URL = "https://www.vone.mn";
    const UPLOADS_URL = `${BASE_URL}/api/uploads`;

    // Grab token from localStorage or redirect if missing
    function getToken() {
        return localStorage.getItem("token") || "";
    }

    // 1) Fetch the logged-in user's profile
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
            .then((res) => {
                setUserData(res.data);
            })
            .catch((err) => {
                console.error("My profile fetch error:", err.response?.data || err.message);
                setError(
                    err.response?.data?.error ||
                    "Өөрийн профайл татаж авахад алдаа гарлаа."
                );
            })
            .finally(() => setLoadingProfile(false));
    }, [router, BASE_URL]);

    // 2) After we have the user’s data, fetch that user’s posts
    useEffect(() => {
        if (!userData?._id) return;

        setLoadingPosts(true);
        const token = getToken();
        axios
            .get(`${BASE_URL}/api/posts?user=${userData._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUserPosts(res.data);
            })
            .catch((err) => {
                console.error("User posts fetch error:", err.response?.data || err.message);
                setError(
                    err.response?.data?.error ||
                    "Өөрийн нийтлэлүүдийг татаж авахад алдаа гарлаа."
                );
            })
            .finally(() => setLoadingPosts(false));
    }, [userData, BASE_URL]);

    // ---------------- RENDER LOGIC ----------------
    if (loadingProfile) {
        return <div className="p-4">Профайл ачааллаж байна...</div>;
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

    // ---------------- UI ----------------
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 w-full h-12 flex items-center px-4 backdrop-blur-md z-10 bg-black/60">
                <button onClick={() => router.back()} aria-label="Back" className="mr-2 text-white">
                    &#8592;
                </button>
                <h1 className="font-bold flex-1 text-center">{userData.username}</h1>
                <a href="/profile/edit" className="text-sm text-blue-400">Edit</a>
            </div>

            {/* Banner */}
            <div className="h-40 bg-[#0d0d0d] relative mt-12">
                {userData.coverImage && (
                    <img src={`${BASE_URL}${userData.coverImage}`} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-[#0d0d0d] overflow-hidden bg-gray-800">
                    {userData.profilePicture ? (
                        <img src={`${BASE_URL}${userData.profilePicture}`} alt="avatar" className="w-full h-full object-cover" />
                    ) : null}
                </div>
            </div>

            {/* Meta */}
            <div className="pt-20 px-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{userData.username}</h2>
                    {isPro && <FaCheckCircle className="text-yellow-400" />}
                </div>
                {userData.rating && <p className="text-sm text-gray-400">★ {userData.rating} үнэлгээ</p>}
                {userData.location && <p className="text-sm text-gray-400">Байршил: {userData.location}</p>}
                <div className="flex gap-6 mt-2 text-sm">
                    <span>{userData.followers ? userData.followers.length : 0} Followers</span>
                    <span>{userData.following ? userData.following.length : 0} Following</span>
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
            <div className="max-w-xl mx-auto px-4 mt-4">
                <h3 className="text-xl font-bold mb-3">
                    Миний нийтлэлүүд
                </h3>
                {loadingPosts ? (
                    <div className="text-gray-400">Нийтлэлүүд ачааллаж байна...</div>
                ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                        {userPosts.map((post) => (
                            <PostCard key={post._id} post={post} user={userData} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Таны нийтэлсэн пост одоогоор алга.</p>
                )}
            </div>
        </div>
    );
}
