import { Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

export function Nav() {
  return (
    <header className="header">
      <nav className="nav">
        <Link
          to="/"
          className="logo focus-ring"
          search={(prev) => ({ year: prev.year ?? CURRENT_YEAR, month: prev.month ?? CURRENT_MONTH })}
        >
          <span className="text-lg font-semibold tracking-tight text-ink">Entry</span>
        </Link>

        <div className="flex items-center gap-1">
          <a
            href="/write"
            className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-md text-sm font-medium bg-accent text-canvas hover:brightness-110 active:scale-[0.96] transition-all duration-150 ease-active cursor-pointer focus-ring"
          >
            <PenLine size={13} strokeWidth={2} />
            New
          </a>
        </div>
      </nav>
    </header>
  );
}
