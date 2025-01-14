"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Header() {
    const { data: session } = useSession();
    const router = useRouter();

    async function handleLogout() {
        await signOut({ redirect: false });
        router.push("/login");
    }

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white drop-shadow-sm">
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo / Branding */}
                <Link
                    href="/"
                    className="flex items-center space-x-2 group transition hover:opacity-90"
                >
                    {/* Square-ish logo block */}
                    <div className="h-8 w-8 flex items-center justify-center bg-indigo-600 text-white font-bold rounded-md group-hover:bg-indigo-700 transition">
                        <span className="text-xs">V</span>
                    </div>
                    <span className="text-gray-800 text-base font-semibold tracking-wide">
            Vami
          </span>
                </Link>

                {/* Desktop User Section */}
                <div className="hidden md:flex items-center space-x-4">
                    {session?.user ? (
                        <div className="flex items-center space-x-3">
                            <AvatarFallback username={session.user.username} />
                            <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-gray-800">
                  {session.user.username ?? "Хэрэглэгч"}
                </span>
                                <span className="text-xs text-gray-500">
                  {session.user.email ?? "name@mail.com"}
                </span>
                            </div>
                            <button
                                onClick={() => void handleLogout()}
                                className="px-4 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                            >
                                Гарах
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
                        >
                            Нэвтрэх
                        </Link>
                    )}
                </div>

                {/* Mobile Menu */}
                <MobileMenu onLogout={handleLogout} />
            </nav>
        </header>
    );
}

function AvatarFallback({ username }: { username: string | undefined }) {
    const letter = username?.[0]?.toUpperCase() || "U";

    return (
        <div className="relative h-9 w-9 bg-gray-300 flex items-center justify-center rounded-full text-gray-700 text-sm font-semibold overflow-hidden">
            <Image
                src="data:image/gif;base64,R0lGODlhAQABAAAAACw="
                alt="Avatar"
                fill
                className="object-cover"
                style={{ opacity: 0 }}
            />
            <span className="absolute">{letter}</span>
        </div>
    );
}

function MobileMenu({ onLogout }: { onLogout: () => Promise<void> }) {
    const { data: session } = useSession();
    const [open, setOpen] = React.useState(false);

    const handleClose = () => setOpen(false);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setOpen(!open)}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
                {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
            {open && (
                <div className="absolute top-16 right-4 w-56 bg-white border border-gray-200 shadow-lg p-4 rounded-md">
                    {session?.user ? (
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-2">
                                <AvatarFallback username={session.user.username} />
                                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-gray-800">
                    {session.user.username ?? "Хэрэглэгч"}
                  </span>
                                    <span className="text-xs text-gray-500">
                    {session.user.email ?? "name@mail.com"}
                  </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    handleClose();
                                    void onLogout();
                                }}
                                className="text-left text-sm text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 focus:outline-none"
                            >
                                Гарах
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={handleClose}
                            className="block px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition text-center"
                        >
                            Нэвтрэх
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
