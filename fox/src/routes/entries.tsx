import { createFileRoute, redirect } from "@tanstack/react-router";

import { CURRENT_MONTH, CURRENT_YEAR } from "@/lib/constant";

export const Route = createFileRoute("/entries")({
  loader: () => {
    throw redirect({ to: "/", search: { year: CURRENT_YEAR, month: CURRENT_MONTH } });
  }
});
