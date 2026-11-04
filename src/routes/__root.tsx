import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { SettingsProvider } from "../lib/settings";
import { WorkspaceProvider } from "../lib/workspace";
import styles from "../style.css?url";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mapa — A map of your beginning" },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
    ],
  }),
  component: Root,
  notFoundComponent: () => (
    <main>
      <h1>Page not found.</h1>
      <Link to="/">Return to your chart</Link>
    </main>
  ),
  errorComponent: ({ error, reset }) => (
    <main>
      <h1>Something interrupted the page.</h1>
      <p>{error instanceof Error ? error.message : "Please try again."}</p>
      <button onClick={reset}>Try again</button>
    </main>
  ),
});
function Root() {
  const { queryClient } = Route.useRouteContext();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <WorkspaceProvider>
              <header>
                <Link className="brand" to="/">
                  ✳ mapa<span>ASTROLOGY, WITH PERSPECTIVE</span>
                </Link>
                <nav>
                  <Link
                    to="/"
                    activeProps={{ className: "active" }}
                    activeOptions={{ exact: true }}
                  >
                    Natal chart
                  </Link>
                  <Link to="/settings" activeProps={{ className: "active" }}>
                    Settings
                  </Link>
                </nav>
                <span className="edition">THE CELESTIAL ATLAS / VOL. 01</span>
              </header>
              <Outlet />
              <footer className="site-footer">
                <span>MAPA — AN EXPLORATION OF SELF & SKY</span>
                <span>Swiss Ephemeris · Built with TanStack Start</span>
              </footer>
            </WorkspaceProvider>
          </SettingsProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
