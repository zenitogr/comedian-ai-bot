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
        setDisplayedText(text.slice(0, index + 1));
        index++;
        setTimeout(typeText, speed);
      }
    };

    typeText();
    return () => { isMounted = false; };
  }, [text, speed]);

  return (
    <div className="message-content prose prose-invert max-w-none">
      {enableMarkdown ? (
        <Markdown
          options={{
            overrides: {
              h1: { props: { className: 'text-2xl font-bold mb-4' } },
              h2: { props: { className: 'text-xl font-bold mb-3' } },
              h3: { props: { className: 'text-lg font-bold mb-2' } },
              p: { props: { className: 'mb-4 last:mb-0' } },
              ul: { props: { className: 'list-disc pl-4 mb-4' } },
              ol: { props: { className: 'list-decimal pl-4 mb-4' } },
              li: { props: { className: 'mb-1' } },
              code: { props: { className: 'bg-black/30 rounded px-1 py-0.5 font-mono text-sm' } },
              pre: { props: { className: 'bg-black/30 rounded p-3 mb-4 overflow-x-auto' } },
            }
          }}
        >
          {displayedText}
        </Markdown>
      ) : (
        <div>{displayedText}</div>
      )}
    </div>
  );
} 