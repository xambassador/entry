import { cn } from "@/lib/cn";

export function PaperSheet({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-[var(--card-bg-color)] text-ink papersheet-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}
