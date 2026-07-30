import { PaperSheet } from "@/components/paper-sheet";

export function EditorSkeleton() {
  return (
    <div className="w-full h-full overflow-y-auto py-8 sm:px-6 px-2">
      <div className="flex min-h-full w-full">
        <div className="w-full max-w-[var(--content-max-width)] m-auto max-h-[var(--content-max-height)] h-[var(--content-max-height)]">
          <PaperSheet className="h-full w-full">
            <div className="h-full overflow-hidden pt-6 pr-4 pb-2 pl-11 sm:pr-6 sm:pl-12">
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="w-full mx-auto flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-10 shrink-0">
                    <div className="h-4 w-20 rounded bg-surface-raised animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-surface-raised animate-pulse" />
                  </div>

                  <div className="h-3 w-24 rounded bg-surface-raised animate-pulse" />

                  <div className="mt-5 mb-4">
                    <div className="h-8 w-2/3 rounded bg-surface-raised animate-pulse" />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mb-6">
                    <div className="size-8 rounded-lg bg-surface-raised animate-pulse shrink-0" />
                    <div className="h-6 w-16 rounded-full bg-surface-raised animate-pulse" />
                    <div className="h-6 w-20 rounded-full bg-surface-raised animate-pulse" />
                  </div>

                  <div className="h-px bg-border mb-7 shrink-0" />

                  <div className="flex-1 flex flex-col min-h-72 gap-3.5">
                    <div className="h-4 w-full rounded bg-surface-raised animate-pulse" />
                    <div className="h-4 w-full rounded bg-surface-raised animate-pulse" />
                    <div className="h-4 w-5/6 rounded bg-surface-raised animate-pulse" />
                    <div className="h-4 w-full rounded bg-surface-raised animate-pulse" />
                    <div className="h-4 w-3/4 rounded bg-surface-raised animate-pulse" />
                    <div className="h-4 w-1/2 rounded bg-surface-raised animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-border shrink-0">
                    <div className="h-3 w-28 rounded bg-surface-raised animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </PaperSheet>
        </div>
      </div>
    </div>
  );
}
