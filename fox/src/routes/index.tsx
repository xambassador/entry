import { createFileRoute } from "@tanstack/react-router";

import { YearAtGlance } from "@/components/year-at-glance";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return <YearAtGlance />;
}
