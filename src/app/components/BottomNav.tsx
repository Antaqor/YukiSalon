"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    HomeIcon,
    PlusCircleIcon,
    BellIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import AddPostModal from "./AddPostModal";
import { useNotifications } from "../context/NotificationContext";

const BottomNav: React.FC = () => {
    const router = useRouter();
    const [scrolledDown, setScrolledDown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { unreadCount } = useNotifications();

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
            className={`fixed bottom-0 left-0 w-full md:hidden transition-all border-t border-supportBorder shadow-lg bg-surface ${
                scrolledDown ? "" : ""
            }`}
        >
            <div
                className="flex justify-around items-center py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
            >
                {/* HOME */}
                <button
                    onClick={() => router.push("/")}
                    aria-label="Home"
                    className="p-1 text-black hover:text-brand"
                >
                    <HomeIcon className="h-7 w-7 icon-hover-brand" />
                </button>

                {/* NEW POST */}
                <button
                    onClick={() => setShowModal(true)}
                    aria-label="New Post"
                    className="p-1 text-black hover:text-brand"
                >
                    <PlusCircleIcon className="h-8 w-8 icon-hover-brand" />
                </button>

                {/* NOTIFICATIONS */}
                <button
                    onClick={() => router.push("/notifications")}
                    aria-label="Notifications"
                    className="relative p-1 text-black hover:text-brand"
                >
                    <BellIcon className="h-7 w-7 icon-hover-brand" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* CHAT */}
                <button
                    onClick={() => router.push("/chat")}
                    aria-label="Chat"
                    className="p-1 text-black hover:text-brand"
                >
                    <ChatBubbleLeftRightIcon className="h-7 w-7 icon-hover-brand" />
                </button>

                {/* CLASSROOM */}
                <button
                    onClick={() => router.push("/classroom")}
                    aria-label="Classroom"
                    className="p-1 text-black hover:text-brand"
                >
                    <AcademicCapIcon className="h-7 w-7 icon-hover-brand" />
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
