import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { DiaryCover } from "@/components/diary-cover";

export const Route = createFileRoute("/entries")({
  component: RouteComponent
});

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function RouteComponent() {
  const month = new Date().getMonth();
  return (
    <DiaryCover className="max-h-full" shellProps={{ className: "py-5" }}>
      <div className="space-y-6 max-w-2xl mx-auto size-full">
        <div className="text-center pt-2">
          <h1 className="font-light text-ink text-2xl">Index</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-1.5 text-ink-muted hover:text-gilt transition-colors duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <h2 className="font-light tracking-wide text-ink">{MONTH_NAMES[month]}</h2>
            <button className="p-1.5 text-ink-muted hover:text-gilt transition-colors duration-200 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer">
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-ink-faint tracking-wider text-xs">10 entries</span>
          </div>
        </div>

        <div className="relative rounded-xl index-page">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg tracking-wide whitespace-nowrap text-gilt">Mar 1 - Mar 7</h3>
                <div className="h-px flex-1 bg-linear-to-r from-gilt/15 to-transparent" />
              </div>

              <div className="space-y-0">
                <Entry />
                <Entry />
                <Entry />
                <Entry />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DiaryCover>
  );
}

function Entry() {
  return (
    <div className="group cursor-pointer py-1.75 flex items-baseline gap-2 entry-row hover:bg-gilt-glow rounded px-1 transition-colors duration-150 relative">
      <span className="size-1.5 rounded-full shrink-0 relative -top-px transition-transform duration-200 group-hover:scale-150 bg-ink-faint opacity-[0.3]" />
      <span className="text-[15px] text-ink-secondary group-hover:text-ink transition-colors duration-200 whitespace-nowrap shrink-0">
        A walk in the autumn rain
      </span>
      <span className="flex-1 dot-leader min-w-5" />
      <span className="text-xs text-ink-faint tracking-wider shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-30 truncate">
        {["morning", "gratitude", "nature"].slice(0, 2).join(", ")}
      </span>
      <span className="w-2 dot-leader opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <span className="text-sm text-ink-muted group-hover:text-gilt transition-colors duration-200 shrink-0 tabular-nums">
        <span className="text-ink-faint text-sm mr-1">Sun</span>
        10
      </span>
    </div>
  );
}
