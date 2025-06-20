'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../lib/config';

interface NotificationState {
  unreadCount: number;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationState>({
  unreadCount: 0,
  refresh: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const prev = useRef(0);

  const fetchUnread = async () => {
    if (!user?.accessToken) {
      setUnreadCount(0);
      prev.current = 0;
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const count = res.data.count ?? 0;
      if (
        count > prev.current &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification('New notification', {
          body: `You have ${count} unread notifications`,
        });
      }
      prev.current = count;
      setUnreadCount(count);
    } catch (err) {
      console.error('Unread count error:', err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user?.accessToken]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh: fetchUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

