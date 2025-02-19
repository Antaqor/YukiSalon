"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

interface UserData {
    _id: string;
    username: string;
    email?: string;
    profilePicture?: string;
    rating?: number;
}

interface PostData {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id;

    const [userData, setUserData] = useState<UserData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [error, setError] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://vone.mn";

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        // This fetches the *public* user data for userId
        axios
            .get(`${BASE_URL}/api/auth/user/${userId}`)
            .then((res) => {
                setUserData(res.data);
            })
            .catch((err) => {
                console.error("Fetch user error:", err);
                setError("Хэрэглэгчийн профайл татаж авахад алдаа гарлаа.");
            })
            .finally(() => setLoading(false));
    }, [userId, BASE_URL]);

    // Fetch that user’s posts
    useEffect(() => {
        if (!userId) return;
        setPostLoading(true);
        axios
            .get(`${BASE_URL}/api/posts?user=${userId}`)
            .then((res) => {
                setUserPosts(res.data);
            })
            .catch((err) => {
                console.error("User posts error:", err);
            })
            .finally(() => setPostLoading(false));
    }, [userId, BASE_URL]);

    if (loading) {
        return <div className="p-4">Уншиж байна...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }
    if (!userData) {
        return <div className="p-4">Профайл олдсонгүй</div>;
    }

    return (
        <div className="p-4">
            {/* Display user info */}
            <div className="text-center mb-6">
                {userData.profilePicture ? (
                    <img
                        src={userData.profilePicture}
                        alt="Profile"
                        className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                    />
                ) : (
                    <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full mb-2" />
                )}
                <h2 className="text-lg font-semibold">{userData.username}</h2>
                {userData.rating && (
                    <p className="text-sm text-gray-600">★ {userData.rating} үнэлгээ</p>
                )}
            </div>

            {/* That user's posts */}
            <div>
                <h3 className="font-bold text-lg mb-3">Нийтлэлүүд</h3>
                {postLoading && <p className="text-gray-600">Ачааллаж байна...</p>}
                {!postLoading && userPosts.length === 0 && (
                    <p className="text-gray-600">Энэ хэрэглэгч нийтлэлгүй байна.</p>
                )}
                {userPosts.map((post) => (
                    <div
                        key={post._id}
                        className="border-b border-gray-200 pb-2 mb-2"
                    >
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-sm text-gray-600">{post.content}</p>
                        <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
