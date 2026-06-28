import { getRouteApi } from "@tanstack/react-router";

export function Header() {
  const route = getRouteApi("/");
  const { total } = route.useLoaderData();
  return (
    <div className="flex items-baseline gap-3">
      <h1 className="text-lg font-semibold text-ink tracking-tight">Entries</h1>
      <span className="text-ink-faint text-xs tabular-nums">{total}</span>
    </div>
  );
}
