"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { API_URL } from "../lib/config";
import { getSocket } from "./socket";

export interface ChatMessage {
  _id: string;
  room: string;
  text: string;
  createdAt: string;
  sender: { _id: string; username: string; profilePicture?: string };
}

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export default function useChat(room: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    setLoading(true);
    fetch(`${API_URL}/chat/${room}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(err => console.error("Fetch messages error", err))
      .finally(() => setLoading(false));
    fetch(`${API_URL}/chat/${room}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, [room]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join", room);
    const handler = (msg: ChatMessage) => {
      if (msg.room === room) {
        setMessages(m => [...m, msg]);
      }
    };
    socket.on("chat-message", handler);
    return () => {
      socket.off("chat-message", handler);
    };
  }, [room]);

  useEffect(() => {
    const socket = getSocket();
    const handleTyping = () => {
      setTyping(true);
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => setTyping(false), 2000);
    };
    socket.on("typing", handleTyping);
    return () => {
      socket.off("typing", handleTyping);
    };
  }, [room]);

  const sendMessage = async (text: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    try {
      const res = await fetch(`${API_URL}/chat/${room}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const msg: ChatMessage = await res.json();
      setMessages(m => [...m, msg]);
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  const startTyping = (sender: string) => {
    const socket = getSocket();
    socket.emit("typing", { room, sender });
  };

  return { messages, sendMessage, startTyping, typing, loading };
}
