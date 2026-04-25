import type { GetEntryResponse } from "@/types";

import { useState, useTransition } from "react";
import { Check, Loader2, Save } from "lucide-react";

import { createEntry, updateEntry } from "@/lib/api";
import { getErrorMessage, isErrorCode } from "@/lib/api-error";
import { cn } from "@/lib/cn";

import { useContent, useEmoji, useMood, useTags, useTitle } from "./store";

type SaveState = "idle" | "saved" | "error";
type ButtonProps = React.ComponentProps<"button">;
type Props = { entry?: GetEntryResponse };

export function SaveButton({ entry }: Props) {
  const { isPending, label, props, state } = useSubmit(entry);
  return (
    <button className={cn(defaultStyles, state === "error" && "text-red-400", "disabled:opacity-50")} {...props}>
      {isPending && spinner}
      {state === "saved" && check}
      {saveIcon}
      <span className="tracking-wide">{label}</span>
      {shimmer}
    </button>
  );
}

function Overlay(props: React.PropsWithChildren) {
  return (
    <div className="absolute inset-0 bg-journal-elevated/50 backdrop-blur-sm flex items-center justify-center">
      {props.children}
    </div>
  );
}

const defaultStyles =
  "group relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer select-none disabled:cursor-not-allowed text-ink-muted active:scale-[0.98] bg-journal-card border-journal-elevated hover:bg-journal-page transition-all duration-200 ease-active overflow-hidden";
const spinner = (
  <Overlay>
    <Loader2 className="animate-spin transition-transform duration-200 size-4" />
  </Overlay>
);
const shimmer = (
  <span
    className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    style={{
      background: "radial-gradient(ellipse 60% 80% at 50% 50%, oklch(0.7569 0.0976 190.25 / 4%) 0%, transparent 70%)"
    }}
  />
);
const check = (
  <Overlay>
    <Check className="size-3.5" />
  </Overlay>
);
const saveIcon = <Save className="size-3.5" strokeWidth={1.75} />;

function useSubmit(entry?: GetEntryResponse) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const title = useTitle();
  const content = useContent();
  const mood = useMood();
  const emoji = useEmoji();
  const tags = useTags();

  const isEdit = Boolean(entry?.id);
  const isDisabled = !title.trim() || !content.trim() || !emoji || !mood || isPending;

  const handleSave = () => {
    if (isDisabled) return;
    if (isPending) return;
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
        const msg = isErrorCode(err, "entry_exists") ? "Entry already exists for this date" : getErrorMessage(err);
        setState("error");
        setErrorMsg(msg);
        setTimeout(() => setState("idle"), 3000);
      }
    });
  };

  let label = isEdit ? "Save changes" : "Save entry";
  if (state === "error") {
    label = errorMsg || "Failed";
  }

  const props: ButtonProps = {
    onClick: handleSave,
    disabled: isDisabled,
    title: state === "error" ? errorMsg : undefined,
    "aria-label": label,
    "aria-disabled": isDisabled
  };

  return { props, state, isPending, label };
}
