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


export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [mountLoading, setMountLoading] = useState(true);
  const pathname = usePathname();

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
          <SidebarControl />
          <Header />
          <aside id="left" className="hidden sm:flex w-16 shrink-0 flex-col items-center bg-[#1a1a1a]">
            <IconSidebar />
          </aside>
          <main id="center" className="flex-1 flex justify-center items-start bg-[#171717] pt-16">
            <div className="w-full max-w-full sm:max-w-full md:max-w-2xl mx-auto px-2 md:px-0">
              {children}
            </div>
          </main>
          <aside id="right" className="hidden lg:flex w-16 shrink-0 flex-col items-center bg-[#1a1a1a]" />
          <BottomNav />
          </NotificationProvider>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

