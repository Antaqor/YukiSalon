"use client";
import { useState } from "react";
import useChat from "../hooks/useChat";
import Image from "next/image";

export default function ChatPage() {
  const room = "general";
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";
  const { messages, sendMessage } = useChat(room);
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text, userId);
      setText("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2 flex items-start">
            {msg.sender?.profilePicture && (
              <Image
                src={msg.sender.profilePicture}
                alt=""
                width={32}
                height={32}
                className="rounded-full mr-2"
              />
            )}
            <div>
              <div className="font-semibold">{msg.sender?.username}</div>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border flex-1 p-2 mr-2 rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
