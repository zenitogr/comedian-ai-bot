import { motion, AnimatePresence } from "framer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatListProps {
  chats: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function ChatList({ chats, activeChat, onSelectChat, onNewChat }: ChatListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-neon-blue hover:text-neon-pink transition-colors flex items-center gap-2"
      >
        <span className="text-lg">📚</span>
        Chats
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 bg-chat-bubble rounded-lg shadow-lg p-2 z-50"
          >
            <button
              onClick={() => {
                onNewChat();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-neon-pink hover:bg-chat-bubble/50 rounded-md transition-colors flex items-center gap-2"
            >
              <span>➕</span> New Chat
            </button>
            
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    chat.id === activeChat
                      ? "bg-neon-pink/20 text-neon-pink"
                      : "hover:bg-chat-bubble/50 text-foreground"
                  )}
                >
                  {chat.title || new Date(chat.createdAt).toLocaleDateString()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 