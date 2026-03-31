import type { GetEntryResponse, Mood } from "@/types";

import { MoodPicker } from "@/components/views/editor/mood-picker";
import { Tags } from "@/components/views/editor/tags";

import { EntryDate } from "./date-header";
import * as elements from "./elements";
import { CharCount, WordCount } from "./footer";
import { ContentInput, TitleInput } from "./form-elements";
import { SaveButton } from "./save-button";

import "./editor.css";

type Props = { entry?: GetEntryResponse };

export function Editor(props: Props) {
  const { entry } = props;

  return (
    <div className="flex flex-col flex-1 gap-5 h-full">
      <div className="flex items-center justify-between">
        {elements.backToEntries}
        <SaveButton entry={entry} />
      </div>
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
                {elements.moodText}
                <MoodPicker mood={entry?.mood as Mood} />
              </div>
              <Tags tags={entry?.tags} />
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
              <TitleInput title={entry?.title} />
              {elements.glitDimBorder}
              <ContentInput content={entry?.content} />
            </div>
            {elements.diaryCurl}
          </div>
        </div>
      </div>
    </div>
  );
}
