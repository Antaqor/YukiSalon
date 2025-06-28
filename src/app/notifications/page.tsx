"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { BASE_URL } from "../lib/config";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

interface Notification {
  _id: string;
  type: "like" | "comment" | "reply" | "follow";
  post?: { _id: string };
  sender?: { _id: string; username: string; profilePicture?: string };
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get<Notification[]>(
          `${BASE_URL}/api/notifications`,
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        setNotifications(data);

        // Mark unread notifications as read in parallel
        await Promise.all(
          data
            .filter((n) => !n.read)
            .map((n) =>
              axios.post(
                `${BASE_URL}/api/notifications/${n._id}/read`,
                {},
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
              )
            )
        );

        // Refresh global unread badge/indicator
        await refresh();
      } catch (err) {
        console.error("Fetch notifications error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.accessToken, refresh]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please login to view notifications.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-2 rounded ${n.read ? "" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {n.type === "like" && (
                <span>
                  <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link> liked your {" "}
                  <Link href={`/profile/${user._id}?post=${n.post?._id}`}>post</Link>.
                </span>
              )}
              {n.type === "comment" && (
                <span>
                  <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link> commented on your {" "}
                  <Link href={`/profile/${user._id}?post=${n.post?._id}`}>post</Link>.
                </span>
              )}
              {n.type === "reply" && (
                <span>
                  <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link> replied to your {" "}
                  <Link href={`/profile/${user._id}?post=${n.post?._id}`}>comment</Link>.
                </span>
              )}
              {n.type === "follow" && (
                <span>
                  <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link> started following you.
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
