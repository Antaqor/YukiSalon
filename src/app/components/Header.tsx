"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import {
    HomeIcon,
    UserGroupIcon,
    AcademicCapIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../lib/config";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { loggedIn, logout, user } = useAuth();
    const isPro =
        user?.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt) > new Date();


    return (
        <>
            {/* This global style hides body scroll when menu is open */}
            {isMenuOpen && (
                <style jsx global>{`
                    body {
                        overflow: hidden;
                    }
                `}</style>
            )}

            <div
                className="fixed top-0 left-0 w-full z-[999] bg-primary text-white border-b border-supportBorder shadow-md"
            >
                {/* NAV BAR */}
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center">
                    <Link href="/" className="flex items-center text-2xl font-bold text-brand" aria-label="Home">
                        Vone
                    </Link>
                    <div className="ml-auto flex items-center space-x-4">
                        {loggedIn ? (
                            <Link href="/profile" aria-label="Profile">
                                {user?.profilePicture ? (
                                    <Image
                                        src={`${BASE_URL}${user.profilePicture}`}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                                )}
                            </Link>
                        ) : (
                            <Link href="/login" aria-label="Login">
                                <UserCircleIcon className="w-8 h-8 text-yellow-400" />
                            </Link>
                        )}
                        <div className="hidden md:flex items-center space-x-8 font-medium">
                            {loggedIn ? (
                                <>
                                    {!isPro && (
                                        <Link
                                            href="/subscription"
                                            className="relative group text-gray-700 hover:text-brand"
                                        >
                                            Subscription
                                              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="relative group text-gray-700 hover:text-brand"
                                    >
                                        Гарах
                                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                    className="relative group text-gray-700 hover:text-brand"
                                >
                                    Нэвтрэх
                                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </Link>
                                <Link
                                    href="/register"
                                    className="relative group text-gray-700 hover:text-brand bg-yellow-300 text-black px-2 rounded"
                                >
                                    Бүртгүүлэх
                                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </Link>
                            </>
                        )}
                        </div>

                        {/* Hamburger (Mobile Only) */}
                        <button
                            className="md:hidden focus:outline-none"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Toggle Menu"
                        >
                            <span className="block w-6 h-0.5 bg-gray-800 mb-1" />
                            <span className="block w-6 h-0.5 bg-gray-800 mb-1" />
                            <span className="block w-6 h-0.5 bg-gray-800" />
                        </button>
                    </div>
                </nav>

                {/* FULL-SCREEN MOBILE DRAWER */}
                <div
                    className={`
            fixed inset-0
            bg-secondary text-white
            transition-transform duration-300
            z-[9999]
            overflow-y-auto
            h-screen w-screen
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
            md:hidden
          `}
                    // Close the menu if user clicks anywhere on the background
                    onClick={() => setIsMenuOpen(false)}
                >
                    {/* This inner container stops the click event from bubbling up */}
                    <div onClick={(e) => e.stopPropagation()}>
                        {/* Drawer Header */}
                        <div className="flex items-center justify-end p-4">
                            <button
                                className="text-gray-500 text-3xl focus:outline-none hover:text-gray-700"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Close Menu"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <nav className="mt-8 px-4">
                            <ul className="space-y-6">
                                {loggedIn ? (
                                    <>
                                        {!isPro && (
                                            <li>
                                                <Link
                                                    href="/subscription"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="block text-xl font-medium text-gray-800 hover:text-brand"
                                                >
                                                    Subscription
                                                </Link>
                                            </li>
                                        )}
                                        <li>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="block text-left w-full text-xl font-medium text-gray-800 hover:text-brand"
                                            >
                                                Гарах
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block text-xl font-medium text-gray-800 hover:text-brand"
                                            >
                                                Нэвтрэх
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block text-xl font-medium text-gray-800 hover:text-brand bg-yellow-300 text-black px-2 rounded"
                                            >
                                                Бүртгүүлэх
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>

                            {/* Additional Nav Items */}
                            <div className="mt-10 border-t border-supportBorder pt-6">
                                <ul className="space-y-4 text-lg font-semibold text-gray-700">
                                    <li>
                                        <Link
                                            href="/"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-brand"
                                        >
                                            <HomeIcon className="w-6 h-6" />
                                            Нүүр
                                        </Link>
                                    </li>
                                {loggedIn && !isPro && (
                                    <li>
                                        <Link
                                            href="/subscription"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-2 hover:text-brand"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                    />
                                                </svg>
                                                Subscription
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link
                                            href="/users"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-brand"
                                        >
                                            <UserGroupIcon className="w-6 h-6" />
                                            Гишүүд
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/classroom"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-brand"
                                        >
                                            <AcademicCapIcon className="w-6 h-6" />
                                            Хичээл
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/notifications"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-brand"
                                        >
                                            <BellIcon className="w-6 h-6" />
                                            Мэдүүлэл
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/chat"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-brand"
                                        >
                                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                                            Чат
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}
