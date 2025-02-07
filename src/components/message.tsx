import { cn } from "@/lib/utils";
import { LoadingDots } from "./loading-dots";
import { motion, AnimatePresence } from "framer";
import { useInView } from "framer";
import { useRef, useContext, useEffect, useState } from "react";
import { TypingEffect } from "./typing-effect";
import { ASCII_ART } from "@/lib/ascii-art";
import { PersonaContext } from "@/lib/persona-context";

interface MessageProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
  isLoading?: boolean;
}

export function Message({ role, content, isLoading }: MessageProps) {
  const [isClient, setIsClient] = useState(false);
  const ref = useRef(null);
  const { currentPersona } = useContext(PersonaContext);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (role === "system") return null;

  console.log('Rendering message:', { role, content, isLoading });

  // Return a simpler version during server-side rendering
  if (!isClient) {
    return (
      <div className={cn(
        "flex w-full items-start gap-4 px-4",
        role === "assistant" && "flex-row-reverse"
      )}>
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
          role === "user" 
            ? "border-neon-pink text-neon-pink shadow-neon" 
            : "border-neon-blue text-neon-blue"
        )}>
          {role === "user" ? "U" : "AI"}
        </div>
        <div className={cn(
          "flex-1 rounded-lg px-4 py-2 text-sm whitespace-pre-wrap",
          role === "user"
            ? "bg-chat-bubble text-foreground"
            : "bg-chat-bubble/50 text-foreground"
        )}>
          {content || (isLoading ? <LoadingDots /> : '')}
        </div>
      </div>
    );
  }

  const formattedContent = role === "assistant" && content.startsWith("SYSTEM:") 
    ? `${ASCII_ART[currentPersona].divider}\n${content.replace("SYSTEM:", "")}`
    : content;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 px-4",
        role === "assistant" && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
          role === "user" 
            ? "border-neon-pink text-neon-pink shadow-neon" 
            : "border-neon-blue text-neon-blue"
        )}
      >
        {role === "user" ? "U" : "AI"}
      </div>
      <div
        className={cn(
          "flex-1 rounded-lg px-4 py-2 text-sm message-content",
          role === "user"
            ? "bg-chat-bubble text-foreground"
            : "bg-chat-bubble/50 text-foreground"
        )}
      >
        {isLoading ? (
          <LoadingDots />
        ) : role === "assistant" ? (
          <TypingEffect text={formattedContent} />
        ) : (
          <span className="whitespace-pre-wrap">
            {formattedContent}
          </span>
        )}
      </div>
    </div>
  );
} 