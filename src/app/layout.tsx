import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import AdaptiveUserInterface from "./AdaptiveUserInterface";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const inter = Inter({ subsets: ["latin"] });

// Server-only metadata
export const metadata: Metadata = {
    title: "Salon Booking System",
    description: "A next-generation scheduling and booking platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`min-h-screen bg-gray-50 ${inter.className}`}>
        {/* Client layout for mobile vs. desktop */}
        <AdaptiveUserInterface>{children}</AdaptiveUserInterface>
        </body>
        </html>
    );
}
