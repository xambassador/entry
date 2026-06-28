import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookX } from "lucide-react";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

export function NotFound() {
  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-surface-card text-ink-muted">
          <BookX className="size-5" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-medium text-ink tracking-wide">Page not found</h2>
          <p className="text-sm text-ink-muted leading-relaxed">This page doesn't exist in your journal.</p>
        </div>

        <Link
          to="/"
          search={{ year: CURRENT_YEAR, month: CURRENT_MONTH }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-border text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors duration-200"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          <span>Back to journal</span>
        </Link>
      </div>
    </div>
  );
}
