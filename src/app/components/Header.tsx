"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { loggedIn, logout, user } = useAuth();
    const BASE_URL = "https://www.vone.mn";
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

            <div className="fixed top-0 left-0 w-full z-[999] bg-white dark:bg-dark md:bg-white/80 dark:md:bg-dark/80 backdrop-blur-md">
                {/* NAV BAR */}
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center">
                    <div className="ml-auto flex items-center space-x-4">
                        {loggedIn ? (
                            <Link href="/profile" aria-label="Profile">
                                {user?.profilePicture ? (
                                    <img
                                        src={`${BASE_URL}${user.profilePicture}`}
                                        alt="Profile"
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
                                            className="relative group text-gray-700 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
                                        >
                                            Subscription
                                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#1D9BF0] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                        </Link>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="relative group text-gray-700 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
                                    >
                                        Гарах
                                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#1D9BF0] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                    className="relative group text-gray-700 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
                                >
                                    Нэвтрэх
                                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#1D9BF0] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                </Link>
                                <Link
                                    href="/register"
                                    className="relative group text-gray-700 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0] bg-yellow-300 text-black px-2 rounded"
                                >
                                    Бүртгүүлэх
                                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#1D9BF0] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
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
                            <span className="block w-6 h-0.5 bg-gray-800 dark:bg-white mb-1" />
                            <span className="block w-6 h-0.5 bg-gray-800 dark:bg-white mb-1" />
                            <span className="block w-6 h-0.5 bg-gray-800 dark:bg-white" />
                        </button>
                    </div>
                </nav>

                {/* FULL-SCREEN MOBILE DRAWER */}
                <div
                    className={`
            fixed inset-0
            bg-white dark:bg-dark
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
                                className="text-gray-500 dark:text-white text-3xl focus:outline-none hover:text-gray-700 dark:hover:text-white"
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
                                                    className="block text-xl font-medium text-gray-800 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                                className="block text-left w-full text-xl font-medium text-gray-800 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                                className="block text-xl font-medium text-gray-800 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
                                            >
                                                Нэвтрэх
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="block text-xl font-medium text-gray-800 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0] bg-yellow-300 text-black px-2 rounded"
                                            >
                                                Бүртгүүлэх
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>

                            {/* Additional Nav Items */}
                            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <ul className="space-y-4 text-lg font-semibold text-gray-700 dark:text-white">
                                    <li>
                                        <Link
                                            href="/"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                />
                                            </svg>
                                            Нүүр
                                        </Link>
                                    </li>
                                <li>
                                    <Link
                                        href="/wallet"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-2 hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                                d="M2.25 6.75h19.5v10.5H2.25zM2.25 9h19.5"
                                            />
                                        </svg>
                                        Wallet
                                    </Link>
                                </li>
                                {loggedIn && !isPro && (
                                    <li>
                                        <Link
                                            href="/subscription"
                                            onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-2 hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                            className="flex items-center gap-2 hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            Гишүүд
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z" />
                                            </svg>
                                            Таск
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
