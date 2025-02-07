import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import Markdown from 'markdown-to-jsx';

interface TypingEffectProps {
  text: string;
  speed?: number;
  enableMarkdown?: boolean;
}

export function TypingEffect({ text, speed = 10, enableMarkdown = false }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const controls = useAnimationControls();

  useEffect(() => {
    setDisplayedText("");
    let isMounted = true;
    let index = 0;

    const typeText = () => {
      if (!isMounted) return;

      if (index < text.length) {
        // Look ahead for markdown sequences
        let charsToAdd = 1;
        
        // Check for markdown patterns at current position
        const markdownPatterns = [
          /^\*\*(.+?)\*\*/,  // Bold
          /^\*(.+?)\*/,      // Italic
          /^_(.+?)_/,        // Underscore italic
          /^`(.+?)`/,        // Code
        ];

        if (enableMarkdown) {
          const remainingText = text.slice(index);
          for (const pattern of markdownPatterns) {
            const match = remainingText.match(pattern);
            if (match) {
              charsToAdd = match[0].length;
              break;
            }
          }
        }

        const nextChunk = text.slice(index, index + charsToAdd);
        setDisplayedText(prev => prev + nextChunk);
        index += charsToAdd;
        
        setTimeout(typeText, speed);
      } else {
        controls.start({ opacity: 1 });
      }
    };

    // Start typing immediately
    typeText();

    return () => {
      isMounted = false;
    };
  }, [text, speed, controls, enableMarkdown]);

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={controls}
      className="whitespace-pre-wrap"
    >
      {enableMarkdown ? (
        <Markdown
          options={{
            forceBlock: false,
            overrides: {
              strong: {
                component: "span",
                props: {
                  className: "font-bold text-neon-pink",
                },
              },
              em: {
                component: "span",
                props: {
                  className: "italic text-neon-blue",
                },
              },
              code: {
                component: "code",
                props: {
                  className: "bg-chat-bubble/50 px-1 py-0.5 rounded font-mono text-neon-purple",
                },
              },
            },
          }}
        >
          {displayedText}
        </Markdown>
      ) : (
        displayedText
      )}
      {displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="ml-1 inline-block w-2 h-4 bg-neon-blue"
        />
      )}
    </motion.div>
  );
} 