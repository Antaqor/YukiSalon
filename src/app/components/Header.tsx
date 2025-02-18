"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import logo from "@/app/img/logo.svg";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { loggedIn, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <>
            <div className="fixed top-0 left-0 w-full z-50">
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
                            {!loggedIn ? (
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
                                    <Link href="/profile" className="hover:opacity-75 transition">
                                        Профайл
                                    </Link>
                                    <button onClick={handleLogout} className="hover:opacity-75 transition">
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
                                {!loggedIn ? (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="hover:opacity-75 transition"
                                        >
                                            Нэвтрэх
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="hover:opacity-75 transition"
                                        >
                                            Бүртгүүлэх
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="hover:opacity-75 transition"
                                        >
                                            Профайл
                                        </Link>
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
            {/* Adjust top padding according to header height */}
            <main className="pt-16">{/* Үлдсэн контент */}</main>
        </>
    );
}
