// app/components/MinimalTabs.tsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MinimalTabs() {
    const pathname = usePathname();
    const navItems = [
        { label: "Orders", href: "/dashboard/orders" },
        { label: "Services", href: "/dashboard/services" },
        { label: "Schedule", href: "/dashboard/schedule" },
        { label: "Employees", href: "/dashboard/employees" },
    ];

    return (
        <div className="md:hidden w-full px-4 py-4">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
                {navItems.map(({ label, href }) => {
                    const isActive = pathname?.startsWith(href);
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-semibold ${
                                isActive
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}