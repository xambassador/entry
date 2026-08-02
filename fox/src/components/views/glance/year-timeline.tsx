import { cn } from "@/lib/cn";
import { YEARS } from "@/lib/constant";

export function YearTimeline({ year, onSelect }: { year: number; onSelect: (year: number) => void }) {
  const years = [...YEARS].reverse();
  return (
    <div className="pointer-events-auto absolute right-3 top-1/2 z-[3000] -translate-y-1/2 sm:right-6">
      <div className="relative max-h-[68vh] overflow-y-auto py-2 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="pointer-events-none absolute right-[5px] top-2 bottom-2 w-px bg-border" />
        <div className="flex flex-col items-end">
          {years.map((y) => {
            const isActive = y === year;
            return (
              <button
                key={y}
                type="button"
                onClick={() => onSelect(y)}
                aria-current={isActive}
                className="group cursor-pointer relative flex items-center gap-2.5 py-1 focus-ring"
              >
                <span
                  className={cn(
                    "font-hand leading-none transition-all duration-200",
                    isActive ? "text-3xl text-accent" : "text-sm text-ink-faint group-hover:text-ink-muted"
                  )}
                >
                  {y}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full transition-all duration-200",
                    isActive ? "h-2.5 w-2.5 bg-accent" : "h-1.5 w-1.5 bg-border-strong group-hover:bg-ink-faint"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
