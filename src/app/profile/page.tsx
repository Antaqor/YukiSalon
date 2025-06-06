"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

/** Match your user schema. No "name" field. */
interface UserData {
    _id: string;
    username: string;
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
}

export default function MyOwnProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState("");

    const BASE_URL = "https://www.vone.mn";

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

    // ---------------- UI ----------------
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* My Profile Header */}
            <div className="text-center p-5 border-b border-gray-200">
                {/* Profile Picture */}
                {userData.profilePicture ? (
                    <img
                        src={`${BASE_URL}${userData.profilePicture}`}
                        alt="Profile"
                        className="..."
                    />
                ) : (
                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 mb-2" />
                )}

                {/* Username + rating */}
                <h2 className="text-xl font-bold text-gray-800">
                    {userData.username}
                </h2>
                {userData.rating && (
                    <p className="text-sm text-gray-600">★ {userData.rating} үнэлгээ</p>
                )}

                {/* Follower/Following */}
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

                {/* Optional: location */}
                {userData.location && (
                    <div className="mt-2 text-sm text-gray-500">
                        Байршил: {userData.location}
                    </div>
                )}
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
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                    Миний нийтлэлүүд
                </h3>
                {loadingPosts ? (
                    <div className="text-gray-600">Нийтлэлүүд ачааллаж байна...</div>
                ) : userPosts.length > 0 ? (
                    <div className="space-y-4">
                        {userPosts.map((post) => (
                            <div
                                key={post._id}
                                className="border border-gray-100 p-4 rounded-md shadow-sm"
                            >
                                <h4 className="font-semibold text-gray-800">{post.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{post.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(post.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">
                        Таны нийтэлсэн пост одоогоор алга.
                    </p>
                )}
            </div>
        </div>
    );
}
