"use client";
import { usePathname } from "next/navigation";
import LoadingOverlay from "./components/LoadingOverlay";

export default function GlobalLoading() {
  const pathname = usePathname();
  const show =
    pathname === "/" ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/profile");
  return show ? <LoadingOverlay /> : null;
}
