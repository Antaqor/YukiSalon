"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import { NotificationProvider } from "../context/NotificationContext";
import IconSidebar from "./IconSidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import SidebarControl from "./SidebarControl";
import NavigationLoader from "./NavigationLoader";
import LoadingOverlay from "./LoadingOverlay";
import Link from "next/link";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [mountLoading, setMountLoading] = useState(true);
  const pathname = usePathname();
  const isWidePage = pathname.startsWith("/dashboard") || pathname.startsWith("/classroom");

  useEffect(() => {
    const timer = setTimeout(() => setMountLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);


  return (
    <ThemeProvider>
      <CartProvider>
        <AuthProvider>
          <NotificationProvider>
          {mountLoading &&
            (pathname === "/" ||
              pathname.startsWith("/users") ||
              pathname.startsWith("/profile")) && <LoadingOverlay />}
          <NavigationLoader />
          <div className="max-w-7xl w-full mx-auto md:px-6">
            <SidebarControl />
            <Header />
            <main className="flex-grow flex flex-col md:flex-row gap-0 pt-16">
              <IconSidebar />
              <div className="flex-1 flex justify-center md:ml-16 px-3">
                <div
                  className={`w-full mx-auto ${isWidePage ? "md:max-w-7xl" : "md:max-w-2xl"} bg-[#212121] p-4`}
                >
                  {children}
                </div>
              </div>
              <aside
                id="right-sidebar"
                className="hidden md:block w-1/4 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto p-2 fade-in-up"
              ></aside>
            </main>
          </div>
          <BottomNav />
          </NotificationProvider>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

