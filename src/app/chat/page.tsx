"use client";
import { useState } from "react";
import ChatList, { Conversation } from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";

const demoConversations: Conversation[] = [
  {
    id: "u1",
    user: { id: "u1", name: "John Doe", avatar: "/img/default-avatar.png", online: true },
    lastMessage: "Hey there!",
    timestamp: new Date().toISOString(),
    unread: 2,
  },
  {
    id: "u2",
    user: { id: "u2", name: "Jane", avatar: "/img/default-avatar.png", online: false },
    lastMessage: "Let's meet tomorrow at the cafe to discuss the project details.",
    timestamp: new Date().toISOString(),
    unread: 0,
  },
];

export default function ChatPage() {
  const { loggedIn } = useAuth();
  const [active, setActive] = useState<string | null>(demoConversations[0].id);

  const activeConv = demoConversations.find((c) => c.id === active)!;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="hidden md:block w-1/3 border-r border-supportBorder">
        <h2 className="p-3 font-semibold">Мессеж</h2>
        <ChatList conversations={demoConversations} activeId={active || undefined} onSelect={setActive} />
      </aside>
      <div className="flex-1 relative">
        <div className="md:hidden border-b border-supportBorder p-3 font-semibold">Мессеж</div>
        <ChatWindow chatId={activeConv.id} user={activeConv.user} onBack={() => setActive(null)} />
        {loggedIn && (
          <button
            className="fixed bottom-4 right-4 bg-brand text-white w-12 h-12 rounded-full shadow-lg"
            aria-label="New Message"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
