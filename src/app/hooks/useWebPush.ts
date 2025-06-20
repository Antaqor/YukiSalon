"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for Web-Push notifications.
 * Handles permission prompts (once per session) and service-worker registration.
 */
const FLAG = "webpush_permission_requested";

async function askPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  // Permission already granted.
  if (Notification.permission === "granted") return true;

  // We already asked this session – don’t nag again.
  if (sessionStorage.getItem(FLAG)) return Notification.permission === "granted";

  // Ask now, record that we’ve asked.
  sessionStorage.setItem(FLAG, "1");
  const res = await Notification.requestPermission();
  return res === "granted";
}

export default function useWebPush() {
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const granted = await askPermission();
    if (!granted) return;

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      if (reg) setSubscribed(true);
    } catch (e) {
      console.error("Service worker registration failed", e);
    }
  };

  // On mount, auto-detect existing subscription/permission.
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration("/sw.js").then((reg) => {
        if (reg) setSubscribed(true);
      });
    }
  }, []);

  return { subscribed, subscribe };
}