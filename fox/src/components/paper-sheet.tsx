import type { NoteColor } from "@/lib/journal";

import { cn } from "@/lib/cn";

export function PaperSheet({
  color,
  className,
  children
}: {
  color?: NoteColor;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface text-ink shadow-[0_24px_60px_-18px_rgba(0,0,0,0.4)]",
        className
      )}
      style={color ? { backgroundColor: color.bg, color: color.ink } : undefined}
    >
      <span aria-hidden className="paper-holes-left pointer-events-none absolute top-8 bottom-8 left-0 w-9" />
      {children}
    </div>
  );
}
