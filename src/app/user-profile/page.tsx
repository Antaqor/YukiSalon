"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface UserData {
    _id: string;
    username: string;
    email?: string;
    profilePicture?: string;
    rating?: number;
    subscriptionExpiresAt?: string;
}

interface PostData {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function UserProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    // Your backend
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    function getToken() {
        // e.g. from localStorage or AuthContext
        return localStorage.getItem("token") || "";
    }

    // 1) Fetch user profile
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }

        axios
            .get(`${BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUserData(res.data);
            })
            .catch((err) => {
                console.error("Profile fetch error:", err);
                setError("Профайл татаж авахад алдаа гарлаа.");
            })
            .finally(() => setLoadingProfile(false));
    }, [router, BASE_URL]);

    // 2) Fetch user’s own posts
    useEffect(() => {
        if (!userData?._id) return;
        const token = getToken();
        if (!token) return;

        setLoadingPosts(true);
        axios
            .get(`${BASE_URL}/api/posts?user=${userData._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUserPosts(res.data);
            })
            .catch((err) => {
                console.error("User posts fetch error:", err);
                setError("Нийтлэлүүдийг татаж авахад алдаа гарлаа.");
            })
            .finally(() => setLoadingPosts(false));
    }, [userData, BASE_URL]);

    if (loadingProfile) {
        return <div className="p-4">Профайл ачааллаж байна...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }
    if (!userData) {
        return <div className="p-4">Хэрэглэгчийн профайл олдсонгүй.</div>;
    }

    return (
        <div className="font-sans bg-white min-h-screen">
            {/* Header */}
            <div className="text-center p-5 border-b border-gray-200">
                {userData.profilePicture ? (
                    <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                    />
                ) : (
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 mb-2" />
                )}
                <h2 className="text-lg font-semibold text-gray-800">{userData.username}</h2>
                {userData.rating && (
                    <p className="text-sm text-gray-600">
                        ★ {userData.rating} үнэлгээ
                    </p>
                )}
            </div>

            {/* If you want a subscription note */}
            {userData.subscriptionExpiresAt && (
                <div className="m-4 p-3 bg-blue-50 border border-blue-200 text-sm text-blue-800">
                    Таны subscription дуусах огноо:{" "}
                    {new Date(userData.subscriptionExpiresAt).toLocaleDateString()}
                </div>
            )}

            {/* User's posts */}
            <div className="px-4 mt-4">
                <h3 className="text-lg font-bold mb-3">Миний нийтлэлүүд</h3>
                {loadingPosts ? (
                    <div className="text-gray-600">Нийтлэлүүд ачааллаж байна...</div>
                ) : userPosts.length > 0 ? (
                    userPosts.map((post) => (
                        <div key={post._id} className="border-b border-gray-200 pb-2 mb-2">
                            <h4 className="font-semibold text-gray-800">{post.title}</h4>
                            <p className="text-gray-600 text-sm">{post.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">Таны нийтэлсэн пост одоогоор алга.</p>
                )}
            </div>
        </div>
    );
}
