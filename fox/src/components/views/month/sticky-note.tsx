import type { JournalNote } from "@/lib/journal";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/cn";

export function StickyNote({ note }: { note: JournalNote }) {
  const { title, excerpt, tilt } = note;
  return (
    <CardShell
      note={note}
      className="mt-1.5 min-h-25 block rounded-[3px] px-3 pt-2.5 pb-2 papersheet-shadow bg-[var(--card-bg-color)]"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <p className="text-[12px] font-semibold leading-snug line-clamp-1 text-[var(--card-content-color)]">{title}</p>
      <p className="mt-1 text-[11px] leading-snug line-clamp-2 text-[var(--card-content-color)]">{excerpt}</p>
    </CardShell>
  );
}

export function StickyNoteSkeleton({ tilt }: { tilt: number }) {
  return (
    <div
      className="mt-1.5 bg-gray-200/70 min-h-25 block rounded-[3px] px-3 pt-2.5 pb-2 shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
      style={{ transform: `rotate(${tilt}deg)` }}
    />
  );
}

function CardShell({
  note,
  className,
  style,
  children
}: {
  note: JournalNote;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (!note.href) {
    return (
      <div className={cn("cursor-default", className)} style={style} title={""}>
        {children}
      </div>
    );
  }

  return (
    <Link to="/entries/$id" params={{ id: note.href }} className={cn("focus-ring", className)} style={style}>
      {children}
    </Link>
  );
}
