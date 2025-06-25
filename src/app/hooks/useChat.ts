"use client";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { CHAT_URL, API_URL } from "../lib/config";

export interface ChatMessage {
  _id: string;
  room: string;
  text: string;
  createdAt: string;
  sender: { _id: string; username: string; profilePicture?: string };
}

let socket: Socket | null = null;

export default function useChat(room: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`${API_URL}/chat/${room}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(err => console.error("Fetch messages error", err));
  }, [room]);

  useEffect(() => {
    if (!socket) {
      socket = io(CHAT_URL, { autoConnect: true });
    }

    socket.emit("join", room);
    const handler = (msg: ChatMessage) => {
      if (msg.room === room) {
        setMessages(m => [...m, msg]);
      }
    };
    socket.on("chat-message", handler);
    return () => {
      socket?.off("chat-message", handler);
    };
  }, [room]);

  const sendMessage = (text: string, sender: string) => {
    if (!socket) return;
    socket.emit("chat-message", { room, text, sender });
  };

  return { messages, sendMessage };
}
