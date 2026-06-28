import { ArrowLeft } from "lucide-react";

export const backToEntries = (
  <a
    href="/entries"
    className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer group"
  >
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm">Back to entries</span>
  </a>
);
