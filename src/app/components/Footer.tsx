"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="bg-surface text-textPrimary py-6 mt-8">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* Copyright Text */}
                <p className="text-sm mb-2 sm:mb-0">
                    &copy; {new Date().getFullYear()} Salon. All rights reserved.
                </p>

                {/* Navigation Links */}
                <nav className="text-sm space-x-4">
                    <Link href="/terms" className="hover:text-brand">
                        Terms
                    </Link>
                    <Link href="/privacy" className="hover:text-brand">
                        Privacy
                    </Link>
                    <Link href="/contact" className="hover:text-brand">
                        Contact
                    </Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
