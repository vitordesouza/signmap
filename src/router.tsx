import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 60_000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
