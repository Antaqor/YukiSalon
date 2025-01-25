"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const router = useRouter();
    const { user, loggedIn, logout } = useAuth();
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        if (user?.subscriptionExpiresAt) {
            const subDate = new Date(user.subscriptionExpiresAt);
            setIsMember(subDate > new Date());
        } else {
            setIsMember(false);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="w-full bg-white border-b border-gray-200">
            <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-xl font-semibold text-black">
                    Vone
                </Link>
                <div className="space-x-4">
                    {!loggedIn && (
                        <>
                            <Link href="/register" className="text-gray-700">
                                Бүртгүүлэх
                            </Link>
                            <Link href="/login" className="text-gray-700">
                                Нэвтрэх
                            </Link>
                        </>
                    )}
                    {loggedIn && (
                        <>
                            {isMember ? (
                                <span className="font-semibold text-black">Member</span>
                            ) : (
                                <Link href="/subscription" className="text-gray-700">
                                    Subscription
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-black text-white px-3 py-1 hover:bg-gray-900 transition"
                            >
                                Гарах
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
