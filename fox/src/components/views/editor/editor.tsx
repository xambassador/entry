import type { GetEntryResponse } from "@/types";
import type { Components } from "react-markdown";

import { useState } from "react";
import clsx from "clsx";
import { Eye, PencilLine } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { Tags } from "@/components/views/editor/tags";

import { EntryDate } from "./date-header";
import * as elements from "./elements";
import { CharCount, WordCount } from "./footer";
import { ContentInput, TitleInput } from "./form-elements";
import { useContent } from "./store";

import "./editor.css";

type Props = {
  entry?: GetEntryResponse;
  children?: React.ReactNode;
  moodPickerSlot?: React.ReactNode;
  isAuthenticated?: boolean;
};

const mdComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">
      {children}
    </a>
  )
};

export function Editor(props: Props) {
  const { entry, children, moodPickerSlot, isAuthenticated } = props;
  const [isPreview, setIsPreview] = useState(false);
  const liveContent = useContent();

  return (
    <div className="flex flex-col flex-1 gap-5 h-full px-4 max-[900px]:overflow-y-auto">
      <div className="flex items-center justify-between">{children}</div>
      <div className="open-diary overflow-hidden w-full flex-1 min-h-0 flex flex-col relative bg-transparent rounded-3xl max-[900px]:flex-none">
        {elements.diaryEdgeTop}
        {elements.diaryEdgeBottom}
        <div className="flex flex-1 min-h-0 max-[900px]:flex-col">
          <div className="open-diary-left open-diary-paper-texture relative w-1/2 flex flex-col justify-between p-8 max-[900px]:w-full max-[900px]:p-6 bg-journal-surface z-2 shrink-0 rounded-l-3xl max-[900px]:rounded-l-none max-[900px]:rounded-t-3xl">
            <div className="relative z-3 space-y-6">
              <EntryDate date={entry?.date} />
              {elements.ornament}
              {elements.quote}
              <div>
                {moodLabel}
                {moodPickerSlot}
              </div>
              <Tags tags={entry?.tags} isAuthenticated={isAuthenticated} />
            </div>
            <div className="relative z-3 flex items-end justify-between mt-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <WordCount content={entry?.content} />
                  <CharCount content={entry?.content} />
                </div>
              </div>
            </div>
          </div>
          {elements.diaryFold}
          <div className="open-diary-right open-diary-paper-texture w-1/2 max-[900px]:w-full relative shrink-0 rounded-r-3xl bg-journal-page max-[900px]:rounded-r-none max-[900px]:rounded-b-3xl max-[900px]:min-h-80">
            <div className="relative z-3 h-full flex flex-col px-8 pt-8 pb-12 max-[900px]:h-auto">
              {isAuthenticated ? (
                <TitleInput title={entry?.title} className="title-input" />
              ) : (
                <h1 className="title-input">{entry?.title}</h1>
              )}
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-px bg-gilt-dim" />
                {isAuthenticated && (
                  <button
                    onClick={() => setIsPreview((p) => !p)}
                    className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-ink-faint hover:text-ink-secondary transition-colors"
                  >
                    {isPreview ? <PencilLine size={12} strokeWidth={1.5} /> : <Eye size={12} strokeWidth={1.5} />}
                    {isPreview ? "Edit" : "Preview"}
                  </button>
                )}
              </div>
              {isAuthenticated && (
                <ContentInput
                  content={entry?.content}
                  className={clsx("open-diary-textarea content-input", isPreview && "hidden")}
                />
              )}
              {(isAuthenticated ? isPreview : true) && (
                <div className="open-diary-textarea content-input prose-journal overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={mdComponents}>
                    {isAuthenticated ? liveContent : (entry?.content ?? "")}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            {elements.diaryCurl}
          </div>
        </div>
      </div>
    </div>
  );
}

const moodLabel = <p className="text-[12px] tracking-widest uppercase mb-2 text-ink-faint">Mood</p>;
