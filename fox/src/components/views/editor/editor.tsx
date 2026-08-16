import type { GetEntryResponse } from "@/types";

import { useState } from "react";
import clsx from "clsx";
import { Eye, PencilLine } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { Tags } from "@/components/views/editor/tags";

import { mdComponents } from "@/lib/markdown";

import { EntryDate } from "./date-header";
import { CharCount, WordCount } from "./footer";
import { ContentInput, TitleInput } from "./form-elements";
import { useContent } from "./store";

import "./editor.css";

import { ColorPicker } from "./color-picker";

type Props = {
  entry?: GetEntryResponse;
  children?: React.ReactNode;
  moodPickerSlot?: React.ReactNode;
  isAuthenticated?: boolean;
  color?: string;
  defaultDate?: string;
};

export function Editor(props: Props) {
  const { entry, children, defaultDate = "", moodPickerSlot, isAuthenticated } = props;
  const [isPreview, setIsPreview] = useState(false);
  const liveContent = useContent();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full mx-auto flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-10 shrink-0">{children}</div>
        <EntryDate date={entry && entry.date ? entry.date : defaultDate} />
        <div className="mt-5 mb-4">
          {isAuthenticated ? (
            <TitleInput title={entry?.title} className="title-input" />
          ) : (
            <h1 className="title-input cursor-default">{entry?.title || "Untitled"}</h1>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap mb-6">
          {moodPickerSlot}
          <Tags tags={entry?.tags} isAuthenticated={isAuthenticated} />
          <ColorPicker initialColor={entry?.color} />
        </div>

        <div className="h-px bg-border mb-7 shrink-0" />

        <div className="flex-1 flex flex-col min-h-72">
          {isAuthenticated && (
            <ContentInput
              content={entry?.content}
              className={clsx("content-input flex-1 min-h-72 focus:outline-none", isPreview && "hidden")}
            />
          )}
          {(isAuthenticated ? isPreview : true) && (
            <div className="content-input prose-journal flex-1 overflow-y-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={mdComponents}>
                {isAuthenticated ? liveContent : (entry?.content ?? "")}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border shrink-0">
          <div className="flex items-center gap-2 text-ink-faint">
            <WordCount content={entry?.content} />
            <span className="opacity-30">·</span>
            <CharCount content={entry?.content} />
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setIsPreview((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink-secondary transition-colors duration-150 cursor-pointer"
            >
              {isPreview ? <PencilLine size={12} strokeWidth={1.5} /> : <Eye size={12} strokeWidth={1.5} />}
              {isPreview ? "Edit" : "Preview"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
