"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import logo from "../img/logo.svg";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMember, setIsMember] = useState(false);

    const { user, loggedIn, logout } = useAuth();
    const router = useRouter();

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

    // Нэвтэрсэн && subscription байхгүй → баннерыг харуулна
    const showBanner = loggedIn && !isMember;

    return (
        <>
            {/*
        НЭГ Л “fixed” КОНТЕЙНЕР ДОТОР
        - Шар баннер (хэрэв showBanner=true бол) + Хар header
      */}
            <div className="fixed top-0 left-0 w-full z-50 flex flex-col">
                {showBanner && (
                    <div className="bg-yellow-300 px-4 py-2 text-black text-sm flex items-center justify-center">
                        <span className="mr-2">Та гишүүнчлэлгүй байна.</span>
                        <Link href="/subscription" className="underline font-medium">
                            Гишүүнчлэл авах
                        </Link>
                    </div>
                )}

                {/* Үндсэн Хар Header */}
                <header className="bg-black">
                    <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        {/* Лого (зүүн талд) */}
                        <div className="flex items-center">
                            <Link href="/">
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    className="h-8 w-auto object-contain cursor-pointer"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation (md breakpoint-ээс дээш) */}
                        <div className="hidden md:flex space-x-6 text-sm font-medium text-white">
                            {/* Нэвтрээгүй бол */}
                            {!loggedIn && (
                                <>
                                    <Link href="/login" className="hover:opacity-75 transition">
                                        Нэвтрэх
                                    </Link>
                                    <Link href="/register" className="hover:opacity-75 transition">
                                        Бүртгүүлэх
                                    </Link>
                                </>
                            )}

                            {/* Нэвтэрсэн бол */}
                            {loggedIn && (
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

                        {/* Mobile Menu Button (md-ээс доош) */}
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

                    {/* Mobile Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden">
                            <div className="flex flex-col space-y-4 p-4 text-sm font-medium text-black">
                                {!loggedIn && (
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
                                )}

                                {loggedIn && (
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

            {/*
        ОДОО content буюу main хэсгээ давхардахаас хамгаалж top-padding өгөх:
        Баннер + header-ын нийт өндрийг бодож болж байна.
        Жишээ нь: (шар баннер ~40px, хар header ~64px) = ~104px
        Тэгэхээр:
          <main className="pt-[104px]">
            ...
          </main>
        Гэх мэтээр эсвэл доорх шиг:
      */}
            <main className={showBanner ? "pt-[104px]" : "pt-[64px]"}>
                {/* Таны үлдсэн контент энд байрлана. */}
            </main>
        </>
    );
}