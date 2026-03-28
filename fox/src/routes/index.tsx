import { createFileRoute } from "@tanstack/react-router";

import { YearAtGlance } from "@/components/year-at-glance";

import { getYearAtGlance } from "@/lib/api";

export const Route = createFileRoute("/")({ component: Index, loader: () => getYearAtGlance() });

function Index() {
  const res = Route.useLoaderData();
  return <YearAtGlance data={res} />;
}
