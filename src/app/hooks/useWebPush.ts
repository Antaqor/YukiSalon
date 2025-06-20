'use client';

import { useState, useEffect } from 'react';

const FLAG = 'webpush_permission_requested';

async function askPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (sessionStorage.getItem(FLAG)) return Notification.permission === 'granted';
  sessionStorage.setItem(FLAG, '1');
  const res = await Notification.requestPermission();
  return res === 'granted';
}

export default function useWebPush() {
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return;
    const granted = await askPermission();
    if (!granted) return;
    try {
      await navigator.serviceWorker.register('/sw.js');
      setSubscribed(true);
    } catch (e) {
      console.error('Service worker registration failed', e);
    }
  };

  useEffect(() => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration('/sw.js').then((reg) => {
        if (reg) setSubscribed(true);
      });
    }
  }, []);

  return { subscribed, subscribe };
}
