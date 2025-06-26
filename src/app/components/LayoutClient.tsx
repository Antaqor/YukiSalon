"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import { NotificationProvider, useNotifications } from "../context/NotificationContext";
import {
  BellIcon,
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Header from "./Header";
import BottomNav from "./BottomNav";
import SidebarControl from "./SidebarControl";
import NavigationLoader from "./NavigationLoader";
import LoadingOverlay from "./LoadingOverlay";
import Link from "next/link";

function NotificationNavItem() {
  const { unreadCount } = useNotifications();
  return (
    <li>
      <Link
        href="/notifications"
        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brand focus:ring-2 focus:ring-brand"
      >
        <BellIcon className="w-6 h-6 group-hover:text-brand" />
        <span className="flex items-center">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

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
              <aside
                id="left-sidebar"
                className="hidden md:block w-full md:w-1/4 border-r border-supportBorder sticky top-16 h-[calc(100vh-80px)] overflow-y-auto fade-in-up"
              >
                <nav>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/"
                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brand focus:ring-2 focus:ring-brand"
                      >
                        <HomeIcon className="w-6 h-6 group-hover:text-brand" />
                        <span>Нүүр</span>
                      </Link>
                    </li>
                  <li>
                    <Link
                      href="/users"
                      className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brand focus:ring-2 focus:ring-brand"
                    >
                      <UserGroupIcon className="w-6 h-6 group-hover:text-brand" />
                      <span>Гишүүд</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/classroom"
                      className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brand focus:ring-2 focus:ring-brand"
                    >
                      <AcademicCapIcon className="w-6 h-6 group-hover:text-brand" />
                  <span>Хичээл</span>
                    </Link>
                  </li>
                  <NotificationNavItem />
                  <li>
                    <Link
                      href="/chat"
                      className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brand focus:ring-2 focus:ring-brand"
                    >
                      <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:text-brand" />
                      <span>Чат</span>
                    </Link>
                  </li>
                  </ul>
                </nav>
              </aside>
              <div
                className={`w-full ${isWidePage ? "md:w-full" : "md:w-1/2 md:border-r md:border-supportBorder"}`}
              >
                <div className="space-y-6">{children}</div>
              </div>
              <aside
                id="right-sidebar"
                className="hidden md:block w-full md:w-1/4 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto p-2 fade-in-up"
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

