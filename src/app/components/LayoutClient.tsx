"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import { NotificationProvider, useNotifications } from "../context/NotificationContext";
import { BellIcon } from "@heroicons/react/24/outline";
import Header from "./Header";
import TopActiveMembers from "./TopActiveMembers";
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
        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brandCyan focus:ring-2 focus:ring-brandCyan"
      >
        <BellIcon className="w-6 h-6 group-hover:text-brandCyan" />
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
                        className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brandCyan focus:ring-2 focus:ring-brandCyan"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 group-hover:text-brandCyan"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span>Нүүр</span>
                      </Link>
                    </li>
                  <li>
                    <Link
                      href="/users"
                      className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brandCyan focus:ring-2 focus:ring-brandCyan"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 group-hover:text-brandCyan"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Гишүүд</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/classroom"
                      className="group flex items-center gap-2 p-4 pl-0 text-xl font-semibold text-gray-700 transition-smooth focus:outline-none hover:text-brandCyan focus:ring-2 focus:ring-brandCyan"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 group-hover:text-brandCyan"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                      </svg>
                  <span>Classroom</span>
                    </Link>
                  </li>
                  <NotificationNavItem />
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
              >
                <div className="space-y-6">
                  <TopActiveMembers />
                </div>
              </aside>
            </main>
          </div>
          <BottomNav />
          </NotificationProvider>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

