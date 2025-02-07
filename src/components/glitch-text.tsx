import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className }: GlitchTextProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <span className="relative inline-block">
        {text}
        <span className="absolute top-0 left-0 w-full h-full" data-text={text}>
          {text}
        </span>
        <span className="absolute top-0 left-0 w-full h-full" data-text={text}>
          {text}
        </span>
      </span>
    </div>
  );
} 