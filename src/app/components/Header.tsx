"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton"; // Skeleton UI component
import "react-loading-skeleton/dist/skeleton.css";
import logo from "../img/logo.svg";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state for the entire header

    const { user, loggedIn, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.subscriptionExpiresAt) {
                const subDate = new Date(user.subscriptionExpiresAt);
                setIsMember(subDate > new Date());
            } else {
                setIsMember(false);
            }
        }
        setLoading(false); // Stop loading after processing user data
    }, [user]);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const showBanner = !loading && loggedIn && !isMember;

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50 flex flex-col">
                {/* Banner only shows after loading is complete */}
                {!loading && showBanner && (
                    <div className="bg-yellow-300 px-4 py-2 text-black text-sm flex items-center justify-center">
                        <span className="mr-2">Та гишүүнчлэлгүй байна.</span>
                        <Link href="/subscription" className="underline font-medium">
                            Гишүүнчлэл авах
                        </Link>
                    </div>
                )}

                <header className="bg-black">
                    <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/">
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    className="h-8 w-auto object-contain cursor-pointer"
                                />
                            </Link>
                        </div>

                        <div className="hidden md:flex space-x-6 text-sm font-medium text-white">
                            {loading ? (
                                <Skeleton width={200} height={20} />
                            ) : !loggedIn ? (
                                <>
                                    <Link href="/login" className="hover:opacity-75 transition">
                                        Нэвтрэх
                                    </Link>
                                    <Link href="/register" className="hover:opacity-75 transition">
                                        Бүртгүүлэх
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/account" className="hover:opacity-75 transition">
                                        Профайл
                                    </Link>
                                    <Link href="/account" className="hover:opacity-75 transition">
                                        Танилцуулга
                                    </Link>
                                    {isMember ? (
                                        <span className="text-green-400">Member</span>
                                    ) : (
                                        <Link
                                            href="/subscription"
                                            className="hover:opacity-75 transition"
                                        >
                                            Subscription
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="hover:opacity-75 transition"
                                    >
                                        Гарах
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-white focus:outline-none"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16m-7 6h7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </nav>

                    {isMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden">
                            <div className="flex flex-col space-y-4 p-4 text-sm font-medium text-black">
                                {loading ? (
                                    <Skeleton width={150} height={20} />
                                ) : !loggedIn ? (
                                    <>
                                        <Link
                                            href="/login"
                                            className="hover:opacity-75 transition"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Нэвтрэх
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="hover:opacity-75 transition"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Бүртгүүлэх
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/account"
                                            className="hover:opacity-75 transition"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Профайл
                                        </Link>
                                        <Link
                                            href="/account"
                                            className="hover:opacity-75 transition"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Танилцуулга
                                        </Link>
                                        {isMember ? (
                                            <span className="text-green-600">Member</span>
                                        ) : (
                                            <Link
                                                href="/subscription"
                                                className="hover:opacity-75 transition"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Subscription
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="text-left hover:opacity-75 transition"
                                        >
                                            Гарах
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </header>
            </div>

            <main className={showBanner ? "pt-[104px]" : "pt-[64px]"}>
                {/* Main content */}
            </main>
        </>
    );
}
