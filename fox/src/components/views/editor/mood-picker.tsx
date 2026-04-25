import { forwardRef, lazy, Suspense, useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Loader2 } from "lucide-react";

import { updateEmoji, updateMood, useEmoji, useMood } from "./store";

const Picker = lazy(() => import("@emoji-mart/react"));

interface EmojiSelection {
  native: string;
}

export function MoodPicker(props: { mood?: string; emoji?: string }) {
  const { mood: initialMood, emoji: initialEmoji } = props;
  const emoji = useEmoji();
  const [open, setOpen] = useState(false);
  const [emojiData, setEmojiData] = useState<unknown>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasEmoji = emoji.length > 0;

  useEffect(() => {
    if (open && !emojiData) {
      import("@emoji-mart/data").then((mod) => setEmojiData(mod.default));
    }
  }, [open, emojiData]);

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
    <div className="flex items-center gap-3">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className="wax-seal cursor-pointer shrink-0 active:scale-[0.96] transition-transform duration-150 ease-active focus-ring"
            aria-label="Pick an emoji"
          >
            <span className="text-base leading-none">{hasEmoji ? emoji : "?"}</span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={10}
            align="start"
            className="emoji-picker-popover z-50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden border border-gilt-dim origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out"
          >
            <Suspense fallback={spinner}>
              {emojiData ? (
                <Picker
                  data={emojiData}
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                  previewPosition="none"
                  skinTonePosition="none"
                  set="native"
                  autoFocus
                />
              ) : null}
            </Suspense>
            <Popover.Arrow className="fill-journal-surface" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <MoodInput ref={inputRef} />
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

const spinner = (
  <div className="w-88 h-108.75 bg-journal-surface flex items-center justify-center">
    <Loader2 className="animate-spin text-ink-muted" size={24} />
  </div>
);
