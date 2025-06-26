"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TbHome,
  TbBell,
  TbMessageCircle,
  TbBook2,
} from "react-icons/tb";
import { useNotifications } from "../context/NotificationContext";

const BottomNav: React.FC = () => {
    const router = useRouter();
    const [scrolledDown, setScrolledDown] = useState(false);
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
            className={`fixed bottom-0 left-0 w-full md:hidden transition-all border-t border-supportBorder bg-[#171717] text-white ${
                scrolledDown ? "" : ""
            }`}
        >
            <div
                className="flex justify-around items-center py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
            >
                <button
                    onClick={() => router.push("/")}
                    aria-label="Home"
                    className="p-1 text-white/60 hover:text-[#30c9e8]"
                >
                    <TbHome size={24} />
                </button>

                <button
                    onClick={() => router.push("/notifications")}
                    aria-label="Notifications"
                    className="relative p-1 text-white/60 hover:text-[#30c9e8]"
                >
                    <TbBell size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => router.push("/chat")}
                    aria-label="Chat"
                    className="p-1 text-white/60 hover:text-[#30c9e8]"
                >
                    <TbMessageCircle size={24} />
                </button>

                <button
                    onClick={() => router.push("/classroom")}
                    aria-label="Classroom"
                    className="p-1 text-white/60 hover:text-[#30c9e8]"
                >
                    <TbBook2 size={24} />
                </button>

            </div>
        </nav>
        </>
    );
};

export default BottomNav;
