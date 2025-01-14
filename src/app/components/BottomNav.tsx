"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    HomeIcon,
    BellIcon,
    NewspaperIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

const BottomNav: React.FC = () => {
    const router = useRouter();

    // Track navigation visibility
    const [isVisible, setIsVisible] = useState(true);

    // Measure the nav's height dynamically
    const navRef = useRef<HTMLElement>(null);
    const [navHeight, setNavHeight] = useState<number>(0);

    // Get nav height on initial mount
    useEffect(() => {
        if (navRef.current) {
            setNavHeight(navRef.current.offsetHeight);
        }
    }, []);

    // Only hide when user is near the bottom of the page
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;

            // If at/near bottom, hide; otherwise, show
            if (scrollPosition >= pageHeight - 1) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            ref={navRef}
            // Animate both 'transform' and 'opacity' for a smoother effect
            style={{
                transform: isVisible ? "translateY(0)" : `translateY(${navHeight}px)`,
                opacity: isVisible ? 1 : 0,
                transition:
                    "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out",
            }}
            className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 z-50 shadow-sm"
        >
            {/*
        Using `justify-around` or `justify-between` keeps icons nicely spaced.
        Adjust gap or padding as needed for your design preference.
      */}
            <div className="flex justify-around items-center py-3 sm:py-4">
                {/* HOME */}
                <button
                    onClick={() => router.push("/")}
                    className="flex flex-col items-center text-black hover:text-gray-600 transition p-1"
                >
                    <HomeIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>

                {/* NOTIFICATIONS */}
                <button
                    onClick={() => router.push("/notifications")}
                    className="flex flex-col items-center text-black hover:text-gray-600 transition p-1"
                >
                    <BellIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>

                {/* NEWSFEED */}
                <button
                    onClick={() => router.push("/newsfeed")}
                    className="flex flex-col items-center text-black hover:text-gray-600 transition p-1"
                >
                    <NewspaperIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>

                {/* PROFILE */}
                <button
                    onClick={() => router.push("/profile")}
                    className="flex flex-col items-center text-black hover:text-gray-600 transition p-1"
                >
                    <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;
