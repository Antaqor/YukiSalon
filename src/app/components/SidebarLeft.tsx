"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SidebarLeft() {
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut({ redirect: false });
    };

    return (
        <aside
            className="
        hidden
        md:flex
        flex-col
        fixed
        top-16               /* below the fixed header (64px) */
        left-0
        w-64
        h-[calc(100vh-4rem)] /* full height minus header height */
        bg-white
        border-r
        border-gray-200
        shrink-0
        text-gray-800
        z-10
      "
        >
            {/* -- Profile Section -- */}
            <div className="p-4 border-b border-gray-200">
                {session?.user ? (
                    <div className="flex items-center space-x-2">
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="object-cover rounded-md"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-md" />
                        )}
                        <div className="flex flex-col">
              <span className="font-semibold">
                {session.user.username ?? "User"}
              </span>
                            <span className="text-xs text-gray-500">
                {session.user.email}
              </span>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-700 text-sm mb-2">
                            You are not signed in.
                        </p>
                        <Link href="/login" className="text-blue-600 text-sm hover:underline">
                            Sign in
                        </Link>
                    </div>
                )}
            </div>

            {/* -- Example Salons Section -- */}
            <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600">
                    Salons
                </h3>
                <ul className="space-y-1">
                    <li>
                        <Link
                            href="/salons/1"
                            className="
                block
                text-sm
                px-2
                py-2
                rounded
                hover:bg-gray-100
                transition-colors
              "
                        >
                            Salon #1
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/salons/2"
                            className="
                block
                text-sm
                px-2
                py-2
                rounded
                hover:bg-gray-100
                transition-colors
              "
                        >
                            Salon #2
                        </Link>
                    </li>
                    {/* Add as many as you want */}
                </ul>
            </div>

            {/* -- Logout Button (optional) -- */}
            {session?.user && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="
              w-full
              flex
              items-center
              justify-center
              space-x-2
              text-sm
              text-gray-600
              hover:text-gray-800
              px-3
              py-2
              bg-gray-100
              hover:bg-gray-200
              rounded
              focus:outline-none
              transition-colors
            "
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </aside>
    );
}
