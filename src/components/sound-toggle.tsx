import { useState } from "react";
import { motion } from "framer-motion";
import { soundPlayer } from "@/lib/sounds";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  const handleToggle = () => {
    const isEnabled = soundPlayer.toggle();
    setEnabled(isEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 text-xs text-neon-blue hover:text-neon-pink transition-colors"
    >
      <motion.span
        animate={{ opacity: enabled ? 1 : 0.5 }}
        className="text-lg"
      >
        {enabled ? "🔊" : "🔇"}
      </motion.span>
      Sound {enabled ? "On" : "Off"}
    </button>
  );
} 