import { cn } from "@/lib/cn";

export function PaperSheet({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-[var(--card-bg-color)] text-ink papersheet-shadow",
        className
      )}
    >
      <span aria-hidden className="paper-holes-left pointer-events-none absolute top-8 bottom-8 left-0 w-9" />
      {children}
    </div>
  );
}
