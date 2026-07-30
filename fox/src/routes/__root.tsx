import { Fragment } from "react/jsx-runtime";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { NotFound } from "@/components/not-found";
import { RouteError } from "@/components/route-error";
import { CalendarSkeleton } from "@/components/views/month/calendar-skeleton";

function RootLayout() {
  return (
    <Fragment>
      <main className="w-full h-screen">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </Fragment>
  );
}

function RootErrorComponent({ error }: { error: unknown }) {
  return (
    <main className="max-w-6xl mx-auto w-full h-[calc(100vh-var(--nav-height))] py-10 px-4 sm:px-6 lg:px-0">
      <RouteError error={error} />
    </main>
  );
}

function RootNotFound() {
  return <NotFound />;
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFound,
  pendingComponent: CalendarSkeleton
});
