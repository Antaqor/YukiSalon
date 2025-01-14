"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Header() {
    const router = useRouter();

    // Controls whether the popup overlay is visible
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Ref to the popup container (used to detect outside clicks)
    const menuRef = useRef<HTMLDivElement>(null);

    // Toggle the menu open/close
    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close the popup if user clicks outside of it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isMenuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <>
            <header
                className="
          fixed
          top-0
          left-0
          z-20
          w-full
          h-16
          bg-white
          border-b
          border-gray-200
          flex
          items-center
          justify-between
          px-4
        "
            >
                {/* Left: Profile Placeholder */}
                <div
                    className="
            w-8
            h-8
            bg-gray-200
            rounded-md
            cursor-pointer
            hover:bg-gray-300
            transition
          "
                    onClick={() => router.push("/profile")}
                    aria-label="Profile Placeholder"
                />

                {/* Center: Logo */}
                <Link
                    href="/"
                    className="
            absolute
            left-1/2
            transform
            -translate-x-1/2
          "
                >
                    <span className="text-xl font-bold text-blue-600">Foru</span>
                </Link>

                {/* Right: Burger Menu */}
                <button
                    onClick={handleMenuToggle}
                    className="
            text-black
            hover:text-gray-600
            transition
            p-2
          "
                    aria-label="Open Menu"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
            </header>

            {/* Spacer below the header so the main content isn't hidden underneath */}
            <div className="mt-16" />

            {/* Full-page overlay when the menu is open */}
            {isMenuOpen && (
                <div
                    className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black
            bg-opacity-50
            overflow-x-hidden
            overflow-y-auto
          "
                >
                    {/* Centered white popup container, larger than before */}
                    <div
                        ref={menuRef}
                        className="
              bg-white
              rounded-lg
              shadow-xl
              p-8
              w-full
              max-w-2xl
              relative
              mx-4
            "
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="
                absolute
                top-4
                right-4
                text-gray-400
                hover:text-gray-600
                transition
                text-2xl
              "
                            aria-label="Close Menu"
                        >
                            &times;
                        </button>

                        {/* Sample Text Content */}
                        <h2 className="text-2xl font-semibold mb-4">Welcome to the Modal</h2>
                        <p className="text-gray-600 mb-4">
                            This is a larger, modern-styled popup. Below are some links and
                            sample text to demonstrate how your modal might look with real
                            content.
                        </p>
                        <p className="text-gray-600 mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                            feugiat ultricies elit, a finibus dui semper et. Duis feugiat
                            consequat felis, eu dictum nibh maximus vel. Sed scelerisque porta
                            est, in convallis lectus consectetur quis. Morbi lorem libero,
                            facilisis non erat in, luctus dictum ipsum.
                        </p>

                        {/* Social Links */}
                        <div className="mt-8 flex flex-col space-y-2">
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                  text-blue-600
                  hover:text-blue-800
                  transition
                  text-base
                  block
                "
                            >
                                Facebook
                            </a>
                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                  text-pink-600
                  hover:text-pink-800
                  transition
                  text-base
                  block
                "
                            >
                                Instagram
                            </a>
                            <a
                                href="https://www.youtube.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                  text-red-600
                  hover:text-red-800
                  transition
                  text-base
                  block
                "
                            >
                                YouTube
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
