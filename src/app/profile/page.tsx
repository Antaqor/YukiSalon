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
    followers?: string[];
    following?: string[];
}

interface PostData {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function MyOwnProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    const BASE_URL = "http://localhost:5001";

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
                setError(err.response?.data?.error || "Өөрийн профайл татаж авахад алдаа гарлаа.");
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
                setError(err.response?.data?.error || "Өөрийн нийтлэлүүдийг татаж авахад алдаа гарлаа.");
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
        return <div className="p-4">Өөрийн профайл олдсонгүй.</div>;
    }

    return (
        <div className="font-sans bg-white min-h-screen">
            {/* My profile header */}
            <div className="text-center p-5 border-b border-gray-200">
                {userData.profilePicture ? (
                    <img
                        src={userData.profilePicture}
                        alt="My Profile"
                        className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                    />
                ) : (
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 mb-2" />
                )}
                <h2 className="text-lg font-semibold text-gray-800">
                    {userData.username} (Миний Профайл)
                </h2>
                {userData.rating && (
                    <p className="text-sm text-gray-600">★ {userData.rating} үнэлгээ</p>
                )}
                {/* Display follow counts */}
                <div className="flex justify-center gap-6 mt-3">
                    <div>
            <span className="font-bold">
              {userData.followers ? userData.followers.length : 0}
            </span>{" "}
                        Followers
                    </div>
                    <div>
            <span className="font-bold">
              {userData.following ? userData.following.length : 0}
            </span>{" "}
                        Following
                    </div>
                </div>
            </div>

            {/* Subscription expiration */}
            {userData.subscriptionExpiresAt && (
                <div className="m-4 p-3 bg-blue-50 border border-blue-200 text-sm text-blue-800">
                    Миний subscription дуусах огноо:{" "}
                    {new Date(userData.subscriptionExpiresAt).toLocaleDateString()}
                </div>
            )}

            {/* My posts */}
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
