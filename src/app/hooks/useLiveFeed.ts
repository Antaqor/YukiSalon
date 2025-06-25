"use client";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { LIVE_URL } from "../lib/config";

let socket: Socket | null = null;

export default function useLiveFeed(topic: string, addPost: (post: any) => void) {
  useEffect(() => {
    if (!socket) {
      socket = io(LIVE_URL);
    }
    socket.emit("join", topic);
    socket.on("new-post", addPost);
    return () => {
      socket?.off("new-post", addPost);
    };
  }, [topic, addPost]);
}
