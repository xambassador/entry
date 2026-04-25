import { lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { RouteError } from "@/components/route-error";
import { Editor } from "@/components/views/editor/editor";
import { SaveButton } from "@/components/views/editor/save-button";

import { getEntryById } from "@/lib/api";
import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

const MoodPicker = lazy(() => import("@/components/views/editor/mood-picker").then((m) => ({ default: m.MoodPicker })));

export const Route = createFileRoute("/entries_/$id")({
  component: RouteComponent,
  loader: (ctx) => {
    const { id } = ctx.params;
    return getEntryById(id);
  },
  errorComponent: ({ error }) => {
    return <RouteError error={error} />;
  }
});

function RouteComponent() {
  const entry = Route.useLoaderData();
  const auth = useAuth();

  return (
    <Editor
      entry={entry}
      moodPickerSlot={
        auth.isAuthenticated ? (
          <Suspense fallback={spinner}>
            <MoodPicker mood={entry?.mood} emoji={entry?.emoji} />
          </Suspense>
        ) : (
          <span className="wax-seal cursor-pointer shrink-0 transition-transform duration-150 active:scale-95">
            <span className="text-base leading-none">{entry?.emoji ? entry.emoji : "?"}</span>
          </span>
        )
      }
      isAuthenticated={auth.isAuthenticated}
    >
      {backLink}
      {auth.isAuthenticated && <SaveButton entry={entry} />}
    </Editor>
  );
}

const backLink = (
  <Link
    to="/entries"
    className="back-link group"
    search={(prev) => ({ month: prev.month ?? CURRENT_MONTH, year: prev.year || CURRENT_YEAR })}
  >
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm font-body">Back to entries</span>
  </Link>
);

const spinner = (
  <div className="wax-seal cursor-pointer shrink-0 transition-transform duration-150 active:scale-95">
    <Loader2 className="animate-spin size-4" />
  </div>
);
