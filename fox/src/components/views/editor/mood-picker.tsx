import { forwardRef, useEffect, useRef, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import * as Popover from "@radix-ui/react-popover";

import { updateEmoji, updateMood, useEmoji, useMood } from "./store";

interface EmojiSelection {
  native: string;
}

export function MoodPicker(props: { mood?: string; emoji?: string }) {
  const { mood: initialMood, emoji: initialEmoji } = props;
  const emoji = useEmoji();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasEmoji = emoji.length > 0;

  function handleEmojiSelect(selection: EmojiSelection) {
    updateEmoji(selection.native);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  useEffect(() => {
    if (initialMood) updateMood(initialMood);
    if (initialEmoji) updateEmoji(initialEmoji);
    return () => {
      updateMood("");
      updateEmoji("");
    };
  }, [initialMood, initialEmoji]);

  return (
    <div>
      {label}
      <div className="flex items-center gap-3">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              className="wax-seal cursor-pointer shrink-0 transition-transform duration-150 active:scale-95"
              aria-label="Pick an emoji"
            >
              <span className="text-base leading-none">{hasEmoji ? emoji : "?"}</span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              sideOffset={10}
              align="start"
              className="emoji-picker-popover z-50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden border border-gilt-dim"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
                set="native"
                autoFocus
              />
              <Popover.Arrow className="fill-journal-surface" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <MoodInput ref={inputRef} />
      </div>
    </div>
  );
}

const MoodInput = forwardRef<HTMLInputElement>(function MoodInput(_, ref) {
  const mood = useMood();
  return (
    <div className="min-w-0 flex-1">
      <input
        type="text"
        ref={ref}
        value={mood}
        onChange={(e) => updateMood(e.target.value)}
        placeholder="How are you feeling?"
        maxLength={80}
        className="w-full bg-transparent text-xs tracking-wider text-ink-muted caret-gilt placeholder:text-ink-faint placeholder:italic focus:outline-none"
      />
    </div>
  );
});

const label = <p className="text-[12px] tracking-widest uppercase mb-2 text-ink-faint">Mood</p>;
