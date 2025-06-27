"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TbMenu2 } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../lib/config";

export default function Header() {
  const { loggedIn, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[#171717] shadow-sm z-50">
        <nav className="relative flex items-center justify-between h-12 max-w-7xl mx-auto px-4">
          <button
            className="md:hidden text-white"
            onClick={() => setDrawer(true)}
            aria-label="Menu"
          >
            <TbMenu2 size={24} />
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Home">
            <Image src="/logo.png" alt="Vone" width={90} height={24} className="h-6 w-auto" />
          </Link>
          <div className="ml-auto">
            {loggedIn && user ? (
              <div className="relative">
                <button onClick={() => setOpen((o) => !o)} className="focus:outline-none" aria-label="Account">
                  {user.profilePicture ? (
                    <Image
                      src={`${BASE_URL}${user.profilePicture}`}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500" />
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 bg-[#212121] text-white rounded shadow-sm py-1 w-40">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-[#30c9e8]/20" onClick={() => setOpen(false)}>
                      My Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 hover:bg-[#30c9e8]/20" onClick={() => setOpen(false)}>
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#30c9e8]/20"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-[#30c9e8]">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>
      {drawer && (
        <div
          className="fixed inset-0 bg-[#171717] text-white z-40 p-4"
          onClick={() => setDrawer(false)}
        >
          <button
            className="text-2xl ml-auto mb-4"
            onClick={() => setDrawer(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <nav className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <Link href="/" className="block" onClick={() => setDrawer(false)}>
              Home
            </Link>
            {loggedIn && (
              <Link href="/chat" className="block" onClick={() => setDrawer(false)}>
                Chat
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
