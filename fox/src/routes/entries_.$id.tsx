import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

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
  return <Editor entry={entry}>{backLink}</Editor>;
}

const backLink = (
  <Link to="/" className="back-link group">
    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
    <span className="text-sm font-body">Back to entries</span>
  </Link>
);
