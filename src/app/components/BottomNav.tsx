"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    HomeIcon,
    MagnifyingGlassIcon,
    PlusCircleIcon,
    BellIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";

const BottomNav: React.FC = () => {
    const router = useRouter();

    // Get nav height on initial mount if needed

    return (
        <nav
            className="fixed bottom-0 left-0 w-full bg-white dark:bg-black md:hidden"
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

                {/* SHOP / SEARCH */}
                <button
                    onClick={() => router.push("/shop")}
                    aria-label="Shop"
                    className="p-1 text-black dark:text-white"
                >
                    <MagnifyingGlassIcon className="h-7 w-7" />
                </button>

                {/* COMPOSE / PROFILE */}
                <button
                    onClick={() => router.push("/profile")}
                    aria-label="Profile"
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

                {/* MESSAGES */}
                <button
                    onClick={() => router.push("/messages")}
                    aria-label="Messages"
                    className="p-1 text-black dark:text-white"
                >
                    <EnvelopeIcon className="h-7 w-7" />
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;
