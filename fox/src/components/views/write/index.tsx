import type { GetEntryResponse } from "@/types";

import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import { Editor } from "@/components/views/editor/editor";

import { getEntryById } from "@/lib/api";
import { getErrorMessage } from "@/lib/api-error";

import { SaveButton } from "../editor/save-button";

const MoodPicker = lazy(() => import("@/components/views/editor/mood-picker").then((m) => ({ default: m.MoodPicker })));

type State =
  | { status: "ready"; entry?: GetEntryResponse }
  | { status: "loading" }
  | { status: "error"; message: string };

export function WriteApp() {
  const [state, setState] = useState<State>(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    return editId ? { status: "loading" } : { status: "ready" };
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (!editId) return;

    let cancelled = false;
    getEntryById(editId)
      .then((entry) => {
        if (!cancelled) setState({ status: "ready", entry });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", message: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="header">
        <nav className="nav">
          <a href="/" className="logo">
            <h1 className="text-2xl font-bold">Entry</h1>
          </a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto w-full h-[calc(100vh-var(--nav-height))] py-10">
        {state.status === "loading" && loadingEntry}
        {state.status === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-wax text-sm">{state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-border text-ink-muted hover:text-ink hover:bg-journal-hover transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw className="size-3.5" strokeWidth={1.5} />
              <span>Retry</span>
            </button>
          </div>
        )}
        {state.status === "ready" && (
          <Editor
            entry={state.entry}
            moodPickerSlot={
              <Suspense fallback={spinner}>
                <MoodPicker mood={state.entry?.mood} emoji={state.entry?.emoji} />
              </Suspense>
            }
            isAuthenticated
          >
            {backLink}
            <SaveButton entry={state.entry} />
          </Editor>
        )}
      </main>
    </div>
  );
}

const backLink = (
  <a href="/entries" className="back-link group">
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm font-body">Back to entries</span>
  </a>
);
const spinner = (
  <div className="wax-seal cursor-pointer shrink-0 transition-transform duration-150 active:scale-95">
    <Loader2 className="animate-spin size-4" />
  </div>
);
const loadingEntry = (
  <div className="flex items-center justify-center h-full">
    <p className="text-ink-muted text-sm tracking-wide">Loading entry...</p>
  </div>
);
