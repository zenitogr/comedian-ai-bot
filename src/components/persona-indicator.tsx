import { motion, AnimatePresence } from "framer";
import { PersonaKey } from "@/lib/personas";

const PERSONA_COLORS = {
  default: "text-neon-pink",
  netrunner: "text-neon-blue",
  corporate: "text-neon-purple",
  street: "text-[#ff9100]"
} as const;

const PERSONA_ICONS = {
  default: "🤖",
  netrunner: "👾",
  corporate: "🏢",
  street: "🌆"
} as const;

interface PersonaIndicatorProps {
  persona: PersonaKey;
}

export function PersonaIndicator({ persona }: PersonaIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={persona}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`flex items-center gap-2 text-sm ${PERSONA_COLORS[persona]}`}
      >
        <span className="text-lg">{PERSONA_ICONS[persona]}</span>
        <span className="capitalize">{persona} Mode</span>
      </motion.div>
    </AnimatePresence>
  );
} 