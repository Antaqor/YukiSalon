"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../lib/auth";
import { useRouter } from "next/navigation";

function SkeletonAvatar() {
    return (
        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
    );
}

export default function UserProfilePage() {
    const router = useRouter();
    const [userData, setUserData] = useState<{
        username?: string;
        phoneNumber?: string;
        profilePicture?: string;
        rating?: number;
    } | null>(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();

        // If no token, immediately push to /login
        if (!token) {
            router.push("/login");
            return;
        }

        axios
            .get("https://backend.foru.mn/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                // Adjust to match your actual API response
                setUserData({
                    username: res.data.username || "Антагор Вон",
                    phoneNumber: res.data.phoneNumber || "000-000-0000",
                    profilePicture: res.data.profilePicture || "",
                    rating: res.data.rating || 4.93,
                });
            })
            .catch((err) => {
                console.error("Profile fetch error:", err);
                setError(err.response?.data?.error || "Профайл татаж авахад алдаа гарлаа.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [router]);

    if (loading) {
        return (
            <div className="text-center mt-10">
                <p className="text-gray-700">Хэрэглэгчийн профайл ачааллаж байна...</p>
            </div>
        );
    }

    // In case of any other error (e.g. 500, 404, etc.)
    if (error) {
        return (
            <div className="text-center mt-10 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    // If user data is missing after the fetch (unexpected scenario)
    if (!userData) {
        return (
            <div className="text-center mt-10">
                <p className="text-gray-700">Хэрэглэгчийн профайл олдсонгүй.</p>
                {/* "Create Profile" or other fallback logic here */}
            </div>
        );
    }

    const { username, rating, profilePicture } = userData;

    return (
        <div className="font-sans bg-white min-h-screen flex flex-col pb-12">
            {/* Profile Header */}
            <div className="text-center pt-5 pb-3">
                {profilePicture ? (
                    <img
                        src={profilePicture}
                        alt="Профайл"
                        className="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                    />
                ) : (
                    <SkeletonAvatar />
                )}
                <h2 className="mt-2 mb-1 text-lg font-semibold text-gray-800">{username}</h2>
                {rating && (
                    <p className="text-sm text-gray-600">
                        <span className="text-green-600">★ {rating}</span> Үнэлгээ
                    </p>
                )}
            </div>

            {/* Banner */}
            <div className="bg-green-50 mx-4 p-3 rounded-md border border-green-200 text-sm text-green-800">
                <p className="mb-1">Таны дансыг шинэчлээрэй</p>
                <p className="mb-1">Апп ашиглалтаа сайжруулаарай</p>
                <p className="text-green-800">Шинэ 2 санал</p>
            </div>

            {/* Menu Items */}
            <div className="mt-5">
                {/* Section */}
                <div className="px-4 py-3 border-b border-gray-100 text-base text-gray-800">
                    Хувийн мэдээлэл
                </div>
                <div className="px-4 py-3 border-b border-gray-100 text-base text-gray-800">
                    Аюулгүй байдал
                </div>

                {/* Section */}
                <div className="px-4 py-3 text-base text-gray-800 border-t-8 border-gray-100">
                    Хадгалсан хаягууд
                </div>
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    Гэрийн хаяг нэмэх
                </div>
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    Ажлын хаяг нэмэх
                </div>
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    Бусад хаяг нэмэх
                </div>

                {/* Section */}
                <div className="px-4 py-3 text-base text-gray-800 flex justify-between items-center border-t-8 border-gray-100">
                    <span>Хэл</span>
                    <span className="text-sm text-gray-500">Монгол</span>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-600">
                    Холбоос авах сонголтууд
                </div>
            </div>
        </div>
    );
}
