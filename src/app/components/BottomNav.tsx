"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    HomeIcon,
    MagnifyingGlassIcon,
    PlusCircleIcon,
    BellIcon,
    WalletIcon,
} from "@heroicons/react/24/outline";

const BottomNav: React.FC = () => {
    const router = useRouter();
    const [scrolledDown, setScrolledDown] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const currentY = window.scrollY;
            if (currentY > lastY && currentY > 0) {
                setScrolledDown(true);
            } else if (currentY <= lastY || currentY === 0) {
                setScrolledDown(false);
            }
            lastY = currentY;
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed bottom-0 left-0 w-full md:hidden transition-all backdrop-blur-xl border-t border-white/30 dark:border-white/10 shadow-lg ${
                scrolledDown ? "bg-white/30 dark:bg-white/10" : "bg-white/20 dark:bg-white/5"
            }`}
        >
            <div
                className="flex justify-around items-center py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
            >
                {/* HOME */}
                <button
                    onClick={() => router.push("/")}
                    aria-label="Home"
                    className="p-1 text-black dark:text-white"
                >
                    <HomeIcon className="h-7 w-7" />
                </button>

                {/* NEW POST */}
                <button
                    onClick={() => router.push("/new-post")}
                    aria-label="New Post"
                    className="p-1 text-black dark:text-white"
                >
                    <PlusCircleIcon className="h-8 w-8" />
                </button>

                {/* NOTIFICATIONS */}
                <button
                    onClick={() => router.push("/notifications")}
                    aria-label="Notifications"
                    className="p-1 text-black dark:text-white"
                >
                    <BellIcon className="h-7 w-7" />
                </button>

                {/* WALLET */}
                <button
                    onClick={() => router.push("/wallet")}
                    aria-label="Wallet"
                    className="p-1 text-black dark:text-white"
                >
                    <WalletIcon className="h-7 w-7" />
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;
