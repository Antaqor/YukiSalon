import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "My Minimal Subscription App",
    description: "Demo for subscription + minimal user schema with subscription",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className="flex-grow max-w-4xl mx-auto p-4 mt-4">
                {children}
            </main>

            {/* Footer */}
            <footer className="w-full bg-gray-800 text-gray-200 p-4 text-center">
                <p>© 2025 My App. All rights reserved.</p>
            </footer>
        </AuthProvider>
        </body>
        </html>
    );
}
