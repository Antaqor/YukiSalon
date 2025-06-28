"use client";
import React from "react";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row min-h-screen bg-[#171717]">
      {/* Left sidebar */}
      <aside id="left" className="w-16 shrink-0 flex flex-col items-center">
        {/* icons */}
      </aside>
      {/* Center area */}
      <main id="center" className="flex-1 flex justify-center items-start">
        <div
          className="w-full max-w-full sm:max-w-full md:max-w-2xl px-2 sm:px-3 md:px-0 mx-auto"
        >
          {children}
        </div>
      </main>
      {/* Optional right sidebar */}
      <aside id="right" className="w-64 shrink-0 hidden lg:block" />

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 w-full flex justify-around bg-[#171717] md:hidden">
        {/* nav icons */}
      </nav>
    </div>
  );
}

/* Centering magic: the `mx-auto` on the container combines with `flex-1` on the main area to keep the content perfectly centered. Adjust `md:max-w-2xl` to tweak the desktop width. */

