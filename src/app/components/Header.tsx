"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/img/logo.svg";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="fixed top-0 left-0 w-full z-50">
            <header className="bg-black bg-opacity-80 backdrop-blur-md relative">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link href="/">
                            <Image
                                src={logo}
                                alt="Logo"
                                className="h-8 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
                            />
                        </Link>
                        <span className="text-white font-bold text-lg">Vone</span>
                    </div>
                    <div className="hidden md:flex space-x-6">
                        {isLoggedIn ? (
                            <Link
                                href="/logout"
                                className="flex items-center text-gray-100 hover:text-blue-400 relative group"
                            >
                                Logout
                                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center text-gray-100 hover:text-blue-400 relative group"
                                >
                                    Login
                                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center text-gray-100 hover:text-blue-400 relative group"
                                >
                                    Register
                                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Link>
                            </>
                        )}
                    </div>
                    <button
                        className="md:hidden absolute top-4 right-4 focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                    </button>
                </nav>
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-60 flex flex-col p-4 md:hidden transition-opacity duration-300 ease-in-out">
                        <nav className="mt-12">
                            <ul className="space-y-6">
                                {isLoggedIn ? (
                                    <li>
                                        <Link
                                            href="/logout"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                        >
                                            Logout
                                        </Link>
                                    </li>
                                ) : (
                                    <>
                                        <li>
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                            >
                                                Login
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                            >
                                                Register
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </div>
                )}
            </header>
        </div>
    );
}