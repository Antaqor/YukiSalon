import Image from "next/image";
import Link from "next/link";

export interface Conversation {
  id: string;
  user: { id: string; name: string; avatar?: string; online?: boolean };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface ChatListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export default function ChatList({ conversations, activeId, onSelect }: ChatListProps) {
  return (
    <div className="h-full overflow-y-auto space-y-1 p-2">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`flex items-center w-full text-left gap-3 p-2 rounded hover:bg-gray-100 border-l-4 ${
            activeId === conv.id ? "border-brand bg-brand/10" : "border-transparent"
          }`}
        >
          <Link href={`/profile/${conv.user.id}`} target="_blank" className="shrink-0">
            <Image
              src={conv.user.avatar || "/img/default-avatar.png"}
              alt={conv.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="font-medium truncate">{conv.user.name}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(conv.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate max-w-[150px]">
                {conv.lastMessage}
              </span>
              {conv.unread > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full text-xs px-2">
                  {conv.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
