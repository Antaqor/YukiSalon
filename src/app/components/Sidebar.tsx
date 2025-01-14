"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    ClipboardDocumentIcon,
    NewspaperIcon,
    WrenchScrewdriverIcon,
    CalendarDaysIcon,
    UsersIcon,
    ClockIcon,
    CubeIcon,
    DocumentIcon,
} from "@heroicons/react/24/outline";

function SidebarSkeleton() {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full" />
                <div className="animate-pulse h-5 w-20 bg-gray-200 rounded" />
            </div>
            {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                    <div className="animate-pulse w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="animate-pulse h-4 w-32 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    );
}

export default function Sidebar() {
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    const navItems = [
        { label: "Самбар", href: "/", Icon: HomeIcon },
        { label: "Захиалга", href: "/dashboard/orders", Icon: ClipboardDocumentIcon },
        { label: "Үйлчилгээ", href: "/dashboard/services", Icon: WrenchScrewdriverIcon },
        { label: "Ажилчид", href: "/dashboard/employees", Icon: UsersIcon },
        { label: "Цаг", href: "/dashboard/create-time-block", Icon: ClockIcon },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
                <SidebarSkeleton />
            </aside>
        );
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-wide text-gray-800">
                    Менежмент
                </h2>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ label, href, Icon }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={`flex items-center px-4 py-2 rounded-md transition-colors font-medium text-gray-700 ${
                                active
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
