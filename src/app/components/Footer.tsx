// app/components/Footer.tsx
"use client";
import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-100 text-gray-600 py-6 mt-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm mb-2 sm:mb-0">
                    &copy; {new Date().getFullYear()} Salon. All rights reserved.
                </p>
                <nav className="text-sm space-x-4">
                    <Link href="/terms" className="hover:text-blue-600">
                        Terms
                    </Link>
                    <Link href="/privacy" className="hover:text-blue-600">
                        Privacy
                    </Link>
                    <Link href="/contact" className="hover:text-blue-600">
                        Contact
                    </Link>
                </nav>
            </div>
        </footer>
    );
}