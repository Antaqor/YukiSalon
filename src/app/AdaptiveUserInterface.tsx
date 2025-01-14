"use client";

import React, { useEffect, useState } from "react";
import ClientWrapper from "./components/ClientWrapper";
import Header from "./components/Header";
import SidebarLeft from "./components/SidebarLeft";
import SidebarRight from "./components/SidebarRight";
import BottomNav from "./components/BottomNav";

const MOBILE_BREAKPOINT = 768;

interface AdaptiveUserInterfaceProps {
    children: React.ReactNode;
}

export default function AdaptiveUserInterface({ children }: AdaptiveUserInterfaceProps) {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const updateIsMobile = () => {
            setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        };
        updateIsMobile(); // initial check on mount

        window.addEventListener("resize", updateIsMobile);
        return () => window.removeEventListener("resize", updateIsMobile);
    }, []);

    // Show a loader until we know the screen size
    if (isMobile === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <p className="text-xl text-gray-700">Loading...</p>
            </div>
        );
    }

    return (
        <ClientWrapper>
            {isMobile ? (
                /* ---------------- MOBILE LAYOUT ---------------- */
                <section>
                    <Header />
                    <main className="w-full flex-grow">{children}</main>
                    <BottomNav />
                </section>
            ) : (
                /* --------------- DESKTOP / TABLET LAYOUT --------------- */
                <section>
                    <Header />
                    <SidebarLeft />
                    <SidebarRight />
                    <main className="pt-16 md:ml-64 md:mr-64 min-h-screen">{children}</main>
                </section>
            )}
        </ClientWrapper>
    );
}
