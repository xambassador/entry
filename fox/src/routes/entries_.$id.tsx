import { lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { PaperSheet } from "@/components/paper-sheet";
import { RouteError } from "@/components/route-error";
import { Editor } from "@/components/views/editor/editor";
import { EditorSkeleton } from "@/components/views/editor/editor-skeleton";
import { SaveButton } from "@/components/views/editor/save-button";
import { useColor } from "@/components/views/editor/store";

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
  },
  pendingComponent: () => <EditorSkeleton />
});

function RouteComponent() {
  const entry = Route.useLoaderData();
  const auth = useAuth();
  const color = useColor();
  return (
    <div
      className="w-full h-full overflow-y-auto py-8 sm:px-6 px-2"
      style={
        {
          "--card-color": color
        } as Record<string, string>
      }
    >
      <div className="flex min-h-full w-full">
        <div className="w-full max-w-[var(--content-max-width)] m-auto max-h-[var(--content-max-height)] h-[var(--content-max-height)]">
          <PaperSheet className="h-full w-full">
            <div className="h-full overflow-hidden pt-6 pr-4 pb-2 pl-11 sm:pr-6 sm:pl-12">
              <Editor
                color={entry.color}
                entry={entry}
                moodPickerSlot={
                  auth.isAuthenticated ? (
                    <Suspense fallback={emojiSpinner}>
                      <MoodPicker mood={entry.mood} emoji={entry.emoji} />
                    </Suspense>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="size-8 rounded-lg bg-surface-card border border-border flex items-center justify-center shrink-0">
                        <span className="text-base leading-none">{entry.emoji || "·"}</span>
                      </span>
                      <span className="text-sm text-ink-muted">{entry.mood}</span>
                    </div>
                  )
                }
                isAuthenticated={auth.isAuthenticated}
              >
                {backLink}
                {auth.isAuthenticated && <SaveButton entry={entry} />}
              </Editor>
            </div>
          </PaperSheet>
        </div>
      </div>
    </div>
  );
}

const backLink = (
  <Link
    to="/"
    className="back-link group focus-ring"
    search={(prev) => ({ month: prev.month ?? CURRENT_MONTH, year: prev.year || CURRENT_YEAR })}
  >
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm">Entries</span>
  </Link>
);

const emojiSpinner = (
  <div className="size-8 rounded-lg bg-surface-card border border-border flex items-center justify-center shrink-0">
    <Loader2 className="animate-spin size-4 text-ink-muted" />
  </div>
);
