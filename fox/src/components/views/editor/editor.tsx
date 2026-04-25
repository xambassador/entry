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
    <div className="flex flex-col flex-1 gap-5 h-full">
      <div className="flex items-center justify-between">{children}</div>
      <div className="open-diary overflow-hidden w-full flex-1 min-h-0 flex flex-col relative bg-transparent rounded-3xl">
        {elements.diaryEdgeTop}
        {elements.diaryEdgeBottom}
        <div className="flex flex-1 min-h-0">
          <div className="open-diary-left open-diary-paper-texture relative w-1/2 flex flex-col justify-between p-8 max-[900px]:w-full max-[900px]:p-6 bg-journal-surface z-2 shrink-0 rounded-l-3xl">
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
          <div className="open-diary-right open-diary-paper-texture w-1/2 max-[900px]:w-full relative shrink-0 rounded-r-3xl bg-journal-page">
            <div className="relative z-3 h-full flex flex-col px-8 pt-8 pb-12">
              {isAuthenticated ? (
                <TitleInput title={entry?.title} className="title-input" />
              ) : (
                <h1 className="title-input">{entry?.title}</h1>
              )}
              {elements.glitDimBorder}
              {isAuthenticated ? (
                <ContentInput content={entry?.content} className="open-diary-textarea content-input" />
              ) : (
                <p className="open-diary-textarea content-input">{entry?.content}</p>
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
