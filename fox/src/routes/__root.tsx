import { Fragment } from "react/jsx-runtime";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Nav } from "@/components/nav";

function RootLayout() {
  return (
    <Fragment>
      <Nav />
      <main className="max-w-6xl mx-auto">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </Fragment>
  );
}

export const Route = createRootRoute({ component: RootLayout });
