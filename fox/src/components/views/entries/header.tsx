import { getRouteApi } from "@tanstack/react-router";

export function Header() {
  const routerCache = getRouteApi("/entries");
  const { total } = routerCache.useLoaderData();
  return (
    <div className="flex items-baseline justify-between pt-2 px-1">
      <h1 className="font-light text-ink text-2xl tracking-wide">Index</h1>
      <span className="text-ink-faint tracking-widest text-[11px] tabular-nums">
        {total} {total === 1 ? "entry" : "entries"}
      </span>
    </div>
  );
}
