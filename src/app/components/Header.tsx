// app/components/Header.tsx
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
        <header className="bg-blue-600 text-white p-4">
            <nav className="max-w-4xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-lg font-bold">
                    Vone
                </Link>
                <div className="space-x-4">
                    {/* Нэвтрээгүй бол Register, Login */}
                    {!loggedIn && (
                        <>
                            <Link href="/register">Бүртгүүлэх</Link>
                            <Link href="/login">Нэвтрэх</Link>
                        </>
                    )}
                    {/* Нэвтэрсэн бол ... */}
                    {loggedIn && (
                        <>
                            {/* Сарын эрх идэвхтэй бол "Member" гэж харуулна, эс бөгөөс Subscription линк */}
                            {isMember ? (
                                <span className="font-semibold">Member</span>
                            ) : (
                                <Link href="/subscription">Subscription</Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-gray-700 hover:bg-gray-500 px-3 py-1 rounded"
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
