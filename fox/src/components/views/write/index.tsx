import type { GetEntryResponse } from "@/types";

import { useEffect, useState } from "react";

import { Editor } from "@/components/views/editor/editor";

import { getEntryById } from "@/lib/api";

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
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Could not load entry" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto w-full">
        <nav className="h-(--nav-height) flex items-center border-b border-border justify-between">
          <a href="/">
            <h1 className="text-2xl font-bold">Entry</h1>
          </a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto w-full h-[calc(100vh-var(--nav-height))] py-10">
        {state.status === "loading" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-ink-muted text-sm tracking-wide">Loading entry...</p>
          </div>
        )}
        {state.status === "error" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-wax text-sm">{state.message}</p>
          </div>
        )}
        {state.status === "ready" && <Editor entry={state.entry} />}
      </main>
    </div>
  );
}
