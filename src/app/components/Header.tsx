"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/app/img/logo.svg";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="fixed top-0 left-0 w-full z-50">
            <header className="bg-black bg-opacity-80 backdrop-blur-md relative">
                {/* Navigation bar with logo and desktop navigation */}
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/">
                        <Image
                            src={logo}
                            alt="Logo"
                            className="h-8 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-6">
                        <Link href="/" className="text-gray-100 hover:text-blue-400 relative group">
                            Home
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                        <Link href="/explore" className="text-gray-100 hover:text-blue-400 relative group">
                            Explore
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                        <Link href="/notifications" className="text-gray-100 hover:text-blue-400 relative group">
                            Notifications
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                        <Link href="/messages" className="text-gray-100 hover:text-blue-400 relative group">
                            Messages
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                        <Link href="/profile" className="text-gray-100 hover:text-blue-400 relative group">
                            Profile
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                        <Link href="/settings" className="text-gray-100 hover:text-blue-400 relative group">
                            Settings
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </Link>
                    </div>

                    {/* Burger menu button (visible only on mobile) */}
                    <button
                        className="md:hidden absolute top-4 right-4 focus:outline-none"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <div className="space-y-1">
                            <div className="w-6 h-0.5 bg-gray-100 transition-transform duration-300 ease-in-out transform" style={isMenuOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}}></div>
                            <div className="w-6 h-0.5 bg-gray-100 transition-opacity duration-300 ease-in-out" style={isMenuOpen ? { opacity: 0 } : {}}></div>
                            <div className="w-6 h-0.5 bg-gray-100 transition-transform duration-300 ease-in-out transform" style={isMenuOpen ? { transform: "rotate(-45deg) translate(6px, -6px)" } : {}}></div>
                        </div>
                    </button>
                </nav>

                {/* Mobile menu (visible when burger is clicked) */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-60 flex flex-col p-4 md:hidden transition-opacity duration-300 ease-in-out">
                        {/* Close button integrated into burger animation */}
                        <nav className="mt-12">
                            <ul className="space-y-6">
                                <li>
                                    <Link
                                        href="/"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/explore"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                    >
                                        Explore
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/notifications"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                    >
                                        Notifications
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/messages"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                    >
                                        Messages
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-gray-100 hover:text-blue-400 text-xl font-medium transition-colors"
                                    >
                                        Settings
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </header>
        </div>
    );
}