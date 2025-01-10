"use client";

import Link from "next/link";

export default function Header() {
    return (
        <header
            className="
        fixed
        top-0
        left-0
        z-20
        w-full
        h-16
        bg-white
        border-b
        border-gray-200
        flex
        items-center
        justify-center
      "
        >
            <Link href="/">
        <span className="text-xl font-bold text-blue-600 cursor-pointer">
          Foru
        </span>
            </Link>
        </header>
    );
}
