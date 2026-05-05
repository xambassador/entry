import type { GetEntryResponse } from "@/types";

import { Tags } from "@/components/views/editor/tags";

import { EntryDate } from "./date-header";
import * as elements from "./elements";
import { CharCount, WordCount } from "./footer";
import { ContentInput, TitleInput } from "./form-elements";

import "./editor.css";

type Props = {
  entry?: GetEntryResponse;
  children?: React.ReactNode;
  moodPickerSlot?: React.ReactNode;
  isAuthenticated?: boolean;
};

export function Editor(props: Props) {
  const { entry, children, moodPickerSlot, isAuthenticated } = props;

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
              {elements.glitDimBorder}
              {isAuthenticated ? (
                <ContentInput content={entry?.content} className="open-diary-textarea content-input" />
              ) : (
                <p className="open-diary-textarea content-input whitespace-pre-wrap">{renderContentWithLinks(entry?.content)}</p>
              )}
            </div>
            {elements.diaryCurl}
          </div>
        </div>
      </div>
    </div>
  );
}

const urlSplitRegex = /(\b(?:https?:\/\/|www\.)[^\s]+)/gi;
const urlTokenRegex = /^(?:https?:\/\/|www\.)[^\s]+$/i;

function renderContentWithLinks(content?: string) {
  if (!content) {
    return null;
  }

  const parts = content.split(urlSplitRegex);

  return parts.map((part, index) => {
    if (!urlTokenRegex.test(part)) {
      return <span key={`text-${index}`}>{part}</span>;
    }

    const { coreUrl, trailingPunctuation } = splitTrailingPunctuation(part);

    if (!coreUrl) {
      return <span key={`text-${index}`}>{part}</span>;
    }

    const href = coreUrl.startsWith("www.") ? `https://${coreUrl}` : coreUrl;

    return (
      <span key={`link-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 break-all"
        >
          {coreUrl}
        </a>
        {trailingPunctuation}
      </span>
    );
  });
}

function splitTrailingPunctuation(url: string) {
  let coreUrl = url;
  let trailingPunctuation = "";

  while (/[),.!?;:]/.test(coreUrl[coreUrl.length - 1] ?? "")) {
    trailingPunctuation = `${coreUrl[coreUrl.length - 1]}${trailingPunctuation}`;
    coreUrl = coreUrl.slice(0, -1);
  }

  return { coreUrl, trailingPunctuation };
}

const moodLabel = <p className="text-[12px] tracking-widest uppercase mb-2 text-ink-faint">Mood</p>;
