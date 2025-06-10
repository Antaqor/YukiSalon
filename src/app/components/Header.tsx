"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { loggedIn, logout } = useAuth();

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
                    <ThemeToggle />
                    <div className="ml-auto hidden md:flex items-center space-x-8 font-medium">
                        {loggedIn ? (
                            <button
                                onClick={logout}
                                className="relative group text-gray-700 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
                            >
                                Гарах
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#1D9BF0] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </button>
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
                                    className="relative group text-gray-700 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                <li>
                                    <ThemeToggle />
                                </li>
                                {loggedIn ? (
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
                                                className="block text-xl font-medium text-gray-800 dark:text-white hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0]"
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
                                            href="/book"
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
                                                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                                                />
                                            </svg>
                                            Ном
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/notifications"
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
                                                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                                />
                                            </svg>
                                            Мэдээлэл
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/shop"
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
                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                />
                                            </svg>
                                            Дэлгүүр
                                        </Link>
                                    </li>
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
                                                <path d="M19.5 6H17V4.5C17 3.12 15.88 2 14.5 2h-5C8.12 2 7 3.12 7 4.5V6H4.5C3.12 6 2 7.12 2 8.5v10C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-10C22 7.12 20.88 6 19.5 6zM9 4.5c0-.28.23-.5.5-.5h5c.28 0 .5.22.5.5V6H9V4.5zm11 14c0 .28-.22.5-.5.5h-15c-.27 0-.5-.22-.5-.5v-3.04c.59.35 1.27.54 2 .54h5v1h2v-1h5c.73 0 1.41-.19 2-.54v3.04zm0-6.49c0 1.1-.9 1.99-2 1.99h-5v-1h-2v1H6c-1.1 0-2-.9-2-2V8.5c0-.28.23-.5.5-.5h15c.28 0 .5.22.5.5v3.51z"/>
                                            </svg>
                                            Ажил
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
