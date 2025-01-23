// File: /app/components/Header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const router = useRouter();
    const { loggedIn, logout } = useAuth();

    const handleLogin = () => {
        router.push("/login");
    };

    const handleLogout = () => {
        logout(); // Clears localStorage + context
        router.push("/login");
    };

    return (
        <>
            <header className="fixed top-0 left-0 z-20 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                <Link
                    href="/"
                    className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold"
                >
                    Vone
                </Link>

                <div className="ml-auto flex items-center gap-4">
                    {/* If logged in, optionally show the username */}

                    {loggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-neutral-800 text-white px-3 py-2 rounded text-sm hover:bg-neutral-700 transition"
                        >
                            Гарах
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="bg-neutral-800 text-white px-3 py-2 rounded text-sm hover:bg-neutral-700 transition"
                        >
                            Нэвтрэх
                        </button>
                    )}
                </div>
            </header>

            {/* Spacer so content isn't behind fixed header */}
            <div className="mt-16" />
        </>
    );
}
