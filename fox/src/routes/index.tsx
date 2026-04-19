import { createFileRoute } from "@tanstack/react-router";

import { RouteError } from "@/components/route-error";
import { YearAtGlance } from "@/components/year-at-glance";

import { getYearAtGlance } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => getYearAtGlance(),
  errorComponent: ({ error }) => {
    return <RouteError error={error} />;
  }
});

function Index() {
  const res = Route.useLoaderData();
  return <YearAtGlance data={res} />;
}
