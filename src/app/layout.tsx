import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import type { Metadata } from "next";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("https://vone.mn"),
    title: {
        default: "VONE",
        template: "%s | VONE",
    },
    description:
        "VONE - A next-generation community platform for networking and innovation.",
    keywords: ["VONE", "Community", "DAO", "Network", "Zaluusiin Network"],
    authors: [{ name: "Vone Tech", url: "https://vone.mn" }],
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },
    openGraph: {
        title: "VONE – A Next-Generation Platform",
        description:
            "Join THE VONE CLAN – Your community for networking and innovation.",
        url: "https://vone.mn",
        siteName: "VONE",
        images: [
            {
                url: "https://cdn.midjourney.com/9c84cf56-387f-4b49-a6c9-b991843f77e6/0_0.png",
                width: 1200,
                height: 630,
                alt: "VONE Community - THE VONE CLAN",
            },
        ],
        locale: "mn_MN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "VONE - Next-Gen Platform",
        description:
            "Join THE VONE CLAN – Your community for networking and innovation.",
        images: [
            "https://cdn.midjourney.com/9c84cf56-387f-4b49-a6c9-b991843f77e6/0_0.png",
        ],
        creator: "@your_twitter_handle",
    },
    alternates: {
        canonical: "https://vone.mn",
        languages: {
            "mn-MN": "https://vone.mn/mn-mn",
            "en-US": "https://vone.mn/en-us",
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon-32x32.png",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body
            className={`${inter.className} flex flex-col min-h-screen bg-[#000000] text-[#E1E8ED]`}
        >
        <AuthProvider>
            {/* Shared Container for Header and Main */}
            <div className="max-w-7xl w-full mx-auto px-6">
                {/* Header */}
                <Header />

                {/* Main Layout */}
                <main className="flex-grow flex flex-col md:flex-row gap-0 pt-16">
                    {/* Left Sidebar */}
                    <aside className="hidden md:block w-full md:w-1/4 border-r border-[#2f3336] sticky top-16 h-[calc(100vh-80px)] overflow-y-auto">
                        <nav>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/"
                                        className="group flex items-center p-4 pl-0 text-xl font-bold transition-colors duration-200 hover:bg-[#2f3336] focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 mr-2 text-[#E1E8ED] group-hover:text-[#1D9BF0] group-hover:scale-110 transition-all duration-200"
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
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/explore"
                                        className="group flex items-center p-4 pl-0 text-xl font-bold transition-colors duration-200 hover:bg-[#2f3336] focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 mr-2 text-[#E1E8ED] group-hover:text-[#1D9BF0] group-hover:scale-110 transition-all duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        Explore
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/notifications"
                                        className="group flex items-center p-4 pl-0 text-xl font-bold transition-colors duration-200 hover:bg-[#2f3336] focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 mr-2 text-[#E1E8ED] group-hover:text-[#1D9BF0] group-hover:scale-110 transition-all duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                            />
                                        </svg>
                                        Notifications
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/messages"
                                        className="group flex items-center p-4 pl-0 text-xl font-bold transition-colors duration-200 hover:bg-[#2f3336] focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 mr-2 text-[#E1E8ED] group-hover:text-[#1D9BF0] group-hover:scale-110 transition-all duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Messages
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/profile"
                                        className="group flex items-center p-4 pl-0 text-xl font-bold transition-colors duration-200 hover:bg-[#2f3336] focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 mr-2 text-[#E1E8ED] group-hover:text-[#1D9BF0] group-hover:scale-110 transition-all duration-200"
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
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/settings"
                                        className="group flex items-center p-4 pl-0 text-xl font-bold transition-colors duration-200 hover:bg-[#2f3336] focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 mr-2 text-[#E1E8ED] group-hover:text-[#1D9BF0] group-hover:scale-110 transition-all duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        Settings
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="w-full md:w-1/2 border-r border-[#2f3336]">
                        <div className="p-4 space-y-6">{children}</div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="hidden md:block w-full md:w-1/4 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto p-2">
                        <div className="space-y-6">
                            {/* Trending Topics */}
                            <div className="p-4 transition-shadow duration-200 hover:shadow-md">
                                <h2 className="flex items-center font-semibold mb-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 mr-2 text-[#1D9BF0]"
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
                                    Trending Topics
                                </h2>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#1D9BF0] hover:underline transition-colors duration-200"
                                        >
                                            #Innovation
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#1D9BF0] hover:underline transition-colors duration-200"
                                        >
                                            #Networking
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#1D9BF0] hover:underline transition-colors duration-200"
                                        >
                                            #DAO
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Suggested Follows */}
                            <div className="p-4 transition-shadow duration-200 hover:shadow-md">
                                <h2 className="flex items-center font-semibold mb-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 mr-2 text-[#1D9BF0]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    Suggested Follows
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src="/placeholder-user.jpg"
                                            alt="User avatar"
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">User One</p>
                                            <p className="text-gray-400 text-sm">@userone</p>
                                        </div>
                                        <button className="bg-[#1D9BF0] text-white px-4 py-1 rounded-full hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>

            {/* Footer */}
            <footer className="w-full text-sm text-center py-4 border-t border-[#2f3336]">
                <p className="text-gray-400">
                    © 2025 THE VONE CLAN. All rights reserved.
                </p>
            </footer>
        </AuthProvider>
        </body>
        </html>
    );
}