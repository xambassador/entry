import type { NoteColor } from "@/lib/journal";

import { lazy, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { PaperSheet } from "@/components/paper-sheet";
import { Editor } from "@/components/views/editor/editor";

import { SaveButton } from "../editor/save-button";

const FRESH_PAPER: NoteColor = { name: "cream", bg: "#FBF7F0", ink: "#3a352e", muted: "#8f887c" };
const MoodPicker = lazy(() => import("@/components/views/editor/mood-picker").then((m) => ({ default: m.MoodPicker })));

export function WriteApp() {
  return (
    <main className="w-full h-screen">
      <div className="w-full h-full overflow-y-auto py-8 sm:px-6 px-2">
        <div className="flex min-h-full w-full">
          <div className="w-full max-w-[var(--content-max-width)] m-auto max-h-[var(--content-max-height)] h-[var(--content-max-height)]">
            <div className="h-full w-full">
              <PaperSheet color={FRESH_PAPER} className="h-full w-full">
                <div className="h-full overflow-hidden pt-6 pr-4 pb-2 pl-11 sm:pr-6 sm:pl-12">
                  <Editor
                    moodPickerSlot={
                      <Suspense fallback={emojiSpinner}>
                        <MoodPicker />
                      </Suspense>
                    }
                    isAuthenticated
                  >
                    {backLink}
                    <SaveButton />
                  </Editor>
                </div>
              </PaperSheet>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const backLink = (
  <a href="/" className="back-link group">
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm">Entries</span>
  </a>
);

const emojiSpinner = (
  <div className="size-8 rounded-lg bg-surface-card border border-border flex items-center justify-center shrink-0">
    <Loader2 className="animate-spin size-4 text-ink-muted" />
  </div>
);
