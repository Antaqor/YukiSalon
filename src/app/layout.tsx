// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("http://localhost:5001"), // **HTTPS-г анхаарах**
    title: {
        default: "VONE",
        template: "%s | VONE",
    },
    description: "VONE - A next-generation community platform for networking and innovation.",
    keywords: ["VONE", "Community", "DAO", "Network", "Zaluusiin Network"],
    authors: [{ name: "Vone Tech", url: "http://localhost:5001" }],
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN", // Google search-т зориулсан verification
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },

    openGraph: {
        title: "VONE – A Next-Generation Platform",
        description: "Join THE VONE CLAN – Your community for networking and innovation.",
        url: "http://localhost:5001",
        siteName: "VONE",
        images: [
            {
                url: "https://cdn.midjourney.com/9c84cf56-387f-4b49-a6c9-b991843f77e6/0_0.png", // **Social Preview зураг**
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
        creator: "@your_twitter_handle", // Өөрийн Twitter хаягаа оруулах
    },

    alternates: {
        canonical: "http://localhost:5001",
        languages: {
            "mn-MN": "http://localhost:5001/mn-mn", // Монгол хувилбар
            "en-US": "http://localhost:5001/en-us", // Англи хувилбар
        },
    },

    icons: {
        icon: "/favicon.ico", // **Tab дээр харагдах favicon**
        apple: "/apple-touch-icon.png", // **Apple home screen дээр**
        shortcut: "/favicon-32x32.png", // **Windows & Android**
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900`}>
        <AuthProvider>
            {/* Header хэсэг */}
            <Header />

            {/* Үндсэн контент */}
            <main className="flex-grow container mx-auto">
                <div className="p-6">
                    {children}
                </div>
            </main>

            {/* Footer хэсэг */}
            <footer className="w-full bg-black text-gray-200 text-sm text-center py-4">
                <p>© 2025 THE VONE CLAN. All rights reserved.</p>
            </footer>
        </AuthProvider>
        </body>
        </html>
    );
}