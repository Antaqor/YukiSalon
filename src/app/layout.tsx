// File: /app/layout.tsx

import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import AdaptiveUserInterface from "./AdaptiveUserInterface";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    // Base URL for relative links and canonical URLs
    metadataBase: new URL("https://foru.mn"), // Replace with your domain

    // Page title and template
    title: {
        default: "Foru – A Next-Generation Scheduling and Booking Platform",
        template: "%s | Foru",
    },

    // Global description
    description: "A next-generation scheduling and booking platform with advanced features.",

    // Provide a list of keywords
    keywords: ["Foru", "scheduling", "booking", "appointments", "business management"],

    // Provide author or publisher info
    authors: [{ name: "Vone Tech", url: "https://foru.mn" }],

    // Optional: If you have a publisher or multiple authors,
    // you could also add `publisher` or additional author objects

    // Verification tokens (Google, Yandex, etc.)
    // Only works in Next.js 13.3+ if the framework includes <Meta> injection.
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",  // e.g., "abc123..."
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },

    // Configure Open Graph data for link previews
    openGraph: {
        title: "Foru – A Next-Generation Scheduling and Booking Platform",
        description: "Discover next-level scheduling and booking experiences with Foru.",
        url: "https://foru.mn",
        siteName: "Foru",
        images: [
            {
                url: "https://example.com/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Foru - Scheduling & Booking",
            },
        ],
        locale: "en_US",
        type: "website",
    },

    // Configure Twitter Card data
    twitter: {
        card: "summary_large_image",
        title: "Foru – A Next-Generation Scheduling and Booking Platform",
        description: "Reinventing appointments and bookings for modern businesses.",
        images: ["https://example.com/og-image.jpg"],
        creator: "@your_twitter_handle", // Your Twitter handle
    },

    // Favicons & icons
    // You can specify multiple icon sizes/formats for better device/browser compatibility
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
    },

    // If you have a Web App Manifest for PWA capabilities
    manifest: "/site.webmanifest",

    // Set theme-color for mobile browsers or OS-level UI
    // Different values can be specified for light/dark mode
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],

    // Provide canonical (and other language) URLs
    // (Only necessary if you have multiple locales or want explicit canonical linking)
    alternates: {
        canonical: "https://example.com",
        languages: {
            "en-US": "https://example.com/en-us",
            // Add other language versions here, if applicable
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
        <body className={`min-h-screen bg-gray-50 ${inter.className}`}>
        {/* <AuthProvider> so entire app can read auth context */}
        <AuthProvider>
            <AdaptiveUserInterface>{children}</AdaptiveUserInterface>
        </AuthProvider>
        </body>
        </html>
    );
}
