import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer";

interface TypingEffectProps {
  text: string;
  speed?: number;
}

export function TypingEffect({ text, speed = 30 }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const controls = useAnimationControls();

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        controls.start({ opacity: 1 });
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, controls]);

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={controls}
      className="whitespace-pre-wrap"
    >
      {displayedText}
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