import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Quote } from "@/components/quote";
import { Tags } from "@/components/views/editor/tags";

export const tags = <Tags />;

export const backToEntries = (
  <Link
    to="/entries"
    className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors duration-200 cursor-pointer group"
  >
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm font-body">Back to entries</span>
  </Link>
);

export const diaryEdgeTop = <div className="open-diary-edge-top" />;

export const diaryEdgeBottom = <div className="open-diary-edge-bottom" />;

export const ornament = <p className="open-diary-ornament text-sm">&#x2022; &#x2022; &#x2022;</p>;

export const pageOneText = <span className="text-ink-faint text-sm">page 1</span>;

export const diaryFold = (
  <div className="open-diary-fold relative w-px shrink-0 bg-diary-fold z-5 max-[900px]:hidden pointer-events-none" />
);

export const glitDimBorder = <div className="w-16 mb-6 h-px bg-gilt-dim" />;

export const diaryCurl = <div className="open-diary-curl" />;

export const pageTwoText = (
  <div className="absolute bottom-4 right-0 left-0 flex justify-center z-3">
    <span className="text-ink-faint text-sm">page 2</span>
  </div>
);

export const moodText = <p className="text-[12px] tracking-widest uppercase mb-3 text-ink-faint">Mood</p>;

export const quote = <Quote />;
