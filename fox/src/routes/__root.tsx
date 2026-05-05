import { Fragment } from "react/jsx-runtime";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Nav } from "@/components/nav";
import { NotFound } from "@/components/not-found";
import { RouteError } from "@/components/route-error";

function RootLayout() {
  return (
    <Fragment>
      <Nav />
      <main className="max-w-6xl mx-auto w-full min-h-227 h-[calc(100vh-var(--nav-height))] py-10 px-4 sm:px-6 lg:px-0">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </Fragment>
  );
}

function RootErrorComponent({ error }: { error: unknown }) {
  return (
    <Fragment>
      <Nav />
      <main className="max-w-6xl mx-auto w-full h-[calc(100vh-var(--nav-height))] py-10 px-4 sm:px-6 lg:px-0">
        <RouteError error={error} />
      </main>
    </Fragment>
  );
}

function RootNotFound() {
  return <NotFound />;
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFound
});
