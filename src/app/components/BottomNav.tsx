"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    HomeIcon,
    PlusCircleIcon,
    BellIcon,
    AcademicCapIcon,
} from "@heroicons/react/24/outline";
import AddPostModal from "./AddPostModal";

const BottomNav: React.FC = () => {
    const router = useRouter();
    const [scrolledDown, setScrolledDown] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
        <>
        <nav
            className={`fixed bottom-0 left-0 w-full md:hidden transition-all backdrop-blur-xl border-t border-supportBorder shadow-lg ${
                scrolledDown ? "bg-gradient-to-br from-white/40 via-white/20 to-white/10" : "bg-gradient-to-br from-white/30 via-white/10 to-white/5"
            }`}
        >
            <div
                className="flex justify-around items-center py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
            >
                {/* HOME */}
                <button
                    onClick={() => router.push("/")}
                    aria-label="Home"
                    className="p-1 text-black"
                >
                    <HomeIcon className="h-7 w-7" />
                </button>

                {/* NEW POST */}
                <button
                    onClick={() => setShowModal(true)}
                    aria-label="New Post"
                    className="p-1 text-black"
                >
                    <PlusCircleIcon className="h-8 w-8" />
                </button>

                {/* NOTIFICATIONS */}
                <button
                    onClick={() => router.push("/notifications")}
                    aria-label="Notifications"
                    className="p-1 text-black"
                >
                    <BellIcon className="h-7 w-7" />
                </button>

                {/* CLASSROOM */}
                <button
                    onClick={() => router.push("/classroom")}
                    aria-label="Classroom"
                    className="p-1 text-black"
                >
                    <AcademicCapIcon className="h-7 w-7" />
                </button>

            </div>
        </nav>
        {showModal && (
            <AddPostModal
                onClose={() => setShowModal(false)}
                onPost={() => {
                    setShowModal(false);
                    router.refresh();
                }}
            />
        )}
        </>
    );
};

export default BottomNav;
