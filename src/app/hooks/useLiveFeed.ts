"use client";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

// Determine the Socket.IO server URL.
// Fallback to localhost in development if no env variable is provided.
const LIVE_URL =
  process.env.NEXT_PUBLIC_LIVE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin.replace(/3000$/, "5002")
    : "http://localhost:5002");

let socket: Socket | null = null;

export default function useLiveFeed(topic: string, addPost: (post: any) => void) {
  useEffect(() => {
    if (!socket) {
      socket = io(LIVE_URL, { autoConnect: true });

      socket.on("connect_error", () => {
        setTimeout(() => socket?.connect(), 2000);
      });
    }

    socket.emit("join", topic);
    socket.on("new-post", addPost);

    return () => {
      socket?.off("new-post", addPost);
    };
  }, [topic, addPost]);
}
