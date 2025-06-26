"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatList, { Conversation } from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../lib/config";

export default function ChatPage() {
  const { loggedIn, user } = useAuth();
  const params = useSearchParams();
  const targetUser = params.get("user");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // load chat list
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token") || "";
    fetch(`${API_URL}/chat`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((chats) => {
        const convs: Conversation[] = chats.map((c: any) => {
          const other = c.participants.find((p: any) => p._id !== user._id);
          return {
            id: c._id,
            user: { id: other._id, name: other.username, avatar: other.profilePicture },
            lastMessage: c.lastMessage || "",
            timestamp: c.lastMessageAt || c.updatedAt,
            unread: 0,
          };
        });
        setConversations(convs);
      })
      .catch(err => console.error("Chat list", err));
  }, [user]);

  // if ?user= param provided create/get chat
  useEffect(() => {
    if (!targetUser || !user) return;
    const token = localStorage.getItem("token") || "";
    fetch(`${API_URL}/chat/with/${targetUser}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((chat) => {
        const other = chat.participants.find((p: any) => p._id !== user._id);
        const conv: Conversation = {
          id: chat._id,
          user: { id: other._id, name: other.username, avatar: other.profilePicture },
          lastMessage: chat.lastMessage || "",
          timestamp: chat.lastMessageAt || chat.updatedAt,
          unread: 0,
        };
        setActive(chat._id);
        setConversations((prev) => {
          const exists = prev.find(c => c.id === chat._id);
          return exists ? prev : [conv, ...prev];
        });
      })
      .catch(err => console.error("Chat open", err));
  }, [targetUser, user]);

  const activeConv = conversations.find(c => c.id === active);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="hidden md:block w-1/3 border-r border-supportBorder">
        <h2 className="p-3 font-semibold">Мессеж</h2>
        <ChatList conversations={conversations} activeId={active || undefined} onSelect={setActive} />
      </aside>
      <div className="flex-1 relative">
        <div className="md:hidden border-b border-supportBorder p-3 font-semibold">Мессеж</div>
        {activeConv && (
          <ChatWindow chatId={activeConv.id} user={activeConv.user} onBack={() => setActive(null)} />
        )}
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
