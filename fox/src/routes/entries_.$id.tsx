import { createFileRoute } from "@tanstack/react-router";

import { Editor } from "@/components/views/editor/editor";

import { getEntryById } from "@/lib/api";

export const Route = createFileRoute("/entries_/$id")({
  component: RouteComponent,
  loader: (ctx) => {
    const { id } = ctx.params;
    return getEntryById(id);
  }
});

function RouteComponent() {
  const entry = Route.useLoaderData();
  return <Editor entry={entry} />;
}
