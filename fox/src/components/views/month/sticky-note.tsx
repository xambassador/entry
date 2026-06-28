import type { JournalNote } from "@/lib/journal";

import { CardShell } from "./card-shell";

export function StickyNote({ note }: { note: JournalNote }) {
  const { title, excerpt, color, tilt } = note;
  return (
    <CardShell
      note={note}
      className="mt-1.5 min-h-25 block rounded-[3px] px-3 pt-2.5 pb-2 shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: color.bg, transform: `rotate(${tilt}deg)` }}
    >
      <p className="text-[12px] font-semibold leading-snug line-clamp-1" style={{ color: color.ink }}>
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-snug line-clamp-2" style={{ color: color.ink }}>
        {excerpt}
      </p>
    </CardShell>
  );
}
