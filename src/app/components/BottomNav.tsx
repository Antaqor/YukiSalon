"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    HomeIcon,
    ClockIcon,
    ShoppingBagIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

const BottomNav: React.FC = () => {
    const router = useRouter();

    // Get nav height on initial mount if needed

    return (
        <nav
            className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-200 dark:border-black z-50 shadow-sm"
        >
            <div className="flex justify-around items-center py-3 sm:py-4">
                {/* HOME */}
                <button
                    onClick={() => router.push("/")}
                    className="flex flex-col items-center text-black dark:text-white hover:text-gray-600 dark:hover:text-white transition p-1"
                >
                    <HomeIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>

                {/* TIME */}
                <button
                    onClick={() => router.push("/orders")}
                    className="flex flex-col items-center text-black dark:text-white hover:text-gray-600 dark:hover:text-white transition p-1"
                >
                    <ClockIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
                <button
                    onClick={() => router.push("/orders")}
                    className="flex flex-col items-center text-black dark:text-white hover:text-gray-600 dark:hover:text-white transition p-1"
                >
                    <ShoppingBagIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
                {/* PROFILE */}
                <button
                    onClick={() => router.push("/profile")}
                    className="flex flex-col items-center text-black dark:text-white hover:text-gray-600 dark:hover:text-white transition p-1"
                >
                    <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;
