import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
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
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="mn">
        <body
            className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900 dark:bg-dark dark:text-white`}
        >
        <ThemeProvider>
        <CartProvider>
        <AuthProvider>
            <div className="max-w-7xl w-full mx-auto md:px-6">

            <Header />

                {/* Үндсэн Layout */}
                <main className="flex-grow flex flex-col md:flex-row gap-0 pt-16">
                    {/* Зүүн талын Sidebar */}
                    <aside className="hidden md:block w-full md:w-1/4 border-r border-gray-200 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto fade-in-up">
                        <nav>
                            <ul className="space-y-1">
                                <li>
                                    <Link
                                        href="/"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
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
                                        href="/book"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 6.042A8.967 8.967 0
                               006 3.75c-1.052 0-2.062.18-3
                               .512v14.25A8.987 8.987 0
                               006 18c2.305 0 4.408.867
                               6 2.292m0-14.25a8.966
                               8.966 0 016-2.292c1.052
                               0 2.062.18 3 .512v14.25A8.987
                               8.987 0 0018 18a8.967 8.967
                               0 00-6 2.292m0-14.25v14.25"
                                            />
                                        </svg>
                                        <span className="dark:text-white">Ном</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/notifications"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 20H5a2 2 0
                               01-2-2V6a2 2 0 012-2h10a2
                               2 0 012 2v1m2 13a2 2 0
                               01-2-2V7m2 13a2 2 0 002-2V9a2
                               2 0 00-2-2h-2m-4-3H9M7
                               16h6M7 8h6v4H7V8z"
                                            />
                                        </svg>
                                        <span className="dark:text-white">Мэдээлэл</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/shop"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 11V7a4 4
                               0 00-8 0v4M5 9h14l1 12H4L5
                               9z"
                                            />
                                        </svg>
                                        <span className="dark:text-white">Дэлгүүр</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/profile"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
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
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
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
                                <li>
                                    <Link
                                        href="/settings"
                                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold
                                   text-gray-700 dark:text-white transition-smooth focus:outline-none
                                   dark:hover:text-[#181818] focus:ring-2 focus:ring-[#1D9BF0]"
                                   >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-6 h-6 group-hover:text-[#1D9BF0] dark:text-white dark:group-hover:text-[#181818]"
                                        >
                                            <path d="M19.5 6H17V4.5C17
                                  3.12 15.88 2 14.5
                                  2h-5C8.12 2 7 3.12 7
                                  4.5V6H4.5C3.12 6 2 7.12 2
                                  8.5v10C2 19.88 3.12 21 4.5
                                  21h15c1.38 0 2.5-1.12 2.5-2.5v-10C22
                                  7.12 20.88 6 19.5 6zM9 4.5c0-.28.23-.5.5-.5h5c.28
                                  0 .5.22.5.5V6H9V4.5zm11
                                  14c0 .28-.22.5-.5.5h-15c-.27
                                  0-.5-.22-.5-.5v-3.04c.59.35
                                  1.27.54 2 .54h5v1h2v-1h5c.73
                                  0 1.41-.19 2-.54v3.04zm0-6.49c0
                                  1.1-.9 1.99-2 1.99h-5v-1h-2v1H6c-1.1
                                  0-2-.9-2-2V8.5c0-.28.23-.5.5-.5h15c.28
                                  0 .5.22.5.5v3.51z"/>
                                        </svg>
                                        <span className="dark:text-white">Ажил</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Үндсэн контент */}
                    <div className="w-full md:w-1/2 md:border-r md:border-gray-200">
                        <div className="space-y-6">{children}</div>
                    </div>

                    {/* Баруун талын Sidebar */}
                    <aside className="hidden md:block w-full md:w-1/4 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto p-2 fade-in-up">
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

                            {/* Зөвлөмж болгож буй хэрэглэгчид */}
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
                                            d="M18 9v3m0
                             0v3m0-3h3m-3
                             0h-3m-2-5a4 4 0
                             11-8 0 4 4 0
                             018 0zM3 20a6
                             6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    Зөвлөмж болгож буй хэрэглэгчид
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src="/placeholder-user.jpg"
                                            alt="User avatar"
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">Хэрэглэгч Нэг</p>
                                            <p className="text-gray-500 text-sm">@userone</p>
                                        </div>
                                        <button className="bg-[#1D9BF0] text-white px-4 py-1 rounded-full hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]">
                                            Дагах
                                        </button>
                                    </div>
                                </div>
                            </div>
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
        </AuthProvider>
        </CartProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
