"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { BASE_URL } from "../lib/config";
import { useAuth } from "../context/AuthContext";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.accessToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Fetch notifications error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user?.accessToken]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please login to view notifications.</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {notifications.length === 0 && <p>No notifications.</p>}
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n._id} className="border p-2 rounded">
            {n.type === "like" && (
              <span>
                <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link>
                {" liked your "}
                <Link href={`/profile/${user._id}?post=${n.post?._id}`}>post</Link>.
              </span>
            )}
            {n.type === "comment" && (
              <span>
                <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link>
                {" commented on your "}
                <Link href={`/profile/${user._id}?post=${n.post?._id}`}>post</Link>.
              </span>
            )}
            {n.type === "reply" && (
              <span>
                <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link>
                {" replied on your "}
                <Link href={`/profile/${user._id}?post=${n.post?._id}`}>comment</Link>.
              </span>
            )}
            {n.type === "follow" && (
              <span>
                <Link href={`/profile/${n.sender?._id}`}>{n.sender?.username}</Link>
                {" started following you."}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
