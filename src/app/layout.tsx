import "./globals.css";
import type { Metadata } from "next";
import LayoutClient from "./components/LayoutClient";


export const metadata: Metadata = {
    metadataBase: new URL("https://www.vone.mn"),
    title: {
        default: "VONE",
        template: "%s | VONE",
    },
    description: "VONE - Сүлжээ, инноваци, олон нийтийн хүчийг нэгтгэсэн платформ.",
    keywords: ["VONE", "Community", "DAO", "Network", "Innovation", "Social Network"],
    authors: [{ name: "Vone Tech", url: "https://www.vone.mn" }],
    verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION_TOKEN",
        yandex: "YOUR_YANDEX_SITE_VERIFICATION_TOKEN",
    },
    openGraph: {
        title: "VONE – Дараагийн үеийн платформ",
        description: "VONE CLAN-д нэгдээрэй – Сүлжээ, инновацийн хамт олон.",
        url: "https://www.vone.mn",
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
        canonical: "https://www.vone.mn",
        languages: {
            "mn-MN": "https://www.vone.mn/mn-mn",
            "en-US": "https://www.vone.mn/en-us",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="mn" className="dark">
            <body className="flex flex-col min-h-screen bg-[#171717] text-white font-sans">
                <LayoutClient>{children}</LayoutClient>
            </body>
        </html>
    );
}
