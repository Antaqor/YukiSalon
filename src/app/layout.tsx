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
    description: "VONE - A next-generation community platform for networking and innovation.",
    keywords: ["VONE", "Community", "DAO", "Network", "Zaluusiin Network"],
    authors: [{ name: "Vone Tech", url: "https://vone.mn" }],
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },
    openGraph: {
        title: "VONE – A Next-Generation Platform",
        description: "Join THE VONE CLAN – Your community for networking and innovation.",
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
        description: "Join THE VONE CLAN – Your community for networking and innovation.",
        images: ["https://cdn.midjourney.com/9c84cf56-387f-4b49-a6c9-b991843f77e6/0_0.png"],
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
        <body className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900`}>
        <AuthProvider>
            {/* Header */}
            <Header />

            {/* Main Layout: Responsive 3-column design with padding-top */}
            <main className="flex-grow container mx-auto flex flex-col md:flex-row gap-6 px-4 py-6 pt-16">
                {/* Left Sidebar: Sticky on medium+ screens */}
                <aside className="hidden md:block w-full md:w-1/4 bg-gray-50 p-4 rounded-lg shadow-sm sticky top-16 h-[calc(100vh-80px)] overflow-y-auto">
                    <nav>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/"
                                    className="block p-3 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/explore"
                                    className="block p-3 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Explore
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/notifications"
                                    className="block p-3 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Notifications
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/messages"
                                    className="block p-3 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Messages
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/profile"
                                    className="block p-3 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings"
                                    className="block p-3 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Settings
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content: Full-width on small screens, half-width on medium+ */}
                <div className="w-full md:w-1/2 space-y-6">
                    {children}
                </div>

                {/* Right Sidebar: Sticky on medium+ screens */}
                <aside className="hidden md:block w-full md:w-1/4 bg-gray-50 p-4 rounded-lg shadow-sm sticky top-16 h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="space-y-6">
                        {/* Trending Topics */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <h2 className="font-semibold text-gray-900 mb-3">Trending Topics</h2>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-blue-600 hover:underline transition-colors duration-200">
                                        #Innovation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-blue-600 hover:underline transition-colors duration-200">
                                        #Networking
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-blue-600 hover:underline transition-colors duration-200">
                                        #DAO
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Suggested Follows */}
                        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <h2 className="font-semibold text-gray-900 mb-3">Suggested Follows</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src="/placeholder-user.jpg"
                                        alt="User avatar"
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">User One</p>
                                        <p className="text-gray-500 text-sm">@userone</p>
                                    </div>
                                    <button className="bg-blue-600 text-white px-4 py-1 rounded-full hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        Follow
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Footer */}
            <footer className="w-full bg-black text-gray-200 text-sm text-center py-4">
                <p>© 2025 THE VONE CLAN. All rights reserved.</p>
            </footer>
        </AuthProvider>
        </body>
        </html>
    );
}