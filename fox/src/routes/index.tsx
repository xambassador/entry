import { createFileRoute } from "@tanstack/react-router";

import { RouteError } from "@/components/route-error";
import { YearAtGlance, YearAtGlanceContainer } from "@/components/year-at-glance";

import { getYearAtGlance } from "@/lib/api";
import { CURRENT_YEAR } from "@/lib/constant";

function parseYear(searchYear: number | undefined): number {
  if (searchYear === undefined) {
    return CURRENT_YEAR;
  }
  return searchYear;
}

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: { year?: number }) => ({ year: parseYear(search.year) }),
  loaderDeps: ({ search }) => ({ year: search.year }),
  loader: ({ deps, abortController }) => getYearAtGlance(deps.year, abortController.signal),
  errorComponent: ({ error }) => {
    return <RouteError error={error} />;
  },
  pendingComponent: () => {
    return (
      <YearAtGlanceContainer>
        <div className="size-full grid place-items-center">
          <p className="text-ink-faint text-sm font-light tracking-wide">Loading...</p>
        </div>
      </YearAtGlanceContainer>
    );
  }
});

function Index() {
  const res = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <YearAtGlance
      data={res}
      year={search.year}
      onYearChange={(nextYear) => navigate({ to: "/", search: { year: nextYear } })}
    />
  );
}
