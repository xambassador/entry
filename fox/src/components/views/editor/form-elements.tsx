import { useEffect } from "react";

import { updateContent, updateTitle } from "./store";

export function TitleInput(props: { title?: string }) {
  const { title: defaultValue } = props;

  useEffect(() => {
    updateTitle(defaultValue || "");
  }, [defaultValue]);

  return (
    <input
      type="text"
      defaultValue={defaultValue}
      onChange={(e) => {
        updateTitle(e.target.value);
      }}
      placeholder="Give this entry a title..."
      className="w-full bg-transparent font-display text-2xl font-light tracking-wide outline-none mb-4 text-ink"
    />
  );
}

export function ContentInput(props: { content?: string }) {
  const { content: defaultValue } = props;

  useEffect(() => {
    updateContent(defaultValue || "");
  }, [defaultValue]);

  return (
    <textarea
      defaultValue={defaultValue}
      onChange={(e) => {
        updateContent(e.target.value);
      }}
      placeholder="Dear diary, today I..."
      className="open-diary-textarea flex-1 min-h-105 bg-transparent text-ink caret-gilt resize-none text-base w-full border-none p-0 placeholder:italic placeholder:text-ink-faint"
      spellCheck={false}
    />
  );
}
