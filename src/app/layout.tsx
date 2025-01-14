// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClientWrapper from "./components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Salon Booking App",
    description: "Modern salon booking system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.className}>
        <body className="min-h-screen flex flex-col">
        <ClientWrapper>
            <Header />
            <main className="flex-1 pt-16 bg-gray-50">{children}</main>
            <Footer />
        </ClientWrapper>
        </body>
        </html>
    );
}