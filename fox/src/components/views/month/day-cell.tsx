import type { CalendarCell } from "@/lib/date";
import type { JournalNote } from "@/lib/journal";
import type { Status } from "@/types";

import { Plus } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

import { cn } from "@/lib/cn";
import { getHash, getTilt } from "@/lib/journal";

import { StickyNote, StickyNoteSkeleton } from "./sticky-note";

const noteCells = new Set([2, 5, 10, 13, 15, 19, 23, 25, 34, 36, 40, 42]);

export function DayCell({
  cell,
  note,
  index,
  status
}: {
  index: number;
  cell: CalendarCell;
  note?: JournalNote;
  status?: Status;
}) {
  const auth = useAuth();
  const isMissed = !note && cell.inMonth && !cell.isFuture && auth.isAuthenticated;
  const isLoading = status === "pending";

  if (isLoading) {
    return (
      <div
        className={cn(
          "group/cell relative min-h-[var(--cal-cell-h)] border-b border-border px-2.5 pt-2 sm:px-3 sm:pt-2.5",
          !cell.inMonth && "bg-surface-raised/40",
          index % 7 === 0 ? "" : "border-r"
        )}
      >
        <DayNumber cell={cell} />
        {!cell.isFuture && noteCells.has(index) && (
          <StickyNoteSkeleton tilt={getTilt(getHash(cell.date.toISOString()))} />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group/cell relative min-h-[var(--cal-cell-h)] border-b border-border px-2.5 pt-2 sm:px-3 sm:pt-2.5",
        !cell.inMonth && "bg-surface-raised/40",
        index % 7 === 0 ? "" : "border-r"
      )}
      style={
        {
          "--card-bg-color": `color-mix(in srgb, ${note?.color} 1%, var(--color-card-canvas))`,
          "--shell-bg-color": `color-mix(in srgb, ${note?.color} 33%, var(--color-card-canvas))`,
          "--emoji-bg": `color-mix(in srgb, ${note?.color} 80%, var(--color-card-canvas))`,
          "--card-content-color": `color-mix(in srgb, ${note?.color} 30%, var(--color-ink-card))`,
          backgroundColor: "var(--shell-bg-color)"
        } as Record<string, string>
      }
    >
      <DayNumber cell={cell} />
      {isMissed && auth.writeUrl && <AddButton cell={cell} writeUrl={auth.writeUrl} />}
      {note && (
        <>
          <StickyNote note={note} />
          {note.image && <PhotoBadge image={note.image} tilt={-note.tilt * 1.4} />}
          {note.emoji && (
            <span
              className="absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-full text-[13px] papersheet-shadow"
              style={{ transform: `rotate(${-note.tilt}deg)`, backgroundColor: "var(--emoji-bg)" }}
            >
              {note.emoji}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function AddButton({ cell, writeUrl }: { cell: CalendarCell; writeUrl: string }) {
  return (
    <a
      href={`${writeUrl}?date=${cell.key}`}
      aria-label={`Add entry for ${cell.key}`}
      className="absolute inset-x-0 bottom-0 top-9 grid place-items-center opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover/cell:opacity-100 focus-visible:opacity-100"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-border-strong text-ink-faint transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent">
        <Plus size={16} strokeWidth={2} />
      </span>
    </a>
  );
}

function DayNumber({ cell }: { cell: CalendarCell }) {
  if (cell.isToday) {
    return (
      <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-accent text-[13px] font-semibold text-white tabular-nums">
        {cell.day}
      </span>
    );
  }
  return (
    <span className={cn("text-[15px] font-medium tabular-nums", cell.inMonth ? "text-ink" : "text-ink-faint/60")}>
      {cell.day}
    </span>
  );
}

function PhotoBadge({ image, tilt }: { image: string; tilt: number }) {
  return (
    <div
      className="pointer-events-none absolute top-6 right-1.5 z-20 w-24 max-h-[100px] rounded-[2px] bg-white p-1 pb-2 papersheet-shadow"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="aspect-square w-full overflow-hidden rounded-[1px] bg-black/5">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
