import "./globals.css";
import { Inter } from "next/font/google";
import ClientWrapper from "./components/ClientWrapper";
import SidebarRight from "../../src/app/components/SidebarRight";
import SidebarLeft from "../../src/app/components/SidebarLeft";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Salon Booking App",
    description: "Modern salon booking system",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.className}>
        <body className="min-h-screen bg-gray-50">
        <ClientWrapper>
            {/* Fixed header at the top */}
            <Header />

            {/* Fixed left sidebar */}
            <SidebarLeft />

            {/* Fixed right sidebar */}
            <SidebarRight />

            {/* Main content in the center, spaced around fixed header & sidebars */}
            <main className="pt-16 ml-64 mr-64 min-h-screen">
                {children}
            </main>
        </ClientWrapper>
        </body>
        </html>
    );
}
