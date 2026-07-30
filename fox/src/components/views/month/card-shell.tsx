import type { JournalNote } from "@/lib/journal";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/cn";

export function CardShell({
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
    <Link to="/entries/$id" params={{ id: note.href }} className={cn("focus-ring", hover, className)} style={style}>
      {children}
    </Link>
  );
}

const hover =
  "transition-transform duration-200 ease-out pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:rotate-0";
