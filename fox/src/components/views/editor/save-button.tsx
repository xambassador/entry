import type { GetEntryResponse } from "@/types";

import { useCallback, useState, useTransition } from "react";
import { Check, Loader2, Save } from "lucide-react";

import { createEntry, updateEntry } from "@/lib/api";
import { getErrorMessage, isErrorCode } from "@/lib/api-error";
import { cn } from "@/lib/cn";

import { useContent, useEmoji, useMood, useTags, useTitle } from "./store";

type SaveState = "idle" | "saving" | "saved" | "error";
type Props = { entry?: GetEntryResponse };

export function SaveButton({ entry }: Props) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const title = useTitle();
  const content = useContent();
  const mood = useMood();
  const emoji = useEmoji();
  const tags = useTags();

  const isEdit = Boolean(entry?.id);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const today = new Date().toISOString().split("T")[0];
      try {
        if (isEdit && entry?.id) {
          await updateEntry(entry.id, {
            title,
            content,
            mood,
            emoji,
            tags,
            date: entry.date
          });
        } else {
          await createEntry({
            title,
            content,
            mood,
            emoji,
            tags,
            date: today
          });
        }
        setState("saved");
        setErrorMsg("");
        setTimeout(() => setState("idle"), 2200);
      } catch (err) {
        const msg = isErrorCode(err, "entry_exists")
          ? "Entry already exists for this date"
          : getErrorMessage(err);
        setState("error");
        setErrorMsg(msg);
        setTimeout(() => setState("idle"), 3000);
      }
    });
  }, [title, content, mood, emoji, tags, isEdit, entry]);

  const label = {
    idle: isEdit ? "Save changes" : "Save entry",
    saving: "Saving...",
    saved: "Saved",
    error: errorMsg || "Failed"
  }[state];

  return (
    <button
      onClick={handleSave}
      disabled={state === "saving"}
      aria-label={label}
      title={state === "error" ? errorMsg : undefined}
      className={cn(defaultStyles, state === "error" && "text-red-400")}
    >
      {state === "saved" && <Check className="size-3.5" />}
      {pending && spinner}
      {state === "idle" && <Save className="size-3.5" strokeWidth={1.75} />}
      <span className="tracking-wide">{label}</span>
      {state === "idle" && shimmer}
    </button>
  );
}

const defaultStyles =
  "group relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 cursor-pointer select-none disabled:cursor-not-allowed text-ink-muted active:scale-[0.97] bg-journal-card border-journal-elevated hover:bg-journal-page";
const spinner = <Loader2 className="animate-spin transition-transform duration-200" />;
const shimmer = (
  <span
    className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    style={{
      background: "radial-gradient(ellipse 60% 80% at 50% 50%, oklch(0.7569 0.0976 190.25 / 4%) 0%, transparent 70%)"
    }}
  />
);
