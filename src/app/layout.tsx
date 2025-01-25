// app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("http://vone.foru.mn"),
    title: {
        default: "VONE",
        template: "%s | THE VONE CLAN",
    },
    description: "A next-generation scheduling and booking platform with advanced features.",
    keywords: ["VONE", "COMMUNITY", "dao", "network", "zaluusiin network"],
    authors: [{ name: "Vone Tech", url: "https://vone.foru.mn" }],
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },
    openGraph: {
        title: "VONE – A Next-Generation Platform",
        description: "THE VONE CLAN",
        url: "http://vone.foru.mn",
        siteName: "THE VONE CLAN",
        images: [
            {
                url: "https://example.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "THE VONE CLAN",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "THE VONE CLAN",
        description: "THE VONE CLAN",
        images: ["https://example.com/og-image.jpg"],
        creator: "@your_twitter_handle",
    },
    alternates: {
        canonical: "https://example.com",
        languages: {
            "en-US": "https://example.com/en-us",
        },
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
