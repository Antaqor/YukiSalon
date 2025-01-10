"use client";

import { useState, useEffect } from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Order {
    id: number;
    title: string;
}

export default function SidebarRightd() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Example static orders
        setOrders([
            { id: 1, title: "Order #1001" },
            { id: 2, title: "Order #1002" },
            { id: 3, title: "Order #1003" },
        ]);
    }, []);

    return (
        <aside
            className="
        hidden
        lg:flex
        flex-col
        fixed
        top-16               /* below the fixed header (64px) */
        right-0
        w-64
        h-[calc(100vh-4rem)]
        bg-white
        border-l
        border-gray-200
        shrink-0
        text-gray-800
        z-10
      "
        >
            {/* Orders List in Right Sidebar */}
            <div className="p-4 overflow-y-auto flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    Your Orders
                </h2>
                <ul className="space-y-1">
                    {orders.map((order) => (
                        <li key={order.id}>
                            <Link
                                href={`/orders/${order.id}`}
                                className="
                  flex
                  items-center
                  text-sm
                  px-2
                  py-2
                  rounded
                  hover:bg-gray-100
                  transition-colors
                "
                            >
                                <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-gray-400" />
                                <span>{order.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
