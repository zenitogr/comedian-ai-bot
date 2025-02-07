import { cn } from "@/lib/utils";

export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full bg-neon-blue animate-pulse",
            "animation-delay-[var(--delay)]"
          )}
          style={{ '--delay': `${i * 150}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
} 