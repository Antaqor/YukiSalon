import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import TrendingHashtags from "./components/TrendingHashtags";
import BottomNav from "./components/BottomNav";
import SidebarControl from "./components/SidebarControl";
import WalletBalance from "./components/WalletBalance";
import type { Metadata } from "next";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL(" https://www.vone.mn"),
    title: {
        default: "VONE",
        template: "%s | VONE",
    },
    description: "VONE - Сүлжээ ба инновацийн дараагийн үеийн платформ.",
    keywords: ["VONE", "Community", "DAO", "Network", "Zaluusiin Network"],
    authors: [{ name: "Vone Tech", url: " https://www.vone.mn" }],
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },
    openGraph: {
        title: "VONE – Дараагийн үеийн платформ",
        description: "VONE CLAN-д нэгдээрэй – Сүлжээ, инновацийн хамт олон.",
        url: " https://www.vone.mn",
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
        title: "VONE - Дараагийн үеийн платформ",
        description: "VONE CLAN-д нэгдээрэй – Сүлжээ, инновацийн хамт олон.",
        images: [
            "https://cdn.midjourney.com/9c84cf56-387f-4b49-a6c9-b991843f77e6/0_0.png",
        ],
        creator: "@your_twitter_handle",
    },
    alternates: {
        canonical: " https://www.vone.mn",
        languages: {
            "mn-MN": " https://www.vone.mn/mn-mn",
            "en-US": " https://www.vone.mn/en-us",
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon-32x32.png",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="mn" className="dark">
        <body
            className={`${inter.className} flex flex-col min-h-screen bg-black text-white`}
        >
        <ThemeProvider>
        <CartProvider>
        <AuthProvider>
            <div className="max-w-7xl w-full mx-auto md:px-6">

            <SidebarControl />
            <Header />

                {/* Үндсэн Layout */}
                <main className="flex-grow flex flex-col md:flex-row gap-0 pt-16">
                    {/* Зүүн талын Sidebar */}
                    <aside id="left-sidebar" className="hidden md:block w-full md:w-1/4 border-r border-gray-200 dark:border-gray-700 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto fade-in-up">
                        <WalletBalance />
                        <nav>
                            <ul className="space-y-1">
                                <li>
                                    <Link
                                        href="/"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#1D9BF0]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 12l2-2m0 0l7-7 7 7M5
                               10v10a1 1 0 001 1h3m10-11l2
                               2m-2-2v10a1 1 0 01-1 1h-3m-6
                               0a1 1 0 001-1v-4a1 1 0 011-1h2a1
                               1 0 011 1v4a1 1 0 001 1m-6
                               0h6"
                                            />
                                        </svg>
                                        <span className="dark:text-white">Нүүр</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/wallet"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 dark:text-white transition-smooth focus:outline-none hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#1D9BF0]"
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
                                        <span className="dark:text-white">Wallet</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/users"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#1D9BF0]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0
                               11-8 0 4 4 0 018 0zM12
                               14a7 7 0 00-7 7h14a7
                               7 0 00-7-7z"
                                            />
                                        </svg>
                                        <span className="dark:text-white">Гишүүд</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/settings"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   hover:text-[#1D9BF0] dark:hover:text-[#1D9BF0] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#1D9BF0]"
                                        >
                                            <path d="M3 4.5C3 3.12 4.12
                                  2 5.5 2h13C19.88 2
                                  21 3.12 21
                                  4.5v15c0 1.38-1.12
                                  2.5-2.5 2.5h-13C4.12 22 3
                                  20.88 3
                                  19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0
                                  .28.22.5.5.5h13c.28 0
                                  .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16
                                  10H8V8h8v2zm-8 2h8v2H8v-2z" />
                                        </svg>
                                        <span className="dark:text-white">Таск</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Үндсэн контент */}
                    <div className="w-full md:w-1/2 md:border-r md:border-gray-200 dark:md:border-gray-700">
                        <div className="space-y-6">{children}</div>
                    </div>

                    {/* Баруун талын Sidebar */}
                    <aside id="right-sidebar" className="hidden md:block w-full md:w-1/4 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto p-2 fade-in-up">
                        <div className="space-y-6">
                            {/* Идэвхтэй сэдвүүд */}
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
                                            d="M13 7h8m0
                             0v8m0-8l-8 8-4-4-6
                             6"
                                        />
                                    </svg>
                                    Идэвхтэй сэдвүүд
                                </h2>
                                <ul className="space-y-3">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#1D9BF0] hover:underline transition-colors duration-200"
                                        >
                                            #Инноваци
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#1D9BF0] hover:underline transition-colors duration-200"
                                        >
                                            #Сүлжээ
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

                            <TrendingHashtags />
                        </div>
                    </aside>
                </main>
            </div>

            {/* Хөл хэсэг */}
            <footer className="w-full text-sm text-center py-4 border-t border-gray-300">
                <p className="text-gray-600">
                    © 2025 THE VONE CLAN. Бүх эрх хуулиар хамгаалагдсан.
                </p>
            </footer>
            <BottomNav />
        </AuthProvider>
        </CartProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
