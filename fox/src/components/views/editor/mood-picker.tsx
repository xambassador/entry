import type { Mood } from "@/types";

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/cn";

import { updateMood, useMood } from "./store";

const MOOD_COLORS: Record<string, string> = {
  joyful: "#F5D45E",
  calm: "#5BC4BE",
  reflective: "#A893D4",
  anxious: "#E8836A",
  grateful: "#E0A86E",
  creative: "#F0A0E0",
  tired: "#8A9AAE",
  excited: "#FF7A7A",
  melancholy: "#6E94B8",
  peaceful: "#7ED4A0"
};

export const MOOD_EMOJI: Record<string, string> = {
  joyful: "😊",
  calm: "😌",
  reflective: "🤔",
  anxious: "😰",
  grateful: "🙏",
  great: "🙏",
  creative: "✨",
  tired: "😴",
  excited: "🎉",
  melancholy: "🌧️",
  peaceful: "🕊️"
};

const ALL_MOODS: Mood[] = [
  "joyful",
  "calm",
  "reflective",
  "anxious",
  "grateful",
  "creative",
  "tired",
  "excited",
  "melancholy",
  "peaceful"
];

export function MoodPicker(props: { mood?: Mood }) {
  const { mood: initialMood } = props;
  const mood = useMood();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!initialMood) return;
    updateMood(initialMood);
    return () => updateMood(null);
  }, [initialMood]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-3 cursor-pointer group">
          <div
            className="wax-seal"
            style={
              mood
                ? {
                    background: `radial-gradient(circle at 35% 35%, ${MOOD_COLORS[mood]}CC 0%, ${MOOD_COLORS[mood]}99 60%, ${MOOD_COLORS[mood]}66 100%)`
                  }
                : undefined
            }
          >
            <span className="text-[14px]">{mood ? MOOD_EMOJI[mood] : "?"}</span>
          </div>
          {mood ? (
            <span className="text-sm capitalize text-ink-muted font-medium">Feeling {mood}</span>
          ) : (
            <span className="text-sm italic text-ink-faint">How are you feeling?</span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="bg-journal-elevated border border-border-strong rounded-xl p-4 shadow-2xl shadow-black/40 z-50"
        >
          <p className="text-sm font-mono text-ink-muted tracking-wider uppercase mb-3">How are you feeling?</p>
          <div className="grid grid-cols-5 gap-2">
            {ALL_MOODS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  updateMood(m);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                  mood === m ? "bg-gilt/15 ring-1 ring-gilt/30" : "hover:bg-journal-hover"
                )}
              >
                <span className="text-lg">{MOOD_EMOJI[m!]}</span>
                <span className="text-xs font-mono text-ink-muted capitalize">{m}</span>
              </button>
            ))}
          </div>
          <Popover.Arrow className="fill-journal-elevated" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
