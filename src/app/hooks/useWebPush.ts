"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../lib/config";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook for Web-Push notifications.
 * Handles permission prompts (once per session) and service-worker registration.
 */
const FLAG = "webpush_permission_requested";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function askPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  // Permission already granted.
  if (Notification.permission === "granted") return true;

  // We already asked this session – don’t nag again.
  if (sessionStorage.getItem(FLAG)) return false;

  // Ask now, record that we’ve asked.
  sessionStorage.setItem(FLAG, "1");
  const res = await Notification.requestPermission();
  return res === "granted";
}

export default function useWebPush() {
  const [subscribed, setSubscribed] = useState(false);
  const { user } = useAuth();

  const subscribe = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const granted = await askPermission();
    if (!granted) return;

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const { data } = await axios.get(`${API_URL}/push/public-key`);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
      if (user?.accessToken) {
        await axios.post(`${API_URL}/push/subscribe`, sub, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
      }
      setSubscribed(true);
    } catch (e) {
      console.error("Service worker registration failed", e);
    }
  };

  // On mount, auto-detect existing subscription/permission.
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration("/sw.js").then(async (reg) => {
        const sub = await reg?.pushManager.getSubscription();
        if (sub) setSubscribed(true);
      });
    }
  }, []);

  return { subscribed, subscribe };
}