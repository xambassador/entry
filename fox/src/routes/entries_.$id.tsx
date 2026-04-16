import { lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Editor } from "@/components/views/editor/editor";
import { SaveButton } from "@/components/views/editor/save-button";

import { getEntryById } from "@/lib/api";

const MoodPicker = lazy(() => import("@/components/views/editor/mood-picker").then((m) => ({ default: m.MoodPicker })));

export const Route = createFileRoute("/entries_/$id")({
  component: RouteComponent,
  loader: (ctx) => {
    const { id } = ctx.params;
    return getEntryById(id);
  }
});

function RouteComponent() {
  const entry = Route.useLoaderData();
  const auth = useAuth();
  const isAuthenticated = auth.status === "success" && auth.isAuthenticated;

  return (
    <Editor
      entry={entry}
      moodPickerSlot={
        isAuthenticated ? (
          <Suspense fallback={spinner}>
            <MoodPicker mood={entry?.mood} emoji={entry?.emoji} />
          </Suspense>
        ) : (
          <span className="wax-seal cursor-pointer shrink-0 transition-transform duration-150 active:scale-95">
            <span className="text-base leading-none">{entry?.emoji ? entry.emoji : "?"}</span>
          </span>
        )
      }
    >
      {backLink}
      {auth.status === "success" && auth.isAuthenticated && <SaveButton entry={entry} />}
    </Editor>
  );
}

const backLink = (
  <Link to="/" className="back-link group">
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm font-body">Back to entries</span>
  </Link>
);

const spinner = (
  <div className="wax-seal cursor-pointer shrink-0 transition-transform duration-150 active:scale-95">
    <Loader2 className="animate-spin size-4" />
  </div>
);
